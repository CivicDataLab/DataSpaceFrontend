'use client';

import { useParams, useSearchParams } from 'next/navigation';

import ChartGenVizPreview from './components/ChartGenVizPreview';
import ChartImagePreview from './components/ChartImagePreview';

const ChartDetails = () => {
  /*
    Chart preview page to edit chart details and publish the chart
  */

  const params = useParams<{
    entityType: string;
    entitySlug: string;
    chartID: string;
  }>();

  const searchParams = useSearchParams();

  const chartPreviewType = searchParams.get('type');

  return chartPreviewType === 'TypeResourceChartImage' ? (
    <ChartImagePreview params={params} />
  ) : (
    <ChartGenVizPreview params={params} />
  );
};

export default ChartDetails;
