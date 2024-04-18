'use client';

import React from 'react';
import { Button, Form, Input, Text } from 'opub-ui';

import { EmptyState } from './components/empty';
import { Item, ListItem } from './components/list';
import { ViewDialog } from './components/view-dialog';
import { data } from './constants';

export default function Views() {
  const [viewName, setViewName] = React.useState('');
  const [modalOpen, setModalOpen] = React.useState(false);
  const [addedItems, setAddedItems] = React.useState<Item[]>([]);
  const [viewEdit, setViewEdit] = React.useState<Item | null>(null);
  console.log(addedItems);

  function handleEditClick(item: Item) {
    setViewEdit(item);
    setModalOpen(true);
  }

  return (
    <div>
      <Text variant="headingMd">Views</Text>
      <Text variant="bodyMd" className="mt-2 block">
        Select the view you want to display for the distribution. You can select
        the view and then customize the options for the view below.
      </Text>

      <div className="mt-4">
        <Form
          onSubmit={() => {
            setModalOpen(true);
          }}
        >
          <Input
            name="view-name"
            label="Name"
            value={viewName}
            onChange={setViewName}
            required
            error="View name is required"
            connectedRight={
              <Button variant="interactive" submit>
                Create View
              </Button>
            }
          />
        </Form>

        <ViewDialog
          open={modalOpen}
          name={viewName}
          data={data}
          setOpen={setModalOpen}
          setAddedItems={setAddedItems}
          viewData={viewEdit}
          setViewEdit={setViewEdit}
        />
      </div>

      <div className="mt-12">
        {addedItems && addedItems.length > 0 ? (
          <div className="flex flex-col gap-3">
            {addedItems.map((item) => (
              <ListItem
                item={item}
                key={item.id}
                setAddedItems={setAddedItems}
                handleEditClick={handleEditClick}
              />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
