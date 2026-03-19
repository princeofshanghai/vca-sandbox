const CANVAS_DEFAULT_CURSOR_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path
    d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.85a.5.5 0 0 0-.85.35Z"
    fill="#FFF"
    stroke="#000"
    stroke-width="2"
  />
</svg>
`.trim();

const MESSAGE_CIRCLE_CURSOR_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path
    d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"
    fill="#FFF"
    stroke="#000"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>
`.trim();

export const CANVAS_DEFAULT_CURSOR = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    CANVAS_DEFAULT_CURSOR_SVG
)}") 6 3, auto`;

export const COMMENT_PLACEMENT_CURSOR = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    MESSAGE_CIRCLE_CURSOR_SVG
)}") 3 16, crosshair`;
