import React, { lazy } from 'react';
import { Spinner } from 'opub-ui';

// Lazy load heavy components to improve initial page load
export const LazyEChartsComponent = lazy(() => import('echarts-for-react'));

export const LazyChartEditor = lazy(() => 
  import('@/app/[locale]/dashboard/[entityType]/[entitySlug]/charts/components/ChartEditor')
);

export const LazyMapChart = lazy(() => 
  import('@/components/MapChart/MapChart')
);

// Loading fallback component
export const ComponentLoader = () => (
  <div className="flex items-center justify-center p-8">
    <Spinner size={20} />
  </div>
);

// Higher-order component for lazy loading with consistent loading state
export const withLazyLoading = <P extends object>(
  LazyComponent: React.LazyExoticComponent<React.ComponentType<P>>
) => {
  function LazyWithSuspense(props: P) {
    return (
      <React.Suspense fallback={<ComponentLoader />}>
        <LazyComponent {...props} />
      </React.Suspense>
    );
  }

  return LazyWithSuspense;
};

const lazyComponents = {
  LazyEChartsComponent,
  LazyChartEditor,
  LazyMapChart,
  ComponentLoader,
  withLazyLoading,
};

export default lazyComponents;