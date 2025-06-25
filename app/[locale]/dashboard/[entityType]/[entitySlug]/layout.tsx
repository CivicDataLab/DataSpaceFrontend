'use client';

import React, { useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import { SidebarNavItem } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { create } from 'zustand';

import { useDashboardStore } from '@/config/store';
import { GraphQL } from '@/lib/api';
import { cn } from '@/lib/utils';
import BreadCrumbs from '@/components/BreadCrumbs';
import { DashboardNav } from '../../components/dashboard-nav';
import { MobileDashboardNav } from '../../components/mobile-dashboard-nav';
import styles from '../../components/styles.module.scss';
import { getOrgDetailsQryDoc } from './schema';

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export default function OrgDashboardLayout({ children }: DashboardLayoutProps) {
  const [isOpened, setIsOpened] = React.useState(false);
  const params = useParams<{ entityType: string; entitySlug: string }>();
  const { setEntityDetails, entityDetails, userDetails } = useDashboardStore();

  const EntityDetailsQryRes: { data: any; isLoading: boolean; error: any } =
    useQuery([`entity_details_${params.entityType}`], () =>
      GraphQL(
        params.entityType === 'organization' && getOrgDetailsQryDoc,
        {
          [params.entityType]: params.entitySlug,
        },
        { slug: params.entitySlug }
      )
    );

  useEffect(() => {
    if (EntityDetailsQryRes.data) {
      setEntityDetails(EntityDetailsQryRes.data);
    }
  }, [EntityDetailsQryRes.data]);

  if (
    process.env.NEXT_PUBLIC_DATASPACE_FEATURE_ENABLED !== 'true' &&
    params.entityType === 'dataspace'
  ) {
    return notFound();
  }

  const orgSidebarNav: Array<SidebarNavItem> = [
    {
      title: 'Datasets',
      href: `/dashboard/${params.entityType}/${params.entitySlug}/dataset`,
      icon: 'datasetEdit',
    },

    ...(params.entityType === 'organization'
      ? [
          {
            title: 'Admin & Members',
            href: `/dashboard/${params.entityType}/${params.entitySlug}/admin`,
            icon: 'star',
          },
        ]
      : []),
    {
      title: 'UseCases',
      href: `/dashboard/${params.entityType}/${params.entitySlug}/usecases`,
      icon: 'light',
    },
    {
      title: 'Add & Manage Charts',
      href: `/dashboard/${params.entityType}/${params.entitySlug}/charts`,
      icon: 'chartBar',
    },
    {
      title: 'Profile',
      href: `/dashboard/${params.entityType}/${params.entitySlug}/profile`,
      icon: 'setting',
    },
  ];

  return (
    <>
      <BreadCrumbs
        data={
          params.entityType === 'organization'
            ? [
                { href: '/', label: 'Home' },
                {
                  href: '/dashboard',
                  label: 'User Dashboard',
                },
                {
                  href: `/dashboard/${params.entityType}`,
                  label: 'My Organizations',
                },
                {
                  href: '',
                  label:
                    EntityDetailsQryRes.data?.organizations[0]?.name ||
                    params.entitySlug,
                },
              ]
            : [
                { href: '/', label: 'Home' },
                {
                  href: '/dashboard',
                  label: 'User Dashboard',
                },
                {
                  href: `/dashboard/`,
                  label: 'My Dashboard',
                },
              ]
        }
      />
      <div
        className={cn(
          'relative flex flex-col md:flex-row',
          ' bg-surfaceDefault p-4 md:flex'
        )}
      >
        <DashboardNav
          items={orgSidebarNav}
          entityDetails={
            params.entityType === 'organization'
              ? entityDetails?.organizations[0]
              : userDetails?.me
          }
          type={params.entityType}
        />

        <div className="z-1 basis-2 md:hidden">
          <MobileDashboardNav
            setIsOpened={setIsOpened}
            isOpened={isOpened}
            items={orgSidebarNav}
          />
        </div>
        <div className={cn(styles.Main)}>{children}</div>
      </div>
    </>
  );
}
