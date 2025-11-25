// ============================================
// FILE: components/loading/Skeleton/PublisherListingSkeleton/PublisherListingSkeleton.tsx
// CARDS ONLY - No header, no buttons
// ============================================
import React from 'react';
import { ShimmerWrapper } from 'opub-ui';
import styles from './PublisherListingSkeleton.module.css';

interface PublisherListingSkeletonProps {
  cardCount?: number;
}

export function PublisherListingSkeleton({
  cardCount = 6,
}: PublisherListingSkeletonProps) {
  return (
    <ShimmerWrapper>
      <div className={styles.cardsGrid}>
        {Array.from({ length: cardCount }).map((_, index) => (
          <PublisherCardSkeleton key={index} />
        ))}
      </div>
    </ShimmerWrapper>
  );
}

function PublisherCardSkeleton() {
  return (
    <div className={styles.card}>
      {/* Header: Logo + Name + Badge */}
      <div className={styles.cardHeader}>
        <div className={styles.logo} />
        <div className={styles.cardHeaderText}>
          <div className={styles.publisherName} />
          <div className={styles.typeBadge} />
        </div>
      </div>

      {/* Stats Pills */}
      <div className={styles.statsRow}>
        <div className={styles.statPill} />
        <div className={styles.statPill} />
      </div>

      {/* Description */}
      <div className={styles.description}>
        <div className={styles.descriptionLine} />
        <div className={styles.descriptionLine} />
      </div>
    </div>
  );
}