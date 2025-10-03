import React from 'react';
import { Text } from 'opub-ui';

const Dashboards = () => {
  return (
    <div className="bg-surfaceDefault py-8 lg:py-14">
      <div className="container">
        <div className="flex flex-col gap-1">
          <Text variant="headingXl">Dashboards & Visualizations</Text>
          <Text variant="bodyLg" fontWeight="regular">
            Interactive dashboards and data visualizations from this collaborative
          </Text>
        </div>
        <div className="mt-10">
          <Text variant="bodyLg" color="subdued">
            No dashboards available for this collaborative yet.
          </Text>
        </div>
      </div>
    </div>
  );
};

export default Dashboards;
