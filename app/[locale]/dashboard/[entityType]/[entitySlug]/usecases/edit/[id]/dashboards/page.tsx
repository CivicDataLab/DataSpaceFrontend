'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { graphql } from '@/gql';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Icon, Spinner, Text, TextField, toast } from 'opub-ui';

import { GraphQL } from '@/lib/api';
import { Icons } from '@/components/icons';
import { useEditStatus } from '../../context';

const dashboardList: any = graphql(`
  query dashboardList($usecaseId: Int!) {
    usecaseDashboards(usecaseId: $usecaseId) {
      id
      name
      link
      created
    }
  }
`);

const AddDashboard: any = graphql(`
  mutation addDashboard($usecaseId: Int!, $name: String, $link: String) {
    addUsecaseDashboard(usecaseId: $usecaseId, name: $name, link: $link) {
      success
      errors {
        fieldErrors {
          field
          messages
        }
      }
      data {
        id
        name
        link
      }
    }
  }
`);

const updateDashboard: any = graphql(`
  mutation updateDashboard($id: String!, $name: String, $link: String) {
    updateUsecaseDashboard(id: $id, name: $name, link: $link) {
      success
      errors {
        fieldErrors {
          field
          messages
        }
      }
      data {
        id
        name
        link
      }
    }
  }
`);

const deleteDashboard: any = graphql(`
  mutation deleteUsecaseDashboard($id: Int!) {
    deleteUsecaseDashboard(id: $id) {
      success
      errors {
        fieldErrors {
          field
          messages
        }
      }
    }
  }
`);

const Dashboard = () => {
  const params = useParams<{
    entityType?: string;
    entitySlug?: string;
    id?: string;
  }>();
  const DASHBOARD_ADD_SUCCESS_TOAST_ID = 'usecase-dashboard-add-success';
  const DASHBOARD_SAVE_SUCCESS_TOAST_ID = 'usecase-dashboard-save-success';
  const DASHBOARD_DELETE_SUCCESS_TOAST_ID = 'usecase-dashboard-delete-success';
  const DASHBOARD_SAVE_ERROR_TOAST_ID = 'usecase-dashboard-save-error';
  const DASHBOARD_DELETE_ERROR_TOAST_ID = 'usecase-dashboard-delete-error';
  const getErrorMessage = (error: any, fallback: string) =>
    typeof error?.message === 'string' && error.message.trim()
      ? error.message.trim()
      : fallback;
  const entityType = params?.entityType;
  const entitySlug = params?.entitySlug;
  const idParam = params?.id;

  const isValidParams =
    typeof entityType === 'string' &&
    typeof entitySlug === 'string' &&
    typeof idParam === 'string';

  const usecaseId =
    isValidParams && idParam ? Number.parseInt(idParam, 10) : NaN;

  const isValidId = !Number.isNaN(usecaseId) && isValidParams;

  const ownerArgs: Record<string, string> | null = isValidParams
    ? { [entityType]: entitySlug }
    : null;

  const [dashboards, setDashboards] = useState<
    Array<{ id: string; name: string; link: string }>
  >([]);
  const [previousState, setPreviousState] = useState<any>({});

  const queryKey = [
    'fetch_dashboardData',
    params.entityType,
    params.entitySlug,
    usecaseId,
  ];

  const { data: dashboardData, isLoading }: { data: any; isLoading: boolean } =
    useQuery(
    queryKey,
    () => GraphQL(dashboardList, ownerArgs || {}, { usecaseId }),
    {
      refetchOnMount: true,
      refetchOnReconnect: true,
      enabled: isValidId,
    }
  );

  useEffect(() => {
    if (dashboardData?.usecaseDashboards) {
      setDashboards(dashboardData.usecaseDashboards);
      setPreviousState(
        Object.fromEntries(
          dashboardData.usecaseDashboards.map((item: any) => [item.id, { ...item }])
        )
      );
    }
  }, [dashboardData]);

  const queryClient = useQueryClient();
  const invalidateDashboardQueries = () => {
    queryClient.invalidateQueries({ queryKey });
    queryClient.invalidateQueries({
      queryKey: [
        `fetch_UsecaseDetails`,
        params.id,
        params.entityType,
        params.entitySlug,
      ],
    });
  };

  const { mutate: addDashboard, isLoading: addLoading } = useMutation(
    ({ usecaseId }: { usecaseId: number }) =>
      GraphQL(AddDashboard, ownerArgs || {}, { usecaseId }),
    {
      onSuccess: () => {
        invalidateDashboardQueries();
        toast.success('Dashboard added', {
          id: DASHBOARD_ADD_SUCCESS_TOAST_ID,
        });
      },
    }
  );
  const { mutate: saveDashboard, isLoading: saveLoading } = useMutation(
    ({ id, name, link }: { id: string; name: string; link: string }) =>
      GraphQL(updateDashboard, ownerArgs || {}, { id, name, link }),
    {
      onSuccess: ({ updateUsecaseDashboard }: any) => {
        invalidateDashboardQueries();
        toast.success('Changes saved', { id: DASHBOARD_SAVE_SUCCESS_TOAST_ID });
        setPreviousState((prev: any) => ({
          ...prev,
          [updateUsecaseDashboard.data.id]: { ...updateUsecaseDashboard.data },
        }));
      },
      onError: (error: any) => {
        toast(
          `Error: ${getErrorMessage(error, 'Unable to save dashboard changes right now. Please try again.')}`,
          { id: DASHBOARD_SAVE_ERROR_TOAST_ID }
        );
      },
    }
  );

  const { mutate: removeDashboard, isLoading: deleteLoading } = useMutation(
    (id: number) => GraphQL(deleteDashboard, ownerArgs || {}, { id }),
    {
      onSuccess: () => {
        toast.success('Dashboard deleted', {
          id: DASHBOARD_DELETE_SUCCESS_TOAST_ID,
        });
        invalidateDashboardQueries();
      },
      onError: (error: any) => {
        toast(
          `Error: ${getErrorMessage(error, 'Unable to delete dashboard right now. Please try again.')}`,
          { id: DASHBOARD_DELETE_ERROR_TOAST_ID }
        );
      },
    }
  );

  const { setStatus } = useEditStatus();

  useEffect(() => {
    setStatus(
      saveLoading || addLoading || deleteLoading ? 'loading' : 'success'
    ); // update based on mutation state
  }, [saveLoading, addLoading, deleteLoading, setStatus]);

  if (!isValidId) {
    return null;
  }

  const handleChange = (id: string, field: 'name' | 'link', value: string) => {
    setDashboards((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  };

  const handleSave = (dashboard: {
    id: string;
    name: string;
    link: string;
  }) => {
    const prev = previousState[dashboard.id];
    if (dashboard.name !== prev?.name || dashboard.link !== prev?.link) {
      saveDashboard({
        id: dashboard.id,
        name: dashboard.name,
        link: dashboard.link,
      });
    }
  };

  const handleAdd = () => {
    addDashboard({ usecaseId });
  };

  const handleDelete = (id: string) => {
    removeDashboard(Number(id));
  };

  return (
    <div className="flex flex-col gap-4">
      <Text variant="headingMd">Dashboard</Text>
      <Text variant="bodyMd">
        Link external analytical dashboards to your use case. To create a new
        dashboard, go to{' '}
        <Link
          href={process.env.NEXT_PUBLIC_ANALYTICS_URL || '#'}
          className="text-primaryBlue underline"
          target="_blank"
        >
          CivicDataSpace Analytics
        </Link>
        .
      </Text>

      {isLoading ? (
        <div className="flex h-36 w-full items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <>
          {dashboards?.map((item) => (
            <div
              key={item.id}
              className="flex w-full flex-wrap items-center gap-5  lg:flex-nowrap"
            >
              <div className="w-full">
                <TextField
                  label="Dashboard Name"
                  name="dashboardName"
                  value={item.name}
                  onChange={(e) => handleChange(item.id, 'name', e)}
                  onBlur={() => handleSave(item)}
                />
              </div>
              <div className="w-full">
                <TextField
                  label="Dashboard URL"
                  name="dashboardUrl"
                  type="url"
                  value={item.link}
                  onChange={(e) => handleChange(item.id, 'link', e)}
                  onBlur={() => handleSave(item)}
                />
              </div>
              <Button
                kind="tertiary"
                onClick={() => handleDelete(item.id)}
                className=" mt-5"
              >
                <Icon source={Icons.delete} size={32} />
              </Button>
            </div>
          ))}
          <Button className="mx-auto mt-4 h-fit w-fit" onClick={handleAdd}>
            {dashboards.length > 0 ? 'Add Another Dashboard' : 'Add Dashboard'}
          </Button>
        </>
      )}
    </div>
  );
};

export default Dashboard;
