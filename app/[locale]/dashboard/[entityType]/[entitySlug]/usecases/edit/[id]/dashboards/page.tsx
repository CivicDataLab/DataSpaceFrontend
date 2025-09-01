'use client';

import React, { useCallback, useEffect, useState, use } from 'react';
import Link from 'next/link';
import { graphql } from '@/gql';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Icon, Text, TextField, toast } from 'opub-ui';

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

const Dashboard = (
  props: { params: Promise<{ entityType: string; entitySlug: string; id: string }> }
) => {
  const params = use(props.params);
  const usecaseId = parseInt(params.id);

  const [dashboards, setDashboards] = useState<
    Array<{ id: string; name: string; link: string }>
  >([]);
  const [previousState, setPreviousState] = useState<any>({});

  const { isSuccess, data } = useQuery({
    queryKey: ['fetch_dashboardData', usecaseId],
    queryFn: () => GraphQL(dashboardList, { [params.entityType]: params.entitySlug }, { usecaseId }),
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  useEffect(() => {
    if (isSuccess && data) {
      const dashboardData = data as { usecaseDashboards?: Array<{ id: string; name: string; link: string }> };
      if (dashboardData.usecaseDashboards) {
        setDashboards(dashboardData.usecaseDashboards);
        setPreviousState(
          Object.fromEntries(
            dashboardData.usecaseDashboards.map((item: any) => [item.id, { ...item }])
          )
        );
      }
    }
  }, [data, isSuccess]);

  const { mutate: addDashboard, isPending: addLoading } = useMutation(
    {
      mutationFn: ({ usecaseId }: { usecaseId: number }) =>
        GraphQL(AddDashboard, { [params.entityType]: params.entitySlug }, { usecaseId }),
      onSuccess: (res: any) => {
        const newDashboard = res.addUsecaseDashboard.data;

        setDashboards((prev: any) => [...prev, newDashboard]);
        setPreviousState((prev: any) => ({
          ...prev,
          [newDashboard.id]: { ...newDashboard },
        }));
        toast.success('Dashboard added');
      },
    }
  );
  const { mutate: saveDashboard, isPending: saveLoading } = useMutation(
    {
      mutationFn: ({ id, name, link }: { id: string; name: string; link: string }) =>
        GraphQL(updateDashboard, { [params.entityType]: params.entitySlug }, { id, name, link }),
      onSuccess: ({ updateUsecaseDashboard }: any) => {
        toast.success('Changes saved');
        setPreviousState((prev: any) => ({
          ...prev,
          [updateUsecaseDashboard.data.id]: { ...updateUsecaseDashboard.data },
        }));
      },
      onError: (error: any) => {
        toast(`Error: ${error.message}`);
      },
    }
  );

  const { mutate: removeDashboard, isPending: deleteLoading } = useMutation({
    mutationFn: (id: number) => GraphQL(deleteDashboard, { [params.entityType]: params.entitySlug }, { id }),
    onSuccess: (_, id) => {
      setDashboards((prev) => prev.filter((d) => d.id !== id.toString()));
      toast.success('Dashboard deleted');
    },
    onError: (error: any) => {
      toast(`Error: ${error.message}`);
    },
  });

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

  const { setStatus } = useEditStatus();

  useEffect(() => {
    setStatus(
      saveLoading || addLoading || deleteLoading ? 'loading' : 'success'
    ); // update based on mutation state
  }, [saveLoading, addLoading, deleteLoading]);

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
    </div>
  );
};

export default Dashboard;
