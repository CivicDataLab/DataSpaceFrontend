'use client';

import { useEffect, useState } from 'react';

import { UnderlineTabs } from '@/components/UnderlineTabs/UnderlineTabs';

import type {
  DatasetCoverDataset,
  DatasetCoverLink,
} from '../../dataset-cover';
import Details from '../Details';
import {
  DatasetConnected,
  type ConnectedFilter,
} from '../DatasetConnected/DatasetConnected';
import { DatasetFiles } from '../DatasetFiles/DatasetFiles';
import { DatasetMetadata } from '../DatasetMetadata/DatasetMetadata';

type DatasetTab = 'data' | 'visualisations' | 'metadata' | 'connected';

const TAB_HASH: Record<DatasetTab, string> = {
  data: '#dataset-files',
  visualisations: '#dataset-visualisations',
  metadata: '#dataset-metadata',
  connected: '#dataset-connected',
};

const FILTER_HASH: Record<ConnectedFilter, string> = {
  all: '#dataset-connected',
  usecases: '#dataset-connected-usecases',
  collaboratives: '#dataset-connected-collaboratives',
};

export function DatasetTabs({
  datasetId,
  dataset,
  useCases,
  collaboratives,
}: {
  datasetId: string;
  dataset: DatasetCoverDataset;
  useCases: DatasetCoverLink[] | null;
  collaboratives: DatasetCoverLink[] | null;
}) {
  const [tab, setTab] = useState<DatasetTab>('data');
  const [filter, setFilter] = useState<ConnectedFilter>('all');

  useEffect(() => {
    const sync = () => {
      const hash = window.location.hash;
      setTab(tabFromHash(hash));
      setFilter(filterFromHash(hash));
    };
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const href = target.closest('a')?.getAttribute('href');
      if (!href || !isSectionHash(href)) return;
      setTab(tabFromHash(href));
      setFilter(filterFromHash(href));
    };

    sync();
    window.addEventListener('hashchange', sync);
    document.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('hashchange', sync);
      document.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <section className="bg-white">
      <span id="dataset-files" className="sr-only" />
      <span id="dataset-visualisations" className="sr-only" />
      <span id="dataset-metadata" className="sr-only" />
      <span id="dataset-connected" className="sr-only" />
      <span id="dataset-connected-usecases" className="sr-only" />
      <span id="dataset-connected-collaboratives" className="sr-only" />
      <div className="mx-auto box-border min-w-0 max-w-[1400px] px-5 pb-16 pt-6 sm:px-6 lg:px-8 xl:px-0">
          <UnderlineTabs
            label="Dataset sections"
            idPrefix="dataset-tab"
            value={tab}
            tabs={[
              { value: 'data', label: 'Data' },
              { value: 'visualisations', label: 'Visualisations' },
              { value: 'metadata', label: 'Metadata' },
              { value: 'connected', label: 'Connected to' },
            ]}
            onValueChange={(value) => {
              if (!isDatasetTab(value)) return;
              const hash = TAB_HASH[value];
              setTab(value);
              setFilter(filterFromHash(hash));
              window.history.replaceState(null, '', hash);
            }}
          />
          <div
            role="tabpanel"
            id="dataset-tab-panel-data"
            aria-labelledby="dataset-tab-data"
            hidden={tab !== 'data'}
            className="pt-8"
          >
            <div data-tour="preview">
              <DatasetFiles datasetId={datasetId} />
            </div>
          </div>
          <div
            role="tabpanel"
            id="dataset-tab-panel-visualisations"
            aria-labelledby="dataset-tab-visualisations"
            hidden={tab !== 'visualisations'}
            className="pt-8"
          >
            <div>
              <h2 className="font-primary text-300 font-semi-bold leading-[26px] tracking-[0px] text-primaryBlue">
                Visualisations
              </h2>
              <p className="mt-1 font-primary text-100 font-regular leading-2 tracking-[0px] text-[#6b686b]">
                Charts and maps created from this dataset.
              </p>
              {tab === 'visualisations' ? <Details /> : null}
            </div>
          </div>
          <div
            role="tabpanel"
            id="dataset-tab-panel-metadata"
            aria-labelledby="dataset-tab-metadata"
            hidden={tab !== 'metadata'}
            className="pt-8"
          >
            <DatasetMetadata dataset={dataset} />
          </div>
          <div
            role="tabpanel"
            id="dataset-tab-panel-connected"
            aria-labelledby="dataset-tab-connected"
            hidden={tab !== 'connected'}
            className="pt-8"
          >
            <DatasetConnected
              useCases={useCases}
              collaboratives={collaboratives}
              loadCards={tab === 'connected'}
              filter={filter}
              onFilterChange={(next) => {
                setTab('connected');
                setFilter(next);
                window.history.replaceState(null, '', FILTER_HASH[next]);
              }}
            />
          </div>
      </div>
    </section>
  );
}

function tabFromHash(hash: string): DatasetTab {
  if (hash === TAB_HASH.visualisations) return 'visualisations';
  if (hash === TAB_HASH.metadata) return 'metadata';
  if (hash.startsWith(TAB_HASH.connected)) return 'connected';
  return 'data';
}

function filterFromHash(hash: string): ConnectedFilter {
  if (hash === FILTER_HASH.usecases) return 'usecases';
  if (hash === FILTER_HASH.collaboratives) return 'collaboratives';
  return 'all';
}

function isSectionHash(href: string): boolean {
  return (
    Object.values(TAB_HASH).includes(href) ||
    Object.values(FILTER_HASH).includes(href)
  );
}

function isDatasetTab(value: string): value is DatasetTab {
  return (
    value === 'data' ||
    value === 'visualisations' ||
    value === 'metadata' ||
    value === 'connected'
  );
}
