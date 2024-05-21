import Link from 'next/link';
import { Tag, Text } from 'opub-ui';

interface Dataset {
  tags: string[];
  description: string;
  title: string;
  id: string;
}

const Cards = ({ data }: { data: Dataset }) => {
  return (
    <div className="border-b-2 border-solid border-baseGraySlateSolid4 p-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <Link href={`/datasets/${data.id}`}>
            <Text variant="headingMd">{data.title}</Text>
          </Link>
        </div>
        <div className="description-container line-clamp-4">
          <Text variant="bodySm">{data.description}</Text>
        </div>
        {data.tags && data.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Text fontWeight="bold">Tags:</Text>
            <div className="flex gap-2">
              {data.tags.map((item, index) => (
                <Tag key={index}>{item}</Tag>
              ))}
            </div>
          </div>
        )}
        {/*   <div className="flex flex-wrap items-center">
            <Text fontWeight="bold">Categories&nbsp;:</Text>
            <Text>&nbsp;{sector}</Text>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Text fontWeight="bold">Formats:</Text>
            <div className="flex gap-2">
              {format.map((item, index) => (
                <Tag key={index}>{item}</Tag>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center">
            <Text fontWeight="bold">Access Models&nbsp;:</Text>
            <Text>&nbsp;{dataset_access_models.length} in total</Text>&nbsp;
            <div className="flex gap-2">
              {dataset_access_models.map((item: any, index) => (
                <CustomTags
                  key={index}
                  type={item.type}
                  iconOnly={true}
                  size={20}
                  background={false}
                />
              ))}
            </div>
          </div> */}
      </div>
    </div>
  );
};

export default Cards;
