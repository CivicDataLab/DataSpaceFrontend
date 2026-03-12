// ============================================
// FILE: components/loading/Skeleton/UseCaseListingSkeleton/UseCaseListingSkeleton.tsx
// UPDATED: Added cardsOnly prop for carousel use
// ============================================
import React from 'react';
import { ShimmerWrapper } from 'opub-ui';
import styles from './UseCaseListingSkeleton.module.css';

interface UseCaseListingSkeletonProps {
  cardCount?: number;
  filterCount?: number;
  /**
   * If true, only render cards without grid wrapper (for use in carousels)
   */
  cardsOnly?: boolean;
}

export function UseCaseListingSkeleton({
  cardCount = 9,
  filterCount = 12,
  cardsOnly = false,
}: UseCaseListingSkeletonProps) {
  // If cardsOnly mode, just return the cards without any wrapper
  if (cardsOnly) {
    return (
      <>
        {Array.from({ length: cardCount }).map((_, index) => (
          <UseCaseCardSkeleton key={index} />
        ))}
      </>
    );
  }

  // Full page layout with grid
  return (
    <ShimmerWrapper>
      <div className={styles.container}>
        <div className="container">
          <div className="mt-5 lg:mt-10">
            <div className="row mb-16 flex gap-5">
              {/* Filter Sidebar */}
              <div className="hidden min-w-64 max-w-64 lg:flex">
                <FilterSidebarSkeleton filterCount={filterCount} />
              </div>

              {/* Main Content */}
              <div className="flex w-full flex-col gap-4 px-2">
                {/* Search + Controls */}
                <div className="flex flex-wrap items-center justify-between gap-5 py-2 lg:flex-nowrap">
                  <div className="w-full md:block">
                    <div className={styles.searchBar} />
                  </div>

                  <div className="flex flex-wrap justify-between gap-3 lg:flex-nowrap lg:justify-normal lg:gap-5">
                    <div className="hidden items-center gap-2 lg:flex">
                      <div className={styles.buttonGroup} />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={styles.sortButton} />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={styles.dropdown} />
                    </div>
                    <div className="flex items-center gap-2 lg:hidden">
                      <div className={styles.filterButton} />
                    </div>
                  </div>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: cardCount }).map((_, index) => (
                    <UseCaseCardSkeleton key={index} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ShimmerWrapper>
  );
}

function FilterSidebarSkeleton({ filterCount }: { filterCount: number }) {
  return (
    <div className={styles.filterSidebar}>
      <div className={styles.filterHeader}>
        <div className={styles.filterTitle} />
        <div className={styles.resetButton} />
      </div>

      <div className={styles.filterList}>
        {Array.from({ length: filterCount }).map((_, index) => (
          <div key={index} className={styles.filterItem}>
            <div className={styles.filterLabel} />
          </div>
        ))}
      </div>
    </div>
  );
}

function UseCaseCardSkeleton() {
  return (
    <div className={styles.card}>
      {/* Cover Image */}
      <div className={styles.coverImage} />

      {/* Content */}
      <div className={styles.cardContent}>
        {/* Title */}
        <div className={styles.cardTitle} />

        {/* Metadata Row */}
        <div className={styles.metadataRow}>
          <div className={styles.metadataItem}>
            <div className={styles.metadataIcon} />
            <div className={styles.metadataTextLarge} />
          </div>
          <div className={styles.metadataItem}>
            <div className={styles.metadataIcon} />
            <div className={styles.metadataText} />
          </div>
        </div>

        {/* Footer */}
        <div className={styles.cardFooter}>
          <div className={styles.footerIcon} />
          <div className={styles.footerIcon} />
        </div>
      </div>
    </div>
  );
}