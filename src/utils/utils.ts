export const focusLoopHandler = (e: KeyboardEvent) => {
  if (e.key !== "Tab") return;

  const container = e.currentTarget as HTMLElement;
  const focusableElements = Array.from(container.querySelectorAll<HTMLElement>("button, [href], input"));
  if (focusableElements.length === 0) return;

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  const { activeElement } = document;

  if (e.shiftKey) {
    if (activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    }
  } else {
    if (activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }
};

// both clicks and keypresses produce MouseEvents for button onClick handlers, this is a hacky way to distinguish them
export const isKeypressMouseEvent = (e: MouseEvent): boolean => {
  return e.x === 0 && e.y === 0;
};
