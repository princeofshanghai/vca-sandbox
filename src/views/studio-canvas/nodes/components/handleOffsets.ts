// Layout constants for inner cards inside canvas nodes.
// Node wrappers use 20px horizontal padding (`p-5` / `px-5`).
const NODE_CARD_HORIZONTAL_GUTTER_PX = 20;
const DEFAULT_HANDLE_SIZE_PX = 12; // `w-3 h-3`
const SELECTION_ITEM_HANDLE_SIZE_PX = 10; // `w-2.5 h-2.5`
const CARD_BODY_PADDING_RIGHT_PX = 12; // `p-3`

// Places a card-level output handle center on the node edge.
export const CARD_EDGE_OUTPUT_HANDLE_OFFSET_PX =
    NODE_CARD_HORIZONTAL_GUTTER_PX + DEFAULT_HANDLE_SIZE_PX / 2;

// Places selection-item-level output handles center on the node edge.
export const SELECTION_ITEM_EDGE_OUTPUT_HANDLE_OFFSET_PX =
    NODE_CARD_HORIZONTAL_GUTTER_PX + CARD_BODY_PADDING_RIGHT_PX + SELECTION_ITEM_HANDLE_SIZE_PX / 2;

