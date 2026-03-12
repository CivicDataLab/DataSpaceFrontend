// ============================================
// FILE: components/loading/Skeleton/DatasetListingSkeleton/DatasetListingSkeleton.tsx
// COMPLETE UPDATED VERSION WITH CAROUSEL SUPPORT
// ============================================
import React from 'react';
import { ShimmerWrapper } from 'opub-ui';
import styles from './DatasetListingSkeleton.module.css';

interface DatasetListingSkeletonProps {
  cardCount?: number;
  filterCount?: number;
  cardsOnly?: boolean;
}

export function DatasetListingSkeleton({
  cardCount = 9,
  filterCount = 12,
  cardsOnly = false,
}: DatasetListingSkeletonProps) {
  // If cardsOnly is true, return carousel layout for homepage
  if (cardsOnly) {
    return (
      <ShimmerWrapper>
        <div className={styles.carouselContainer}>
          {Array.from({ length: cardCount }).map((_, index) => (
            <DatasetCardSkeleton key={index} carousel={true} />
          ))}
        </div>
      </ShimmerWrapper>
    );
  }

  // Full layout with filters and search for listing page
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
                    <DatasetCardSkeleton key={index} carousel={false} />
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
      {/* Header */}
      <div className={styles.filterHeader}>
        <div className={styles.filterTitle} />
        <div className={styles.resetButton} />
      </div>

      {/* Filter Items */}
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

function DatasetCardSkeleton({ carousel = false }: { carousel?: boolean }) {
  return (
    <div className={carousel ? styles.carouselCard : styles.card}>
      {/* Title */}
      <div className={styles.cardTitle} />

      {/* Metadata Row */}
      <div className={styles.metadataRow}>
        <div className={styles.metadataItem}>
          <div className={styles.metadataIcon} />
          <div className={styles.metadataText} />
        </div>
        <div className={styles.metadataItem}>
          <div className={styles.metadataIcon} />
          <div className={styles.metadataTextSmall} />
        </div>
        <div className={styles.metadataItem}>
          <div className={styles.metadataIcon} />
          <div className={styles.metadataTextMedium} />
        </div>
      </div>

      {/* Description Lines */}
      <div className={styles.descriptionLines}>
        <div className={styles.descriptionLine} />
        <div className={styles.descriptionLine} />
        <div className={styles.descriptionLineShort} />
      </div>

      {/* Footer */}
      <div className={styles.cardFooter}>
        <div className={styles.footerIcon} />
        <div className={styles.footerIcon} />
        <div className={styles.footerIcon} />
      </div>
    </div>
  );
}