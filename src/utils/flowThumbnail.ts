import { CanvasAnnotation, CanvasTextAnnotationSize, Flow, Step } from '@/views/studio/types';
import { getRectangleAnnotationColorDefinition } from '@/views/studio/annotationColors';

type Point = { x: number; y: number };
type NodeStyle = { fill: string; stroke: string };
type ThumbnailPalette = {
  start: NodeStyle;
  condition: NodeStyle;
  userTurn: NodeStyle;
  note: NodeStyle;
  turn: NodeStyle;
  edge: string;
  annotationText: string;
};

type SizedNode = {
  step: Step;
  x: number;
  y: number;
  width: number;
  height: number;
};

type SizedAnnotation = {
  annotation: CanvasAnnotation;
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
    annotationText: tokenColor(styles, '--shell-muted-strong'),
  };
}

function getNodePosition(step: Step, index: number): Point {
  if (step.position) return step.position;
  return {
    x: index * defaultStepSpacing.x,
    y: index * defaultStepSpacing.y,
  };
}

function computeBounds<T extends { x: number; y: number; width: number; height: number }>(nodes: T[]) {
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

function mapItemIntoThumbnail<T extends { x: number; y: number; width: number; height: number }>(
  item: T,
  bounds: ReturnType<typeof computeBounds>
) {
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
    ...item,
    x: offsetX + (item.x - bounds.minX) * scale,
    y: offsetY + (item.y - bounds.minY) * scale,
    width: Math.max(item.width * scale, 10),
    height: Math.max(item.height * scale, 8),
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

function drawAnnotations(
  ctx: CanvasRenderingContext2D,
  annotations: SizedAnnotation[],
  palette: ThumbnailPalette
) {
  annotations.forEach(({ annotation, x, y, width, height }) => {
    if (annotation.type === 'rectangle') {
      const colorDefinition = getRectangleAnnotationColorDefinition(annotation);
      roundedRect(ctx, x, y, width, height, 14);
      ctx.lineWidth = 1.5;
      ctx.fillStyle = colorDefinition.fill;
      ctx.fill();
      ctx.strokeStyle = colorDefinition.border;
      ctx.stroke();
      return;
    }

    const baseMetrics = getTextAnnotationMetrics(annotation.size);
    const originalWidth = Math.max(getAnnotationWidth(annotation), 1);
    const scale = width / originalWidth;
    const fontSize = Math.max(Math.round(baseMetrics.fontSize * scale), 14);
    const lineHeight = Math.max(Math.round(baseMetrics.lineHeight * scale), fontSize + 4);

    ctx.fillStyle = palette.annotationText;
    ctx.font = `600 ${fontSize}px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.textBaseline = 'top';
    const textLines = wrapTextToLines(ctx, annotation.text.trim() || 'Add text', width);
    textLines.forEach((line, lineIndex) => {
      ctx.fillText(line, x, y + lineIndex * lineHeight);
    });
  });
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

function getTextAnnotationMetrics(size: CanvasTextAnnotationSize) {
  return {
    sm: { fontSize: 18, lineHeight: 24, averageCharWidth: 10 },
    md: { fontSize: 28, lineHeight: 36, averageCharWidth: 15 },
    lg: { fontSize: 40, lineHeight: 52, averageCharWidth: 22 },
    xl: { fontSize: 56, lineHeight: 68, averageCharWidth: 30 },
  }[size];
}

function getEstimatedWrappedLineCount(annotation: Extract<CanvasAnnotation, { type: 'text' }>) {
  const metrics = getTextAnnotationMetrics(annotation.size);
  const availableWidth = Math.max(getAnnotationWidth(annotation), 1);
  const charsPerLine = Math.max(Math.floor(availableWidth / metrics.averageCharWidth), 1);
  const text = annotation.text.trim() || 'Add text';

  return text.split(/\r?\n/).reduce((lineCount, paragraph) => {
    if (!paragraph.length) {
      return lineCount + 1;
    }

    return lineCount + Math.max(1, Math.ceil(paragraph.length / charsPerLine));
  }, 0);
}

function wrapTextToLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
) {
  const paragraphs = text.split(/\r?\n/);
  const lines: string[] = [];

  paragraphs.forEach((paragraph) => {
    if (!paragraph.trim()) {
      lines.push('');
      return;
    }

    const words = paragraph.split(/\s+/);
    let currentLine = '';

    words.forEach((word) => {
      const candidate = currentLine ? `${currentLine} ${word}` : word;
      if (ctx.measureText(candidate).width <= maxWidth) {
        currentLine = candidate;
        return;
      }

      if (currentLine) {
        lines.push(currentLine);
      }

      if (ctx.measureText(word).width <= maxWidth) {
        currentLine = word;
        return;
      }

      let chunk = '';
      Array.from(word).forEach((character) => {
        const nextChunk = `${chunk}${character}`;
        if (ctx.measureText(nextChunk).width <= maxWidth || !chunk) {
          chunk = nextChunk;
          return;
        }

        lines.push(chunk);
        chunk = character;
      });
      currentLine = chunk;
    });

    lines.push(currentLine);
  });

  return lines.filter((line, index) => !(index === lines.length - 1 && line === ''));
}

function getAnnotationHeight(annotation: CanvasAnnotation) {
  if (annotation.type === 'rectangle') {
    return annotation.height;
  }

  return getEstimatedWrappedLineCount(annotation) * getTextAnnotationMetrics(annotation.size).lineHeight;
}

function getAnnotationWidth(annotation: CanvasAnnotation) {
  if (annotation.type === 'rectangle') {
    return annotation.width;
  }

  return annotation.width ?? Math.min(Math.max((annotation.text.trim().length || 8) * 18, 120), 360);
}

function createSizedAnnotations(flow: Flow): SizedAnnotation[] {
  if (!flow.annotations?.length) return [];

  return flow.annotations.map((annotation) => ({
    annotation,
    x: annotation.position.x,
    y: annotation.position.y,
    width: getAnnotationWidth(annotation),
    height: getAnnotationHeight(annotation),
  }));
}

export async function generateFlowThumbnailBlob(flow: Flow): Promise<Blob | null> {
  if (typeof document === 'undefined') return null;

  const nodes = createSizedNodes(flow);
  const annotations = createSizedAnnotations(flow);
  if (!nodes.length && !annotations.length) return null;

  const canvas = document.createElement('canvas');
  canvas.width = THUMBNAIL_WIDTH;
  canvas.height = THUMBNAIL_HEIGHT;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.clearRect(0, 0, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);

  const bounds = computeBounds([...nodes, ...annotations]);
  const mappedNodes = nodes.map((node) => mapItemIntoThumbnail(node, bounds));
  const mappedAnnotations = annotations.map((annotation) => mapItemIntoThumbnail(annotation, bounds));
  const mappedNodesById = new Map(mappedNodes.map((node) => [node.step.id, node]));
  const palette = buildThumbnailPalette();

  drawAnnotations(ctx, mappedAnnotations, palette);
  drawEdges(ctx, mappedNodesById, flow, palette.edge);
  drawNodes(ctx, mappedNodes, palette);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/webp', 0.82);
  });
}
