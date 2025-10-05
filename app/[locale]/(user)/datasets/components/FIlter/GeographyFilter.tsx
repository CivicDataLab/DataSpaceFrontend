import React, { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Text,
} from 'opub-ui';

import { toTitleCase } from '@/lib/utils';
import { TreeView } from '@/components/ui/tree-view';

interface Geography {
  id: number;
  name: string;
  code: string;
  type: string;
  parentId: {
    id: number;
    name: string;
    type: string;
  } | null;
}

interface GeographyNode extends Geography {
  children: GeographyNode[];
}

interface GeographyFilterProps {
  selectedGeographies: string[];
  onGeographyChange: (geographies: string[]) => void;
  geographyOptions?: { label: string; value: string }[];
}

const GeographyFilter: React.FC<GeographyFilterProps> = ({
  selectedGeographies,
  onGeographyChange,
  geographyOptions = [],
}) => {
  const [geographies, setGeographies] = useState<GeographyNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  useEffect(() => {
    const fetchGeographies = async () => {
      setLoading(true);
      try {
        // Always try to fetch from GraphQL for full hierarchy
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/graphql`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: `
                query {
                  geographies {
                    id
                    name
                    code
                    type
                    parentId {
                      id
                      name
                      type
                    }
                  }
                }
              `,
            }),
          }
        );

        const { data } = await response.json();
        
        if (data && data.geographies && data.geographies.length > 0) {
          const hierarchicalData = buildHierarchy(data.geographies);
          setGeographies(hierarchicalData);
        } else if (geographyOptions && geographyOptions.length > 0) {
          // Fallback to aggregations if GraphQL fails
          const flatGeographies: GeographyNode[] = geographyOptions.map((opt, idx) => ({
            id: idx,
            name: opt.label,
            code: '',
            type: '',
            parentId: null,
            children: [],
          }));
          setGeographies(flatGeographies);
        }
      } catch (error) {
        console.error('Error fetching geographies:', error);
        // Use aggregations as fallback on error
        if (geographyOptions && geographyOptions.length > 0) {
          const flatGeographies: GeographyNode[] = geographyOptions.map((opt, idx) => ({
            id: idx,
            name: opt.label,
            code: '',
            type: '',
            parentId: null,
            children: [],
          }));
          setGeographies(flatGeographies);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGeographies();
  }, []); // Only run once on mount

  const buildHierarchy = (flatList: Geography[]): GeographyNode[] => {
    const map = new Map<number, GeographyNode>();
    const roots: GeographyNode[] = [];

    // Initialize all nodes
    flatList.forEach((geo) => {
      map.set(geo.id, { ...geo, children: [] });
    });

    // Build hierarchy
    flatList.forEach((geo) => {
      const node = map.get(geo.id)!;
      if (geo.parentId && geo.parentId.id) {
        const parent = map.get(geo.parentId.id);
        if (parent) {
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  // Convert GeographyNode to TreeView format
  const convertToTreeData = (nodes: GeographyNode[]): any[] => {
    return nodes.map((node) => ({
      id: node.name,
      name: node.name,
      children: node.children.length > 0 ? convertToTreeData(node.children) : undefined,
    }));
  };

  const treeData = convertToTreeData(geographies);

  if (loading) {
    return (
      <div className="py-2">
        <Text variant="bodySm" className="text-secondaryText">
          Loading geographies...
        </Text>
      </div>
    );
  }

  if (geographies.length === 0) {
    return null;
  }

  return (
    <Accordion type="single" collapsible defaultValue="geographies" className="w-full">
      <AccordionItem value="geographies" className="border-surfaceDefault">
        <AccordionTrigger className="flex w-full flex-wrap items-center gap-2 rounded-1 bg-[#1F5F8D1A] py-[10px] px-3 hover:no-underline">
          <Text fontWeight="medium">{toTitleCase('geographies')}</Text>
        </AccordionTrigger>
        <AccordionContent
          className="flex w-full flex-col px-2 pb-2 pt-2"
          style={{
            backgroundColor: 'var(--base-pure-white)',
            outline: '1px solid var(--base-pure-white)',
            maxHeight: 'none',
          }}
        >
          <div style={{ maxHeight: '400px' }} className="overflow-y-auto pr-1">
            <TreeView
              data={treeData}
              selectedItems={selectedGeographies}
              onSelectChange={onGeographyChange}
              expandedItems={expandedItems}
              onExpandedChange={setExpandedItems}
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default GeographyFilter;
