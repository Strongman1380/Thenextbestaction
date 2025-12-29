// Accessibility utilities and components

// ARIA attributes for improved accessibility
export const ARIA_LABELS = {
  casePlanTab: "Case Plan Tab",
  skillBuildingTab: "Worker Skills Tab",
  clientResourcesTab: "Client Resources Tab",
  generateButton: "Generate Plan",
  newCaseButton: "Start New Case",
  regenerateButton: "Regenerate Content",
  cancelButton: "Cancel Operation",
  closeButton: "Close Dialog",
  expandButton: "Expand Content",
  collapseButton: "Collapse Content",
};

// Accessibility helper functions

/**
 * Generate unique IDs for accessibility attributes
 */
export const generateId = (prefix: string = "id"): string => {
  return `\${prefix}-\${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Focus management utilities
 */
export const focusFirstElement = (container: HTMLElement | null) => {
  if (!container) return;
  
  const focusableElements = container.querySelectorAll(
    "button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])"
  );
  
  if (focusableElements.length > 0) {
    (focusableElements[0] as HTMLElement).focus();
  }
};

/**
 * Trap focus within a container (useful for modals)
 */
export const trapFocus = (container: HTMLElement | null, returnFocusTo?: HTMLElement) => {
  if (!container) return;
  
  const focusableElements = container.querySelectorAll(
    "button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])"
  );
  
  if (focusableElements.length === 0) return;
  
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
  
  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  };
  
  container.addEventListener("keydown", handleTabKey);
  
  return () => {
    container.removeEventListener("keydown", handleTabKey);
    if (returnFocusTo) {
      returnFocusTo.focus();
    }
  };
};

/**
 * Announce content to screen readers
 */
export const announceToScreenReader = (message: string) => {
  const announcement = document.createElement("div");
  announcement.setAttribute("aria-live", "polite");
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after a delay
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Utility to add screen reader only class
 */
export const srOnlyStyle = {
  position: "absolute" as const,
  width: "1px",
  height: "1px",
  padding: "0",
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  borderWidth: "0",
};
