/**
 * @fileoverview MermaidDiagram component for rendering Mermaid diagrams
 * @module MermaidDiagram
 */

import React, { useEffect, useRef, memo, useId } from 'react';
import mermaid from 'mermaid';
import styles from './MermaidDiagram.module.css';

/**
 * Props for the MermaidDiagram component
 */
export interface MermaidDiagramProps {
  /**
   * The Mermaid diagram definition
   * @example
   * ```
   * graph TD
   *   A[Start] --> B[Process]
   *   B --> C[End]
   * ```
   */
  chart: string;
  
  /**
   * Optional CSS class name
   */
  className?: string;
  
  /**
   * Optional Mermaid configuration
   */
  config?: mermaid.Config;
  
  /**
   * Optional aria-label for the diagram
   */
  ariaLabel?: string;
}

/**
 * MermaidDiagram Component
 * 
 * Renders Mermaid diagrams in React applications. Supports all Mermaid diagram types
 * including flowcharts, sequence diagrams, class diagrams, state diagrams, and more.
 * 
 * @component
 * @example
 * ```tsx
 * // Basic flowchart
 * <MermaidDiagram 
 *   chart={`
 *     graph TD
 *       A[Start] --> B[Process]
 *       B --> C{Decision}
 *       C -->|Yes| D[End]
 *       C -->|No| E[Alternative]
 *   `}
 *   ariaLabel="Process flow diagram"
 * />
 * ```
 * 
 * @example
 * ```tsx
 * // With custom configuration
 * <MermaidDiagram 
 *   chart={sequenceDiagramCode}
 *   config={{ theme: 'dark' }}
 * />
 * ```
 */
export const MermaidDiagram: React.FC<MermaidDiagramProps> = memo(({ 
  chart, 
  className, 
  config,
  ariaLabel 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const mermaidId = `mermaid-${id.replace(/:/g, '').replace(/-/g, '')}`;

  useEffect(() => {
    if (!containerRef.current || !chart) return;

    const renderDiagram = async () => {
      try {
        // Initialize mermaid with default config
        const defaultConfig: mermaid.Config = {
          startOnLoad: false,
          theme: 'default',
          flowchart: {
            htmlLabels: true,
            curve: 'basis'
          }
        };

        // Merge with provided config
        const finalConfig = config ? { ...defaultConfig, ...config } : defaultConfig;
        
        mermaid.initialize(finalConfig);
        
        // Clear previous content
        containerRef.current!.innerHTML = '';
        
        // Generate unique ID for this render
        const uniqueId = `${mermaidId}-${Date.now()}`;
        
        // Render the diagram
        const { svg } = await mermaid.render(uniqueId, chart);
        
        // Add the SVG directly to the container
        containerRef.current!.innerHTML = svg;
        
        // Add accessibility attributes
        const svgElement = containerRef.current!.querySelector('svg');
        if (svgElement) {
          svgElement.setAttribute('role', 'img');
          if (ariaLabel) {
            svgElement.setAttribute('aria-label', ariaLabel);
          }
        }
      } catch (error) {
        console.error('Error rendering Mermaid diagram:', error);
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="${styles.error}">
              <p>Error rendering diagram</p>
              <pre>${error instanceof Error ? error.message : String(error)}</pre>
            </div>
          `;
        }
      }
    };

    renderDiagram();
  }, [chart, config, mermaidId, ariaLabel]);

  return (
    <div 
      ref={containerRef} 
      className={`${styles.mermaidContainer} ${className || ''}`}
      aria-live="polite"
    />
  );
});

MermaidDiagram.displayName = 'MermaidDiagram';