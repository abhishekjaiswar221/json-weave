// Tiny singleton bridge so the global keyboard shortcut handler and toolbar
// buttons can trigger the hidden file input owned by the workspace page,
// without threading a ref through several component layers.
let trigger: (() => void) | null = null;

export function setOpenFileTrigger(fn: (() => void) | null) {
  trigger = fn;
}

export function triggerOpenFile() {
  trigger?.();
}
