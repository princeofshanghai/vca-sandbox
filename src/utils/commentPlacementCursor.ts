const MESSAGE_CIRCLE_CURSOR_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none">
  <path
    d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"
    fill="#FFF"
    stroke="#000"
    stroke-width="2.4"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>
`.trim();

export const COMMENT_PLACEMENT_CURSOR = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    MESSAGE_CIRCLE_CURSOR_SVG
)}") 4 19, crosshair`;
