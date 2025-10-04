'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button, Icon, Spinner, Tag, Text, Tray } from 'opub-ui';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

import { Icons } from '@/components/icons';
import Metadata from './Metadata';

const PrimaryDetails = ({ data, isLoading }: { data: any; isLoading: any }) => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div>
        <Text variant="heading2xl">{data.useCase.title}</Text>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {data.useCase.tags.map((item: any, index: number) => (
          <div key={index}>
            <Tag
              fillColor="var(--accent-tertiary-color)"
              borderColor="#5C9A91"
              textColor="black"
            >
              {item.value}
            </Tag>
          </div>
        ))}
      </div>
      <div
        className="mt-6 flex sm:block md:block lg:hidden"
        title="About the Dataset"
      >
        <Tray
          size="narrow"
          open={open}
          onOpenChange={setOpen}
          trigger={
            <div>
              <Button
                kind="tertiary"
                className="lg:hidden"
                onClick={(e) => setOpen(true)}
              >
                <div className="flex items-center gap-2 py-2">
                  <Icon source={Icons.info} size={24} color="default" />
                  <Text>Metadata</Text>
                </div>
              </Button>
            </div>
          }
        >
          {isLoading ? (
            <div className=" mt-8 flex justify-center">
              <Spinner />
            </div>
          ) : (
            <Metadata data={data} setOpen={setOpen} />
          )}
        </Tray>
      </div>
      <div className="mt-6 lg:mt-10">
        <Image
          src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${data.useCase.logo?.path.replace('/code/files/', '')}`}
          alt={data.useCase.title}
          width={100}
          height={100}
          className="h-full w-full"
          unoptimized
        />
      </div>
      <div className=" lg:pr-4">
        <div className="mt-6 lg:mt-10">
          <Text variant="headingXl">Geographies</Text>
          <div className="mt-4">
            <Tag
              fillColor="var(--orange-secondary-color)"
              borderColor="var(--orange-secondary-text)"
              textColor="black"
            >
              {
                data.useCase.metadata?.find(
                  (meta: any) => meta.metadataItem?.label === 'Geography'
                )?.value
              }
            </Tag>
          </div>
        </div>
        <div className="mt-6 lg:mt-10">
          <Text variant="headingXl">Summary</Text>
          <div className="prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:leading-relaxed prose-a:text-blue-600 hover:prose-a:text-blue-700 prose-code:bg-gray-200 prose-code:rounded prose-pre:bg-gray-100 prose-pre:border prose-pre:border-gray-300 prose-blockquote:border-l-blue-500 prose-th:bg-gray-100 prose-img:rounded-lg prose prose-lg mt-4 max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-a:underline prose-blockquote:text-gray-700 prose-strong:text-gray-900 prose-em:text-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:text-gray-900 prose-code:before:content-none prose-code:after:content-none prose-pre:text-gray-900 prose-ol:text-gray-800 prose-ul:text-gray-800 prose-li:text-gray-800 prose-li:marker:text-gray-600 prose-table:text-gray-800 prose-thead:border-gray-300 prose-tr:border-gray-300 prose-th:border-gray-300 prose-th:text-gray-900 prose-td:border-gray-300 prose-td:text-gray-800 prose-hr:border-gray-300">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {data.useCase.summary}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrimaryDetails;
