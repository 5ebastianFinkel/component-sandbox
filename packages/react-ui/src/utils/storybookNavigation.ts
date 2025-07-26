import { SearchResult } from './searchIndexBuilder';

// Navigation delay constants
const DOCS_RENDER_DELAY_MS = 300;
const URL_NAVIGATION_DELAY_MS = 500;

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
   * Build document path with optional heading fragment
   */
  private static buildDocPathWithFragment(result: SearchResult): string {
    let docPath = result.path;
    
    // If there's a specific heading to navigate to, add it as a URL fragment
    if (result.headings && result.headings.length > 0) {
      const headingIds = this.generateHeadingIds(result.headings[0]);
      if (headingIds.length > 0) {
        docPath = `${result.path}#${headingIds[0]}`;
      }
    }
    
    return docPath;
  }

  /**
   * Execute navigation using channel or URL fallback
   */
  private static executeNavigation(docPath: string, storyId: string): void {
    if (typeof window !== 'undefined' && (window as any).__STORYBOOK_ADDONS__) {
      const { getChannel } = (window as any).__STORYBOOK_ADDONS__;
      const channel = getChannel();
      
      if (channel) {
        // Use channel navigation
        channel.emit('SET_CURRENT_STORY', { storyId });
        return;
      }
    }

    // Fallback to URL navigation
    this.navigateViaUrl(docPath);
  }

  /**
   * Schedule heading scroll after navigation
   */
  private static scheduleHeadingScroll(heading: string, delayMs: number): void {
    setTimeout(() => {
      this.scrollToHeading(heading);
    }, delayMs);
  }

  /**
   * Navigate to documentation
   */
  private static navigateToDoc(result: SearchResult): void {
    // Build the navigation URL with potential heading fragment
    const docPath = this.buildDocPathWithFragment(result);
    
    // Extract story ID for navigation
    const storyId = this.constructDocPath(result);
    
    // Execute navigation (channel or URL)
    this.executeNavigation(docPath, storyId);
    
    // Schedule heading scroll if needed
    if (result.headings && result.headings.length > 0) {
      const isChannelAvailable = typeof window !== 'undefined' && 
                                 (window as any).__STORYBOOK_ADDONS__ && 
                                 (window as any).__STORYBOOK_ADDONS__.getChannel();
      
      const delay = isChannelAvailable ? DOCS_RENDER_DELAY_MS : URL_NAVIGATION_DELAY_MS;
      this.scheduleHeadingScroll(result.headings[0], delay);
    }
  }

  /**
   * Fallback navigation using URL manipulation
   */
  private static fallbackNavigation(result: SearchResult): void {
    this.navigateViaUrl(result.path);
  }

  /**
   * Normalize URL path for Storybook navigation
   */
  private static normalizeUrlPath(basePath: string, fragment?: string): string {
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

    return cleanPath;
  }

  /**
   * Scroll to fragment in main document or iframe
   */
  private static scrollToFragment(fragment: string): void {
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
  }

  /**
   * Navigate using URL changes
   */
  private static navigateViaUrl(path: string): void {
    if (typeof window === 'undefined') return;

    // Parse path and fragment
    const [basePath, fragment] = path.split('#');
    
    // Normalize the URL path
    const cleanPath = this.normalizeUrlPath(basePath, fragment);
    
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
        this.scrollToFragment(fragment);
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
        // Fallback to simple reload by appending timestamp to force refresh
        const currentSrc = iframe.src;
        const separator = currentSrc.includes('?') ? '&' : '?';
        iframe.src = `${currentSrc}${separator}_reload=${Date.now()}`;
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
   * Find heading element by text content in a document
   */
  private static findHeadingByText(doc: Document, heading: string): Element | null {
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
  }

  /**
   * Scroll to element with offset for fixed headers
   */
  private static scrollToElementWithOffset(element: Element): void {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Add a small offset to account for fixed headers
    setTimeout(() => {
      window.scrollBy(0, -60);
    }, 100);
  }

  /**
   * Find element by ID in document
   */
  private static findElementById(doc: Document, ids: string[]): Element | null {
    for (const id of ids) {
      const element = doc.getElementById(id);
      if (element) {
        return element;
      }
    }
    return null;
  }

  /**
   * Search for heading in iframe
   */
  private static searchHeadingInIframe(headingIds: string[], heading: string): boolean {
    try {
      const iframe = document.querySelector('iframe#storybook-preview-iframe') as HTMLIFrameElement;
      if (iframe && iframe.contentDocument) {
        // Try by ID in iframe
        const elementById = this.findElementById(iframe.contentDocument, headingIds);
        if (elementById) {
          elementById.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return true;
        }

        // Try by text content in iframe
        const elementByText = this.findHeadingByText(iframe.contentDocument, heading);
        if (elementByText) {
          elementByText.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return true;
        }
      }
    } catch (error) {
      // Iframe access might be restricted due to CORS
      console.warn('Could not access iframe content for heading scroll:', error);
    }
    return false;
  }

  /**
   * Scroll to a specific heading in the documentation
   */
  private static scrollToHeading(heading: string): void {
    if (typeof window === 'undefined') return;

    // Generate possible heading IDs (MDX/Storybook format)
    const headingIds = this.generateHeadingIds(heading);
    
    // Try to find by ID first (most reliable)
    const elementById = this.findElementById(document, headingIds);
    if (elementById) {
      this.scrollToElementWithOffset(elementById);
      return;
    }

    // Try to find by text content in main document
    const elementByText = this.findHeadingByText(document, heading);
    if (elementByText) {
      this.scrollToElementWithOffset(elementByText);
      return;
    }

    // Try in Storybook iframe (docs pages)
    if (this.searchHeadingInIframe(headingIds, heading)) {
      return;
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