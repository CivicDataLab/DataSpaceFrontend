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
    <div className="border-b sticky top-[70px] z-1 bg-secondaryOrange px-6 py-2 lg:top-[86px] ">
      <Breadcrumb className="mx-1">
        <BreadcrumbList className="">
          {data.map((item, index) => (
            <React.Fragment key={index}>
              {index === data.length - 1 ? (
                <BreadcrumbItem>
                  <BreadcrumbPage
                    title={item.label}
                    className="max-w-[16ch] truncate  font-bold lg:max-w-[40ch]"
                  >
                    {item.label}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              ) : (
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href={item.href}
                    title={item.label}
                    className="max-w-[16ch] truncate text-basePureBlack lg:max-w-[40ch]"
                  >
                    {item.label}
                  </BreadcrumbLink>
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
