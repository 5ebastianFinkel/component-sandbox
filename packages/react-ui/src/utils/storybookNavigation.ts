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
    // Build the navigation URL with potential heading fragment
    let docPath = result.path;
    
    // If there's a specific heading to navigate to, add it as a URL fragment
    if (result.headings && result.headings.length > 0) {
      const headingIds = this.generateHeadingIds(result.headings[0]);
      if (headingIds.length > 0) {
        docPath = `${result.path}#${headingIds[0]}`;
      }
    }
    
    if (typeof window !== 'undefined' && (window as any).__STORYBOOK_ADDONS__) {
      const { getChannel } = (window as any).__STORYBOOK_ADDONS__;
      const channel = getChannel();
      
      if (channel) {
        // Extract story ID for navigation
        const storyId = this.constructDocPath(result);
        
        // Navigate to docs page
        channel.emit('SET_CURRENT_STORY', { storyId });
        
        // If there's a specific heading to scroll to, do it after navigation
        if (result.headings && result.headings.length > 0) {
          setTimeout(() => {
            this.scrollToHeading(result.headings![0]);
          }, 300); // Increased delay for docs rendering
        }
        
        return;
      }
    }

    // Fallback to URL navigation with fragment
    this.navigateViaUrl(docPath);
    
    // Handle heading scroll after URL navigation
    if (result.headings && result.headings.length > 0) {
      setTimeout(() => {
        this.scrollToHeading(result.headings![0]);
      }, 500); // Allow time for page load
    }
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

    // Parse path and fragment
    const [basePath, fragment] = path.split('#');
    let cleanPath = basePath;
    
    // Handle different path formats
    if (cleanPath.startsWith('/?path=')) {
      // Already properly formatted
    } else if (cleanPath.startsWith('?path=')) {
      cleanPath = `/${cleanPath}`;
    } else if (cleanPath.startsWith('/story/') || cleanPath.startsWith('/docs/')) {
      cleanPath = `/?path=${cleanPath}`;
    } else {
      // Assume it needs the full path structure
      cleanPath = `/?path=${cleanPath}`;
    }

    // Add fragment back if it exists
    if (fragment) {
      cleanPath += `#${fragment}`;
    }

    // Build the complete URL
    const baseUrl = window.location.origin + window.location.pathname;
    const newUrl = baseUrl + cleanPath;
    
    // Update the URL using pushState
    window.history.pushState(null, '', newUrl);
    
    // Notify Storybook of the URL change
    this.notifyStorybookOfNavigation();
    
    // Handle fragment scrolling after navigation
    if (fragment) {
      setTimeout(() => {
        // Try to scroll to the fragment
        const element = document.getElementById(fragment);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Add offset for fixed headers
          setTimeout(() => {
            window.scrollBy(0, -60);
          }, 100);
        } else {
          // Try in iframe
          const iframe = document.querySelector('iframe#storybook-preview-iframe') as HTMLIFrameElement;
          if (iframe && iframe.contentDocument) {
            const iframeElement = iframe.contentDocument.getElementById(fragment);
            if (iframeElement) {
              iframeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }
        }
      }, 200);
    }
    
    // Force update if needed
    setTimeout(() => {
      this.ensureStorybookUpdated(newUrl);
    }, 100);
  }

  /**
   * Notify Storybook of navigation changes
   */
  private static notifyStorybookOfNavigation(): void {
    // Trigger popstate event
    window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
    
    // Also trigger hashchange in case it helps
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    
    // Try to use Storybook's internal events if available
    if (typeof window !== 'undefined' && (window as any).__STORYBOOK_ADDONS__) {
      try {
        const { getChannel } = (window as any).__STORYBOOK_ADDONS__;
        const channel = getChannel();
        if (channel) {
          // Trigger a navigation event
          channel.emit('NAVIGATE_URL', { url: window.location.href });
        }
      } catch (error) {
        // Channel might not be available
      }
    }
  }

  /**
   * Ensure Storybook has updated after navigation
   */
  private static ensureStorybookUpdated(expectedUrl: string): void {
    // Check if the URL actually changed
    if (window.location.href !== expectedUrl) {
      console.warn('Navigation URL mismatch, forcing reload');
      window.location.href = expectedUrl;
      return;
    }

    // Try to force iframe reload if it exists and seems stale
    const iframe = document.querySelector('iframe#storybook-preview-iframe') as HTMLIFrameElement;
    if (iframe) {
      try {
        // Only reload if the iframe appears to be on a different story
        const currentPath = new URLSearchParams(window.location.search).get('path');
        if (currentPath && !iframe.src.includes(encodeURIComponent(currentPath))) {
          // Build the iframe URL
          const iframeBaseUrl = iframe.src.split('?')[0];
          iframe.src = `${iframeBaseUrl}?path=${currentPath}&viewMode=story`;
        }
      } catch (error) {
        // Fallback to simple reload
        iframe.src = iframe.src;
      }
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

    // Generate possible heading IDs (MDX/Storybook format)
    const headingIds = this.generateHeadingIds(heading);
    
    // Function to find heading element by text content
    const findHeadingByText = (doc: Document) => {
      const headingTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
      for (const tag of headingTags) {
        const elements = doc.querySelectorAll(tag);
        for (const element of elements) {
          if (element.textContent?.trim() === heading.trim()) {
            return element;
          }
        }
      }
      return null;
    };

    // Function to scroll to element if found
    const scrollToElement = (element: Element) => {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Add a small offset to account for fixed headers
      setTimeout(() => {
        window.scrollBy(0, -60);
      }, 100);
    };

    // Try to find by ID first (most reliable)
    for (const headingId of headingIds) {
      const element = document.getElementById(headingId);
      if (element) {
        scrollToElement(element);
        return;
      }
    }

    // Try to find by text content in main document
    const mainDocElement = findHeadingByText(document);
    if (mainDocElement) {
      scrollToElement(mainDocElement);
      return;
    }

    // Try in Storybook iframe (docs pages)
    try {
      const iframe = document.querySelector('iframe#storybook-preview-iframe') as HTMLIFrameElement;
      if (iframe && iframe.contentDocument) {
        // Try by ID in iframe
        for (const headingId of headingIds) {
          const element = iframe.contentDocument.getElementById(headingId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
          }
        }

        // Try by text content in iframe
        const iframeElement = findHeadingByText(iframe.contentDocument);
        if (iframeElement) {
          iframeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
      }
    } catch (error) {
      // Iframe access might be restricted due to CORS
      console.warn('Could not access iframe content for heading scroll:', error);
    }

    // Last resort: try URL fragment
    try {
      const bestId = headingIds[0];
      if (bestId) {
        window.location.hash = bestId;
      }
    } catch (error) {
      console.warn('Failed to scroll to heading:', heading, error);
    }
  }

  /**
   * Generate possible heading IDs based on common MDX/Storybook conventions
   */
  private static generateHeadingIds(heading: string): string[] {
    const ids: string[] = [];
    
    // Clean heading text
    const cleanHeading = heading.trim();
    
    // Standard MDX format: lowercase, replace spaces with hyphens, remove special chars
    const standardId = cleanHeading
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    ids.push(standardId);
    
    // Alternative format: preserve some special characters
    const altId = cleanHeading
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    if (altId !== standardId) {
      ids.push(altId);
    }
    
    // GitHub-style format (used by some MDX processors)
    const githubId = cleanHeading
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    
    if (githubId !== standardId && githubId !== altId) {
      ids.push(githubId);
    }
    
    // Simple format (just replace spaces)
    const simpleId = cleanHeading.toLowerCase().replace(/\s+/g, '-');
    if (simpleId !== standardId && simpleId !== altId && simpleId !== githubId) {
      ids.push(simpleId);
    }
    
    return ids;
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