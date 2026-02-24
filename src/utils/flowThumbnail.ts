import { Flow, Step } from '@/views/studio/types';

type Point = { x: number; y: number };
type NodeStyle = { fill: string; stroke: string };
type ThumbnailPalette = {
  start: NodeStyle;
  condition: NodeStyle;
  userTurn: NodeStyle;
  note: NodeStyle;
  turn: NodeStyle;
  edge: string;
};

type SizedNode = {
  step: Step;
  x: number;
  y: number;
  width: number;
  height: number;
};

const THUMBNAIL_WIDTH = 900;
const THUMBNAIL_HEIGHT = 600;
const THUMBNAIL_PADDING = 16;

const defaultStepSpacing = { x: 220, y: 120 };

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function getNodeSize(step: Step) {
  switch (step.type) {
    case 'start':
      return { width: 72, height: 34 };
    case 'condition':
      return { width: 126, height: 66 };
    case 'user-turn':
      return { width: 134, height: 60 };
    case 'note':
      return { width: 128, height: 74 };
    case 'turn':
    default:
      return { width: 138, height: 62 };
  }
}

function getNodeStyle(step: Step, palette: ThumbnailPalette): NodeStyle {
  switch (step.type) {
    case 'start':
      return palette.start;
    case 'condition':
      return palette.condition;
    case 'user-turn':
      return palette.userTurn;
    case 'note':
      return palette.note;
    case 'turn':
    default:
      return palette.turn;
  }
}

function tokenChannel(styles: CSSStyleDeclaration, tokenName: string) {
  return styles.getPropertyValue(tokenName).trim();
}

function tokenAlpha(styles: CSSStyleDeclaration, tokenName: string) {
  const value = styles.getPropertyValue(tokenName).trim();
  return value || '1';
}

function tokenColor(styles: CSSStyleDeclaration, tokenName: string, alpha = '1') {
  const channels = tokenChannel(styles, tokenName);
  if (!channels) return 'currentColor';
  return alpha === '1' ? `rgb(${channels})` : `rgb(${channels} / ${alpha})`;
}

function tokenColorWithAlpha(styles: CSSStyleDeclaration, tokenName: string, alphaTokenName: string) {
  return tokenColor(styles, tokenName, tokenAlpha(styles, alphaTokenName));
}

function buildThumbnailPalette(): ThumbnailPalette {
  const styles = window.getComputedStyle(document.documentElement);
  const accentSoft = tokenColorWithAlpha(styles, '--shell-accent-soft', '--shell-accent-soft-alpha');
  const surfaceSubtle = tokenColorWithAlpha(styles, '--shell-surface-subtle', '--shell-surface-subtle-alpha');

  return {
    start: {
      fill: tokenColor(styles, '--shell-surface'),
      stroke: tokenColor(styles, '--shell-border'),
    },
    condition: {
      fill: accentSoft,
      stroke: tokenColor(styles, '--shell-accent-border'),
    },
    userTurn: {
      fill: surfaceSubtle,
      stroke: tokenColor(styles, '--shell-accent'),
    },
    note: {
      fill: surfaceSubtle,
      stroke: tokenColor(styles, '--shell-border-subtle'),
    },
    turn: {
      fill: accentSoft,
      stroke: tokenColor(styles, '--shell-accent'),
    },
    edge: tokenColor(styles, '--shell-flow-edge', '0.5'),
  };
}

function getNodePosition(step: Step, index: number): Point {
  if (step.position) return step.position;
  return {
    x: index * defaultStepSpacing.x,
    y: index * defaultStepSpacing.y,
  };
}

function computeBounds(nodes: SizedNode[]) {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const node of nodes) {
    minX = Math.min(minX, node.x);
    minY = Math.min(minY, node.y);
    maxX = Math.max(maxX, node.x + node.width);
    maxY = Math.max(maxY, node.y + node.height);
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: Math.max(maxX - minX, 1),
    height: Math.max(maxY - minY, 1),
  };
}

function mapNodeIntoThumbnail(node: SizedNode, bounds: ReturnType<typeof computeBounds>) {
  const fitScale = Math.min(
    (THUMBNAIL_WIDTH - THUMBNAIL_PADDING * 2) / bounds.width,
    (THUMBNAIL_HEIGHT - THUMBNAIL_PADDING * 2) / bounds.height
  );
  const coverScale = Math.max(
    (THUMBNAIL_WIDTH - THUMBNAIL_PADDING * 2) / bounds.width,
    (THUMBNAIL_HEIGHT - THUMBNAIL_PADDING * 2) / bounds.height
  );
  // Mild zoom-in helps avoid large top/bottom dead zones for wide flows.
  const scale = Math.min(coverScale, fitScale * 1.25);

  const offsetX = (THUMBNAIL_WIDTH - bounds.width * scale) / 2;
  const offsetY = (THUMBNAIL_HEIGHT - bounds.height * scale) / 2;

  return {
    ...node,
    x: offsetX + (node.x - bounds.minX) * scale,
    y: offsetY + (node.y - bounds.minY) * scale,
    width: Math.max(node.width * scale, 10),
    height: Math.max(node.height * scale, 8),
  };
}

function nodeCenter(node: SizedNode): Point {
  return { x: node.x + node.width / 2, y: node.y + node.height / 2 };
}

function drawEdges(
  ctx: CanvasRenderingContext2D,
  mappedNodesById: Map<string, SizedNode>,
  flow: Flow,
  edgeColor: string
) {
  if (!flow.connections?.length) return;

  ctx.strokeStyle = edgeColor;
  ctx.lineWidth = 1.6;

  for (const connection of flow.connections) {
    const source = mappedNodesById.get(connection.source);
    const target = mappedNodesById.get(connection.target);
    if (!source || !target) continue;

    const start = nodeCenter(source);
    const end = nodeCenter(target);
    const dx = Math.max(Math.abs(end.x - start.x), 24);

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.bezierCurveTo(
      start.x + dx * 0.45,
      start.y,
      end.x - dx * 0.45,
      end.y,
      end.x,
      end.y
    );
    ctx.stroke();
  }
}

function drawNodes(ctx: CanvasRenderingContext2D, nodes: SizedNode[], palette: ThumbnailPalette) {
  for (const node of nodes) {
    const style = getNodeStyle(node.step, palette);

    roundedRect(ctx, node.x, node.y, node.width, node.height, 8);
    ctx.fillStyle = style.fill;
    ctx.fill();
    ctx.lineWidth = 1.25;
    ctx.strokeStyle = style.stroke;
    ctx.stroke();
  }
}

function createSizedNodes(flow: Flow): SizedNode[] {
  if (!flow.steps?.length) return [];

  return flow.steps.map((step, index) => {
    const size = getNodeSize(step);
    const position = getNodePosition(step, index);
    return {
      step,
      x: position.x,
      y: position.y,
      width: size.width,
      height: size.height,
    };
  });
}

export async function generateFlowThumbnailBlob(flow: Flow): Promise<Blob | null> {
  if (typeof document === 'undefined') return null;

  const nodes = createSizedNodes(flow);
  if (!nodes.length) return null;

  const canvas = document.createElement('canvas');
  canvas.width = THUMBNAIL_WIDTH;
  canvas.height = THUMBNAIL_HEIGHT;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.clearRect(0, 0, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);

  const bounds = computeBounds(nodes);
  const mappedNodes = nodes.map((node) => mapNodeIntoThumbnail(node, bounds));
  const mappedNodesById = new Map(mappedNodes.map((node) => [node.step.id, node]));
  const palette = buildThumbnailPalette();

  drawEdges(ctx, mappedNodesById, flow, palette.edge);
  drawNodes(ctx, mappedNodes, palette);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/webp', 0.82);
  });
}
