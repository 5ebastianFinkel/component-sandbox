import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Command } from 'cmdk';
import { SearchEngine, GroupedResults } from '../../utils/searchUtils';
import { StorybookDataExtractor } from '../../utils/storybookDataExtractor';
import { SearchResult } from '../../utils/searchIndexBuilder';
import { SearchResultItem } from './SearchResultItem';
import { VirtualizedList } from './VirtualizedList';
import { RecentSearches } from './RecentSearches';
import { usePerformanceOptimization } from '../../hooks/usePerformanceOptimization';
import { searchHistory, SearchHistoryItem } from '../../utils/searchHistory';
import { SearchShortcutProcessor, searchShortcuts } from '../../utils/searchShortcuts';
import styles from './SearchDialog.module.css';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect?: (result: SearchResult) => void;
  placeholder?: string;
  maxResults?: number;
  virtualizationThreshold?: number;
}

export const SearchDialog: React.FC<SearchDialogProps> = ({ 
  open, 
  onOpenChange, 
  onSelect,
  placeholder = "Search stories and docs...",
  maxResults = 50,
  virtualizationThreshold = 20
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GroupedResults>({ stories: [], docs: [], total: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<SearchHistoryItem[]>([]);
  
  // Performance optimization hooks
  const { debounce } = usePerformanceOptimization();

  // Initialize search engine
  const [searchEngine] = useState(() => new SearchEngine());
  const [isIndexReady, setIsIndexReady] = useState(false);

  // Initialize search index on mount
  useEffect(() => {
    const initializeIndex = async () => {
      const dataExtractor = new StorybookDataExtractor();
      const data = await dataExtractor.extractAllData();
      searchEngine.buildIndex(data);
      setIsIndexReady(true);
    };

    initializeIndex();
  }, [searchEngine]);

  // Optimized search function
  const performSearch = useCallback(
    debounce((searchQuery: string) => {
      if (!searchQuery.trim() || !isIndexReady) {
        setResults({ stories: [], docs: [], total: 0 });
        setIsLoading(false);
        return;
      }

      // Process shortcuts
      const processed = SearchShortcutProcessor.processQuery(searchQuery);
      const finalQuery = processed ? processed.query : searchQuery;
      const searchOptions = processed ? { ...processed.options, maxResults } : { maxResults };

      // Perform search
      const searchResults = searchEngine.searchWithGrouping(finalQuery, searchOptions);
      setResults(searchResults);
      
      // Add to search history
      searchHistory.addQuery(searchQuery, searchResults.total);
      
      setIsLoading(false);
    }, 150),
    [searchEngine, maxResults, debounce, isIndexReady]
  );

  // Handle search input changes
  useEffect(() => {
    if (!query.trim()) {
      setResults({ stories: [], docs: [], total: 0 });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    performSearch(query);
  }, [query, performSearch]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        event.preventDefault();
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onOpenChange]);

  // Handle click outside to close
  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === overlayRef.current) {
      onOpenChange(false);
    }
  };

  // Focus management and cleanup
  useEffect(() => {
    if (open) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      // Reset search state
      setQuery('');
      setResults({ stories: [], docs: [], total: 0 });
      
      // Load recent searches
      setRecentSearches(searchHistory.getRecentSearches(5));
      
      // Focus the search input
      const input = document.querySelector(`[data-cmdk-input]`) as HTMLInputElement;
      if (input) {
        setTimeout(() => input.focus(), 50);
      }
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleSelect = (result: SearchResult) => {
    // Add to search history
    if (query.trim()) {
      searchHistory.addSelection(query, result);
    }
    
    if (onSelect) {
      onSelect(result);
    }
    onOpenChange(false);
  };

  // Handle recent search selection
  const handleRecentSearchSelect = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
  }, []);

  // Handle shortcut selection
  const handleShortcutSelect = useCallback((shortcut: any) => {
    setQuery(shortcut.prefix);
  }, []);

  if (!open) return null;

  return (
    <div 
      ref={overlayRef}
      className={`${styles.overlay} ${open ? styles.open : ''}`}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Search stories and documentation"
    >
      <Command 
        className={styles.command}
        shouldFilter={false}
      >
        <Command.Input 
          placeholder={placeholder}
          className={styles.input}
          autoFocus
          value={query}
          onValueChange={setQuery}
        />
        
        <Command.List className={styles.list}>
          {(isLoading || !isIndexReady) && query.trim() && (
            <div className={styles.loading}>
              <div className={styles.loadingSpinner} />
              {!isIndexReady ? 'Initializing search...' : 'Searching...'}
            </div>
          )}

          {!isLoading && query.trim() && results.total === 0 && (
            <Command.Empty className={styles.empty}>
              <div className={styles.emptyIcon}>🔍</div>
              <div className={styles.emptyTitle}>No results found</div>
              <div className={styles.emptyDescription}>
                Try searching for component names, story titles, or documentation topics
              </div>
            </Command.Empty>
          )}

          {!isLoading && !query.trim() && (
            <RecentSearches
              recentSearches={recentSearches}
              shortcuts={searchShortcuts}
              onSelectQuery={handleRecentSearchSelect}
              onSelectShortcut={handleShortcutSelect}
            />
          )}

          {results.docs.length > 0 && (
            <Command.Group heading="Documentation" className={styles.group}>
              {results.docs.length > virtualizationThreshold ? (
                <VirtualizedList
                  items={results.docs}
                  onSelect={handleSelect}
                  itemHeight={70}
                  containerHeight={Math.min(280, results.docs.length * 70)}
                />
              ) : (
                results.docs.map(doc => (
                  <SearchResultItem
                    key={doc.id}
                    result={doc}
                    onSelect={handleSelect}
                  />
                ))
              )}
            </Command.Group>
          )}

          {results.stories.length > 0 && (
            <Command.Group heading="Stories" className={styles.group}>
              {results.stories.length > virtualizationThreshold ? (
                <VirtualizedList
                  items={results.stories}
                  onSelect={handleSelect}
                  itemHeight={70}
                  containerHeight={Math.min(280, results.stories.length * 70)}
                />
              ) : (
                results.stories.map(story => (
                  <SearchResultItem
                    key={story.id}
                    result={story}
                    onSelect={handleSelect}
                  />
                ))
              )}
            </Command.Group>
          )}
        </Command.List>
      </Command>
    </div>
  );
};