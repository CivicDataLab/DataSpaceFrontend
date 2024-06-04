import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from 'opub-ui';

interface BreadCrumbsProps {
  data: { href: string; label: string }[];
}

const BreadCrumbs: React.FC<BreadCrumbsProps> = ({ data }) => {
  return (
    <div className="bg-baseGraySlateSolid2 px-6 py-2 lg:px-10">
      <Breadcrumb className="mx-1">
        <BreadcrumbList>
          {data.map((item, index) => (
            <React.Fragment key={index}>
              {index === data.length - 1 ? (
                <BreadcrumbItem>
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                </BreadcrumbItem>
              ) : (
                <BreadcrumbItem>
                  <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                </BreadcrumbItem>
              )}
              {index < data.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default BreadCrumbs;
