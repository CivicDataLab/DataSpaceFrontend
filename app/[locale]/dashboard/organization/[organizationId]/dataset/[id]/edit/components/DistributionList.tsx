import { Button, ButtonGroup, Divider, Icon, Text } from 'opub-ui';

import { Icons } from '@/components/icons';
import { LinkButton } from '@/components/Link';

export function DistributionList({
  setPage,
}: {
  setPage: (page: 'list' | 'create') => void;
  setEditId: (id: string) => void;
}) {
  return (
    <div>
      <Text variant="headingMd">Add Distribution</Text>
      <div className="pt-4">
        <Divider />
      </div>
      <div className="py-20">
        <NoList setPage={setPage} />
      </div>
    </div>
  );
}

const NoList = ({
  setPage,
}: {
  setPage: (page: 'list' | 'create') => void;
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-6">
      <Icon
        source={Icons.distribution}
        size={64}
        stroke={1}
        color="interactive"
      />
      <div className="pt-4">
        <Text variant="headingSm" color="subdued">
          You have not added any distributions yet.
        </Text>
      </div>
      <div className="pt-6">
        <ButtonGroup>
          <LinkButton href={`${window.location}/views`} kind="secondary">
            Add Views
          </LinkButton>
          <Button onClick={() => setPage('create')}>Add Distribution</Button>
        </ButtonGroup>
      </div>
    </div>
  );
};
