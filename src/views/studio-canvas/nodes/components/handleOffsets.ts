// Layout constants for inner cards inside canvas nodes.
// Node wrappers use 28px horizontal padding (`px-7`).
const NODE_CARD_HORIZONTAL_GUTTER_PX = 28;
const DEFAULT_HANDLE_SIZE_PX = 14; // `w-3.5 h-3.5`
const SELECTION_ITEM_HANDLE_SIZE_PX = 14; // `w-3.5 h-3.5`
const CARD_BODY_PADDING_RIGHT_PX = 12; // `p-3`
export const OUTER_NODE_HANDLE_SIZE_PX = 18; // `w-[18px] h-[18px]`
const OUTER_NODE_HANDLE_GAP_PX = 7;

// Places a card-level output handle center on the node edge.
export const CARD_EDGE_OUTPUT_HANDLE_OFFSET_PX =
    NODE_CARD_HORIZONTAL_GUTTER_PX + DEFAULT_HANDLE_SIZE_PX / 2;

// Places selection-item-level output handles center on the node edge.
export const SELECTION_ITEM_EDGE_OUTPUT_HANDLE_OFFSET_PX =
    NODE_CARD_HORIZONTAL_GUTTER_PX + CARD_BODY_PADDING_RIGHT_PX + SELECTION_ITEM_HANDLE_SIZE_PX / 2;

// Places outer node-level handles just outside the node border with a small gap.
export const OUTER_NODE_HANDLE_OFFSET_PX =
    OUTER_NODE_HANDLE_SIZE_PX / 2 + OUTER_NODE_HANDLE_GAP_PX;
