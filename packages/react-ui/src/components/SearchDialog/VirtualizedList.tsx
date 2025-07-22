import React, { useMemo, useRef, useEffect, useState } from 'react';
import { SearchResult } from '../../utils/searchIndexBuilder';
import { SearchResultItem } from './SearchResultItem';
import styles from './VirtualizedList.module.css';

interface VirtualizedListProps {
  items: SearchResult[];
  onSelect: (result: SearchResult) => void;
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export const VirtualizedList: React.FC<VirtualizedListProps> = ({
  items,
  onSelect,
  itemHeight = 70,
  containerHeight = 300,
  overscan = 5
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // Calculate visible items
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange]);

  // Handle scroll
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  };

  // Calculate total height and offset
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  return (
    <div
      ref={containerRef}
      className={styles.container}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div
        className={styles.totalSpace}
        style={{ height: totalHeight }}
      >
        <div
          className={styles.visibleItems}
          style={{ transform: `translateY(${offsetY}px)` }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={item.id}
              className={styles.itemWrapper}
              style={{ height: itemHeight }}
            >
              <SearchResultItem
                result={item}
                onSelect={onSelect}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};