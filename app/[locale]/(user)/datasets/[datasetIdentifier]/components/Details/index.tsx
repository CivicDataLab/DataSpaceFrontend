import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentProps,
  type ReactNode,
} from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  IconChartBar,
  IconChartLine,
  IconChartTreemap,
  IconCheck,
  IconCircleCheck,
  IconCode,
  IconCopy,
  IconPhoto,
  IconShare,
  IconX,
  IconTopologyStarRing3,
  IconWorld,
} from '@tabler/icons-react';
import { renderGeoJSON } from '@/geo_json/render_geojson';
import { graphql } from '@/gql';
import { ChartDetailsQueryQuery } from '@/gql/generated/graphql';
import { useQuery } from '@tanstack/react-query';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts/core';
import { Button, Dialog, Popover, Spinner, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';

const DetailsQuery = graphql(`
  query ChartDetailsQuery($datasetId: UUID!) {
    getChartData(datasetId: $datasetId) {
      __typename
      ... on TypeResourceChart {
        chartType
        description
        id
        name
        chart {
          options
        }
      }
      ... on TypeResourceChartImage {
        name
        id
        description
        image {
          name
          url
        }
      }
    }
  }
`);

type ChartItem = ChartDetailsQueryQuery['getChartData'][number];
type ResourceChart = Extract<ChartItem, { __typename: 'TypeResourceChart' }>;

function ChartTypeIcon({ item }: { item: ChartItem }) {
  const props = {
    size: 16,
    stroke: 1.75,
    className: 'shrink-0 text-[#0a0a0a]',
    'aria-hidden': true,
  } as const;

  if (item.__typename !== 'TypeResourceChart') return <IconPhoto {...props} />;
  const kind = String(item.chartType);
  if (kind === 'LINE') return <IconChartLine {...props} />;
  if (kind === 'TREEMAP') return <IconChartTreemap {...props} />;
  if (kind === 'MAP' || kind === 'GEOSPATIAL_MAP' || kind === 'POINT_MAP') {
    return <IconWorld {...props} />;
  }
  if (
    kind === 'MAP_POLYGON' ||
    kind === 'POLYGON_MAP' ||
    kind === 'ASSAM_DISTRICT' ||
    kind === 'ASSAM_RC'
  ) {
    return <IconTopologyStarRing3 {...props} />;
  }
  return <IconChartBar {...props} />;
}

function centeredLegend(legend: unknown) {
  const center = (entry: unknown) => {
    if (!entry || typeof entry !== 'object') return entry;
    const rest = { ...(entry as Record<string, unknown>) };
    delete rest.right;
    return { ...rest, left: 'center' };
  };
  if (Array.isArray(legend)) return legend.map(center);
  if (legend && typeof legend === 'object') return center(legend);
  return legend;
}

/**
 * Legend and toolbox placement use ECharts methods that are typed as private.
 * The cast stays inside these helpers so the public chart instance still type-checks.
 */
type ChartView = {
  getWidth: () => number;
  setOption: (option: object) => void;
  getModel: () => { getComponent: (type: string, index: number) => unknown };
  getViewOfComponentModel: (model: unknown) => {
    group?: {
      getBoundingRect: () => { width: number };
      eachChild: (
        cb: (child: {
          __title?: string;
          setTextConfig?: (cfg: { offset: number[] }) => void;
        }) => void
      ) => void;
    };
  };
};

type ReadyChart = Parameters<
  NonNullable<ComponentProps<typeof ReactECharts>['onChartReady']>
>[0];

function chartView(chart: ReadyChart): ChartView {
  return chart as unknown as ChartView;
}

function alignLegend(chart: ReadyChart) {
  const view = chartView(chart);
  const width = view.getWidth();
  if (!width) return;
  const model = view.getModel().getComponent('legend', 0);
  if (!model) return;
  const group = view.getViewOfComponentModel(model).group;
  if (!group) return;
  const legendWidth = group.getBoundingRect().width;
  if (!legendWidth) return;
  const shift = width * 0.05 - 8;
  view.setOption({
    legend: [{ left: (width - legendWidth) / 2 + shift }],
  });
}

function tuckToolboxLabels(chart: ReadyChart) {
  const view = chartView(chart);
  const model = view.getModel().getComponent('toolbox', 0);
  if (!model) return;
  const group = view.getViewOfComponentModel(model).group;
  if (!group) return;
  group.eachChild((child) => {
    if (!child.__title || !child.setTextConfig) return;
    child.setTextConfig({ offset: [4, 0] });
  });
}

function NudgedChart({ option, height }: { option: object; height: number }) {
  const settled = useRef(false);
  return (
    <ReactECharts
      option={option}
      style={{ height, width: '100%' }}
      shouldSetOption={() => !settled.current}
      onChartReady={(chart) => {
        alignLegend(chart);
        tuckToolboxLabels(chart);
        settled.current = true;
      }}
    />
  );
}

function previewOptions<T extends object>(options: T): T {
  const source = options as Record<string, unknown>;
  const zoom = source.dataZoom;
  const grid = source.grid;
  const next: Record<string, unknown> = {
    ...source,
    legend: centeredLegend(source.legend),
    toolbox: { show: false },
    dataZoom: Array.isArray(zoom)
      ? zoom.map((entry) =>
          entry && typeof entry === 'object' ? { ...entry, show: false } : entry
        )
      : zoom,
  };
  if (grid && typeof grid === 'object' && !Array.isArray(grid)) {
    next.grid = { ...grid, right: 16, bottom: 28 };
  }
  return next as T;
}

function chartPageUrl() {
  const url = new URL(window.location.href);
  url.hash = 'dataset-visualisations';
  return url.toString();
}

function subscribeToPageUrl(onStoreChange: () => void) {
  window.addEventListener('hashchange', onStoreChange);
  return () => window.removeEventListener('hashchange', onStoreChange);
}

function emptyShareUrl() {
  return '';
}

function showLinkCopied() {
  toast.custom(
    (id) => (
      <div className="flex w-[320px] items-center gap-2 rounded-[8px] border-[1px] border-solid border-[#e5e5e5] bg-white px-3 py-2.5 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
        <IconCircleCheck
          size={18}
          stroke={1.75}
          className="shrink-0 text-[#1f9d55]"
          aria-hidden
        />
        <p className="m-0 flex-1 font-primary text-100 font-medium leading-2 text-[#0a0a0a]">
          Link copied to clipboard
        </p>
        <button
          type="button"
          aria-label="Dismiss notification"
          className="flex h-8 w-8 shrink-0 cursor-pointer appearance-none items-center justify-center rounded-full border-[0px] bg-transparent p-0 text-[#0a0a0a] hover:bg-[#e4e4e6] hover:text-[#0a0a0a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryBlue [&_svg]:text-[#0a0a0a] [&_svg]:![stroke:#0a0a0a]"
          onClick={() => toast.dismiss(id)}
        >
          <IconX size={16} stroke={1.75} aria-hidden />
        </button>
      </div>
    ),
    { position: 'top-right', duration: 4000 }
  );
}

function embedSnippet(url: string, title: string) {
  const safeTitle = title.replace(/"/g, '&quot;');
  return `<iframe src="${url}" title="${safeTitle}" width="100%" height="480" style="border:0"></iframe>`;
}

const DIALOG_ACTION =
  '!inline-flex !h-9 !items-center !justify-center !gap-2 !rounded-[10px] !border-[0.8px] !border-solid !border-[#d4d4d8] !bg-white !px-3 !font-primary !text-[14px] !font-medium !leading-2 !text-[#0a0a0a] ![box-shadow:none] hover:!bg-[#f4f4f5] [&_svg]:!size-4 [&_svg]:!shrink-0 [&_svg]:!text-[#0a0a0a] [&_svg]:![stroke:#0a0a0a]';

const DIALOG_CHROME = `
[data-chart-dialog] button[aria-label="Close dialog"] {
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  width: 32px !important;
  height: 32px !important;
  margin: 0 !important;
  padding: 0 !important;
  border-radius: 9999px !important;
  color: #0a0a0a !important;
}
[data-chart-dialog] button[aria-label="Close dialog"] svg {
  color: #0a0a0a !important;
  stroke: #0a0a0a !important;
}
[data-chart-dialog] button[aria-label="Close dialog"]:hover {
  background: #e4e4e6 !important;
}
[data-chart-dialog] button[aria-label="Close dialog"]:hover svg {
  color: #0a0a0a !important;
  stroke: #0a0a0a !important;
}
.chart-dialog-plot .echarts-for-react > div[style*="position: absolute"] {
  transform: translateX(calc(5% - 8px));
}
`;

function dialogOptions<T extends object>(options: T): T {
  const source = options as Record<string, unknown>;
  const toolbox = source.toolbox;
  const grid = source.grid;
  const next: Record<string, unknown> = {
    ...source,
    legend: centeredLegend(source.legend),
  };
  if (toolbox && typeof toolbox === 'object' && !Array.isArray(toolbox)) {
    const emphasis =
      'emphasis' in toolbox &&
      toolbox.emphasis &&
      typeof toolbox.emphasis === 'object' &&
      !Array.isArray(toolbox.emphasis)
        ? (toolbox.emphasis as Record<string, unknown>)
        : {};
    const iconStyle =
      emphasis.iconStyle &&
      typeof emphasis.iconStyle === 'object' &&
      !Array.isArray(emphasis.iconStyle)
        ? (emphasis.iconStyle as Record<string, unknown>)
        : {};
    next.toolbox = {
      ...toolbox,
      right: 8,
      top: 36,
      emphasis: {
        ...emphasis,
        iconStyle: {
          ...iconStyle,
          textPadding: [2, 2, 2, 0],
          textBackgroundColor: '#ffffff',
        },
      },
    };
  }
  if (grid && typeof grid === 'object' && !Array.isArray(grid)) {
    next.grid = { ...grid, right: 120, bottom: 64 };
  }
  return next as T;
}

function ChartDialog({
  item,
  onClose,
}: {
  item: ChartItem;
  onClose: () => void;
}) {
  const shareUrl = useSyncExternalStore(
    subscribeToPageUrl,
    chartPageUrl,
    emptyShareUrl
  );
  const [embedCopied, setEmbedCopied] = useState(false);
  const description = item.description?.trim() ?? '';
  const subtitle = description
    ? /^based on\b/i.test(description)
      ? description
      : `Based on ${description}`
    : '';
  const snippet = embedSnippet(shareUrl, item.name);

  useEffect(() => {
    if (!embedCopied) return;
    const timer = window.setTimeout(() => setEmbedCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [embedCopied]);

  async function copyEmbed() {
    try {
      await navigator.clipboard.writeText(snippet);
      setEmbedCopied(true);
    } catch {
      setEmbedCopied(false);
    }
  }

  async function copyShareLink() {
    const url = shareUrl || chartPageUrl();
    try {
      await navigator.clipboard.writeText(url);
      showLinkCopied();
    } catch {
      toast.error('Could not copy the link', { position: 'top-right' });
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Content
        data-chart-dialog=""
        style={{
          top: '50%',
          width: 'min(640px, calc(100vw - 32px))',
          maxWidth: 'min(640px, calc(100vw - 32px))',
          maxHeight: 'calc(100vh - 32px)',
          borderRadius: '16px',
          overflow: 'hidden',
          transform: 'translate(-50%, -50%)',
          ['--show-to' as string]: 'translate(-50%, -50%)',
          ['--hide-from' as string]: 'translate(-50%, -50%)',
        }}
        title={
          (
            <span className="flex min-w-0 flex-col gap-1">
              <span className="font-primary text-200 font-semi-bold leading-3 tracking-[0px] text-primaryBlue">
                {item.name}
              </span>
              {subtitle ? (
                <span className="font-primary text-100 font-regular leading-2 tracking-[0px] text-[#686868]">
                  {subtitle}
                </span>
              ) : null}
            </span>
          ) as unknown as string
        }
      >
        <style>{DIALOG_CHROME}</style>
        <div className="chart-dialog-plot" style={chartNudge}>
          {item.__typename === 'TypeResourceChart' && item.chart?.options ? (
            <NudgedChart
              option={dialogOptions(item.chart.options)}
              height={300}
            />
          ) : (
            <Image
              src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/download/chart_image/${item.id}`}
              alt={item.name}
              width={640}
              height={300}
              unoptimized
              className="w-full object-contain"
              style={{ height: 300 }}
            />
          )}
        </div>
        <div className="-mx-[var(--space-5)] -mb-[var(--space-5)] mt-2 flex items-center justify-end gap-2 border-t-[0.8px] border-solid border-[#e5e5e5] px-[var(--space-5)] py-4">
            <Button
              kind="secondary"
              className={DIALOG_ACTION}
              icon={<IconShare size={16} stroke={1.75} aria-hidden />}
              onClick={() => void copyShareLink()}
            >
              Share
            </Button>
            <Popover>
              <Popover.Trigger>
                <Button
                  kind="secondary"
                  className={DIALOG_ACTION}
                  icon={<IconCode size={16} stroke={1.75} aria-hidden />}
                >
                  Embed
                </Button>
              </Popover.Trigger>
              <Popover.Content
                side="top"
                align="end"
                sideOffset={8}
                className="!z-[10000] !m-0 !box-border !w-[360px] !rounded-[10px] !border-[0.8px] !border-solid !border-[#e5e5e5] !bg-white !p-3 !font-primary !text-100 !leading-2 !text-[#0a0a0a] !shadow-[0px_4px_16px_0px_rgba(0,0,0,0.05)]"
              >
                <p className="m-0 font-primary text-75 font-medium uppercase leading-1 tracking-[0.6px] text-[#686868]">
                  Embed code
                </p>
                <p className="m-0 mt-2 break-all rounded-[8px] bg-[#f6f6f7] p-2 font-primary text-75 leading-1 text-[#0a0a0a]">
                  {snippet}
                </p>
                <button
                  type="button"
                  onClick={() => void copyEmbed()}
                  className="mt-2 inline-flex appearance-none items-center gap-1.5 border-[0px] bg-transparent p-0 font-primary text-75 font-medium text-primaryBlue"
                >
                  {embedCopied ? (
                    <IconCheck size={14} stroke={1.75} aria-hidden />
                  ) : (
                    <IconCopy size={14} stroke={1.75} aria-hidden />
                  )}
                  {embedCopied ? 'Copied' : 'Copy embed code'}
                </button>
              </Popover.Content>
            </Popover>
        </div>
      </Dialog.Content>
    </Dialog>
  );
}

function ChartCard({
  item,
  chart,
  expanded,
  onToggle,
  onOpen,
}: {
  item: ChartItem;
  chart: ReactNode;
  expanded: boolean;
  onToggle: () => void;
  onOpen: () => void;
}) {
  const description = item.description?.trim() ?? '';
  const long = description.length > 180;
  const shown =
    long && !expanded ? `${description.slice(0, 180)}...` : description;
  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-[18px] border-[0.8px] border-solid border-[#e5e5e5] bg-white">
      <div className="px-2 pt-2">
        <div style={chartNudge}>{chart}</div>
      </div>
      <div className="mt-auto border-t-[0.8px] border-solid border-[#e5e5e5] px-4 py-4 hover:bg-[#f6f6f7]">
        <button
          type="button"
          onClick={onOpen}
          className="w-full cursor-pointer appearance-none border-[0px] bg-transparent p-0 text-left"
        >
          <span className="flex items-center gap-2">
            <ChartTypeIcon item={item} />
            <span className="font-primary text-100 font-semi-bold leading-2 tracking-[0px] text-[#0a0a0a]">
              {item.name}
            </span>
          </span>
          {shown ? (
            <span className="mt-1 block font-primary text-100 font-regular leading-2 tracking-[0px] text-[#686868]">
              {shown}
            </span>
          ) : null}
        </button>
        {long ? (
          <button
            type="button"
            onClick={onToggle}
            className="mt-1 appearance-none border-[0px] bg-transparent p-0 font-primary text-100 font-medium text-primaryBlue"
          >
            {expanded ? 'See less' : 'See more'}
          </button>
        ) : null}
      </div>
    </article>
  );
}

const CHART_HEIGHT = 280;
const chartNudge = { transform: 'translateX(calc(-5% + 8px))' };

const Details: React.FC = () => {
  const params = useParams();

  const datasetId = Array.isArray(params.datasetIdentifier)
    ? params.datasetIdentifier[0]
    : params.datasetIdentifier;

  const { data, isLoading } = useQuery(
    [`chartDetails_${datasetId}`],
    () => GraphQL(DetailsQuery, {}, { datasetId }),
    { enabled: Boolean(datasetId) }
  );

  const renderChart = (item: ResourceChart) => {
    if (item.chartType === 'ASSAM_DISTRICT' || item.chartType === 'ASSAM_RC') {
      const geoJson = renderGeoJSON(item.chartType.toLowerCase());
      if (geoJson && geoJson.type === 'FeatureCollection') {
        echarts.registerMap(
          item.chartType.toLowerCase(),
          geoJson as Parameters<typeof echarts.registerMap>[1]
        );
      }
    }

    return (
      <NudgedChart
        option={
          item.chart?.options
            ? previewOptions(item.chart.options)
            : item.chart?.options
        }
        height={CHART_HEIGHT}
      />
    );
  };

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [openChart, setOpenChart] = useState<ChartItem | null>(null);
  const charts = data?.getChartData ?? [];

  return (
    <>
      {isLoading ? (
        <div className=" mt-8 flex justify-center">
          <Spinner />
        </div>
      ) : charts.length > 0 ? (
        <div
          className={`mt-5 grid grid-cols-1 gap-4 ${
            charts.length > 1 ? 'md:grid-cols-2' : ''
          }`}
        >
          {charts.map((item) => (
            <ChartCard
              key={item.id}
              item={item}
              expanded={expandedId === item.id}
              onOpen={() => setOpenChart(item)}
              onToggle={() =>
                setExpandedId((current) =>
                  current === item.id ? null : item.id
                )
              }
              chart={
                item.__typename === 'TypeResourceChart' &&
                item.chart?.options ? (
                  renderChart(item)
                ) : (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/download/chart_image/${item.id}`}
                    alt=""
                    width={640}
                    height={CHART_HEIGHT}
                    unoptimized
                    className="w-full object-contain"
                    style={{ height: CHART_HEIGHT }}
                  />
                )
              }
            />
          ))}
        </div>
      ) : null}
      {openChart ? (
        <ChartDialog item={openChart} onClose={() => setOpenChart(null)} />
      ) : null}
      {isLoading || charts.length > 0 ? null : (
        <div className="mt-5 flex flex-col items-center justify-center rounded-[18px] border-[0.8px] border-dashed border-[#e5e5e5] bg-white px-6 py-16 text-center">
          <IconChartBar
            size={20}
            stroke={2}
            className="text-textSubdued"
            aria-hidden
          />
          <p className="mt-3 font-primary text-100 font-medium leading-2 tracking-[0px] text-[#0a0a0a]">
            No visualisations yet
          </p>
          <p className="mt-1 font-primary text-75 font-regular leading-1 tracking-[0px] text-[#686868]">
            No charts or maps have been published for this dataset.
          </p>
        </div>
      )}
    </>
  );
};

export default Details;
