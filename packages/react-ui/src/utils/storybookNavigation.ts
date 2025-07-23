import { SearchResult } from './searchIndexBuilder';

export class StorybookNavigator {
  
  /**
   * Navigate to a search result within Storybook
   */
  static navigateToResult(result: SearchResult): void {
    try {
      if (result.type === 'story') {
        this.navigateToStory(result);
      } else if (result.type === 'docs') {
        this.navigateToDoc(result);
      }
    } catch (error) {
      console.error('Failed to navigate to result:', error);
      // Fallback to manual URL construction
      this.fallbackNavigation(result);
    }
  }

  /**
   * Navigate to a story
   */
  private static navigateToStory(result: SearchResult): void {
    // Try to use Storybook's internal navigation if available
    if (typeof window !== 'undefined' && (window as any).__STORYBOOK_ADDONS__) {
      const { getChannel } = (window as any).__STORYBOOK_ADDONS__;
      const channel = getChannel();
      
      // Use the SET_CURRENT_STORY event to navigate
      if (channel) {
        const storyId = this.extractStoryId(result);
        channel.emit('SET_CURRENT_STORY', { storyId });
        return;
      }
    }

    // Fallback to URL navigation
    this.navigateViaUrl(result.path);
  }

  /**
   * Navigate to documentation
   */
  private static navigateToDoc(result: SearchResult): void {
    // For docs, we typically want to scroll to specific headings if available
    const docPath = this.constructDocPath(result);
    
    if (typeof window !== 'undefined' && (window as any).__STORYBOOK_ADDONS__) {
      const { getChannel } = (window as any).__STORYBOOK_ADDONS__;
      const channel = getChannel();
      
      if (channel) {
        // Navigate to docs page
        channel.emit('SET_CURRENT_STORY', { storyId: docPath });
        
        // If there's a specific heading to scroll to, do it after navigation
        if (result.headings && result.headings.length > 0) {
          setTimeout(() => {
            this.scrollToHeading(result.headings![0]);
          }, 100);
        }
        
        return;
      }
    }

    // Fallback to URL navigation
    this.navigateViaUrl(result.path);
  }

  /**
   * Fallback navigation using URL manipulation
   */
  private static fallbackNavigation(result: SearchResult): void {
    this.navigateViaUrl(result.path);
  }

  /**
   * Navigate using URL changes
   */
  private static navigateViaUrl(path: string): void {
    if (typeof window === 'undefined') return;

    // Clean up the path
    let cleanPath = path;
    if (!cleanPath.startsWith('?path=')) {
      cleanPath = `?path=${cleanPath}`;
    }

    // Update the URL
    const baseUrl = window.location.origin + window.location.pathname;
    const newUrl = baseUrl + cleanPath;
    
    // Use pushState to navigate
    window.history.pushState(null, '', newUrl);
    
    // Trigger a popstate event to notify Storybook of the change
    window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
    
    // Also try to reload the iframe if it exists
    const iframe = document.querySelector('iframe#storybook-preview-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = iframe.src; // Force reload
    }
  }

  /**
   * Extract story ID from result
   */
  private static extractStoryId(result: SearchResult): string {
    // Try to extract from path
    const pathMatch = result.path.match(/path=\/story\/([^&]+)/);
    if (pathMatch) {
      return pathMatch[1];
    }

    // Generate from title
    return result.title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }

  /**
   * Construct documentation path
   */
  private static constructDocPath(result: SearchResult): string {
    // Try to extract from existing path
    const pathMatch = result.path.match(/path=\/docs\/([^&]+)/);
    if (pathMatch) {
      return pathMatch[1];
    }

    // Generate from title
    return result.title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }

  /**
   * Scroll to a specific heading in the documentation
   */
  private static scrollToHeading(heading: string): void {
    if (typeof window === 'undefined') return;

    // Try to find the heading element
    const headingId = heading.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    // Look for various heading formats
    const selectors = [
      `#${headingId}`,
      `[id="${headingId}"]`,
      `h1:contains("${heading}")`,
      `h2:contains("${heading}")`,
      `h3:contains("${heading}")`,
      `h4:contains("${heading}")`,
      `h5:contains("${heading}")`,
      `h6:contains("${heading}")`
    ];

    for (const selector of selectors) {
      try {
        const element = document.querySelector(selector);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          break;
        }
      } catch (error) {
        // Continue to next selector
      }
    }

    // If still not found, try in iframe
    try {
      const iframe = document.querySelector('iframe#storybook-preview-iframe') as HTMLIFrameElement;
      if (iframe && iframe.contentDocument) {
        for (const selector of selectors) {
          try {
            const element = iframe.contentDocument.querySelector(selector);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
              break;
            }
          } catch (error) {
            // Continue to next selector
          }
        }
      }
    } catch (error) {
      // Iframe access might be restricted
    }
  }

  /**
   * Check if we're running inside Storybook
   */
  static isInStorybook(): boolean {
    return typeof window !== 'undefined' && 
           !!(window as any).__STORYBOOK_ADDONS__ &&
           window.location.pathname.includes('/storybook');
  }

  /**
   * Get current story information
   */
  static getCurrentStory(): { storyId: string; viewMode: string } | null {
    if (typeof window === 'undefined') return null;

    const params = new URLSearchParams(window.location.search);
    const path = params.get('path');
    
    if (!path) return null;

    const match = path.match(/\/(story|docs)\/(.+)/);
    if (!match) return null;

    return {
      viewMode: match[1],
      storyId: match[2]
    };
  }
}