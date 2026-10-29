/** Opens the ⌘K palette from anywhere, without importing it. */
export const openPalette = () => window.dispatchEvent(new Event("palette:open"));
export const preloadPalette = () => window.dispatchEvent(new Event("palette:preload"));
