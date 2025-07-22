/**
 * @fileoverview Utility functions for MermaidDiagram component
 */

/**
 * Generates a unique ID for Mermaid diagrams
 * @param baseId - Base ID from useId hook
 * @returns Sanitized unique ID
 */
export const generateUniqueId = (baseId: string): string => {
  const sanitizedId = baseId.replace(/:/g, '').replace(/-/g, '');
  return `mermaid-${sanitizedId}-${Date.now()}`;
};

/**
 * Sets up basic SVG element attributes for proper rendering
 * @param svgElement - The SVG element to configure
 * @param ariaLabel - Optional accessibility label
 */
export const setupSVGElement = (svgElement: SVGSVGElement, ariaLabel?: string): void => {
  // Accessibility
  svgElement.setAttribute('role', 'img');
  if (ariaLabel) {
    svgElement.setAttribute('aria-label', ariaLabel);
  }
  
  // Remove fixed dimensions for responsive behavior
  svgElement.removeAttribute('width');
  svgElement.removeAttribute('height');
  
  // Set responsive styles
  svgElement.style.width = '100%';
  svgElement.style.height = 'auto';
  svgElement.style.display = 'block';
  
  // Preserve aspect ratio
  // svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');
};

/**
 * Ensures SVG has a proper viewBox for scaling
 * @param svgElement - The SVG element
 * @returns The viewBox string
 */
export const ensureViewBox = (svgElement: SVGSVGElement): string => {
  let viewBox = svgElement.getAttribute('viewBox');
  if (!viewBox) {
    const bbox = svgElement.getBBox();
    viewBox = `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`;
    svgElement.setAttribute('viewBox', viewBox);
  }
  return viewBox;
};

/**
 * Applies scaling to an SVG element uniformly
 * @param svgElement - The SVG element to scale
 * @param scale - Scale factor (1 = no scaling)
 */
export const applyScale = (svgElement: SVGSVGElement, scale: number): void => {
  if (scale === 1) return;
  
  // Use CSS transform for consistent scaling across all diagram types
  svgElement.style.transform = `scale(${scale})`;
  svgElement.style.transformOrigin = 'center';
};

/**
 * Processes the rendered SVG element with all necessary setup
 * @param svgElement - The SVG element to process
 * @param ariaLabel - Optional accessibility label
 * @param scale - Scale factor for the diagram
 */
export const processSVGElement = (
  svgElement: SVGSVGElement, 
  ariaLabel?: string, 
  scale: number = 1
): void => {
  setupSVGElement(svgElement, ariaLabel);
  ensureViewBox(svgElement);
  applyScale(svgElement, scale);
};

/**
 * Creates an error display element
 * @param error - The error to display
 * @param errorClassName - CSS class for error styling
 * @returns HTML string for error display
 */
export const createErrorDisplay = (error: unknown, errorClassName: string): string => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  return `
    <div class="${errorClassName}">
      <p>Error rendering diagram</p>
      <pre>${errorMessage}</pre>
    </div>
  `;
};