// ============================================
// FILE: components/loading/Skeleton/SectorListingSkeleton/SectorListingSkeleton.tsx
// CARDS ONLY - No header, no breadcrumbs
// ============================================
import React from 'react';
import { ShimmerWrapper } from 'opub-ui';
import styles from './SectorListingSkeleton.module.css';

interface SectorListingSkeletonProps {
  cardCount?: number;
}

export function SectorListingSkeleton({
  cardCount = 9,
}: SectorListingSkeletonProps) {
  return (
    <ShimmerWrapper>
      <div className={styles.cardsGrid}>
        {Array.from({ length: cardCount }).map((_, index) => (
          <SectorCardSkeleton key={index} />
        ))}
      </div>
    </ShimmerWrapper>
  );
}

function SectorCardSkeleton() {
  return (
    <div className={styles.card}>
      {/* Icon and Title section */}
      <div className={styles.cardContent}>
        <div className={styles.icon} />
        <div className={styles.textSection}>
          <div className={styles.title} />
          <div className={styles.datasetCount} />
        </div>
      </div>
    </div>
  );
}