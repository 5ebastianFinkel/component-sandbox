/**
 * @fileoverview MermaidDiagram component for rendering Mermaid diagrams
 * @module MermaidDiagram
 */

import React, { useEffect, useRef, memo, useId } from 'react';
import mermaid from 'mermaid';
import styles from './MermaidDiagram.module.css';
import { generateUniqueId, processSVGElement, createErrorDisplay } from './MermaidDiagram.utils';

// Type for Mermaid configuration - using a flexible approach
type MermaidConfigType = Record<string, any>;

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
  config?: MermaidConfigType;
  
  /**
   * Optional aria-label for the diagram
   */
  ariaLabel?: string;
  
  /**
   * Optional scale factor for the diagram (default: 1)
   */
  scale?: number;
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
  ariaLabel,
  scale = 1
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!containerRef.current || !chart) return;

    const renderDiagram = async () => {
      try {
        // Initialize mermaid with minimal default config
        const defaultConfig: MermaidConfigType = {
          startOnLoad: false,
          theme: 'default'
        };

        // Merge with provided config
        const finalConfig = config ? { ...defaultConfig, ...config } : defaultConfig;
        mermaid.initialize(finalConfig);
        
        // Clear previous content
        containerRef.current!.innerHTML = '';
        
        // Generate unique ID for this render
        const uniqueId = generateUniqueId(id);
        
        // Render the diagram
        const { svg } = await mermaid.render(uniqueId, chart);
        
        // Add the SVG directly to the container
        containerRef.current!.innerHTML = svg;
        
        // Process the SVG element with utilities
        const svgElement = containerRef.current!.querySelector('svg');
        if (svgElement) {
          processSVGElement(svgElement, ariaLabel, scale);
        }
      } catch (error) {
        console.error('Error rendering Mermaid diagram:', error);
        if (containerRef.current) {
          containerRef.current.innerHTML = createErrorDisplay(error, styles.error);
        }
      }
    };

    void renderDiagram();
  }, [chart, config, id, ariaLabel, scale]);

  return (
    <div 
      ref={containerRef} 
      className={`${styles.mermaidContainer} ${className || ''}`}
      aria-live="polite"
    />
  );
});

MermaidDiagram.displayName = 'MermaidDiagram';