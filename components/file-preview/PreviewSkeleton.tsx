import styles from './preview-skeleton.module.scss';
import { PDF_PREVIEW_HEIGHT, TABLE_PREVIEW_HEIGHT } from './preview-frame';

function Bar({
  height,
  width = '100%',
  className,
}: {
  height: number | string;
  width?: number | string;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`${styles.bar} ${className ?? ''}`}
      style={{ height, width, display: 'block' }}
    />
  );
}

export function PdfPreviewSkeleton({
  height = PDF_PREVIEW_HEIGHT,
}: {
  height?: string;
}) {
  return <Bar height={height} className={styles.block} />;
}

export function TablePreviewSkeleton() {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <Bar height={14} width={220} />
        <Bar height={12} width={120} />
      </div>
      <div
        className="overflow-hidden rounded-2 border-1 border-solid border-baseGraySlateSolid6"
        style={{ height: TABLE_PREVIEW_HEIGHT }}
      >
        <div className="flex gap-4 border-b-1 border-solid border-baseGraySlateSolid6 bg-baseGraySlateSolid2 px-3 py-2">
          {Array.from({ length: 5 }, (_, index) => (
            <Bar key={index} height={12} width={96} />
          ))}
        </div>
        <div className="flex flex-col gap-3 p-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Bar key={index} height={14} />
          ))}
        </div>
      </div>
      <div className="mt-2.5">
        <Bar height={12} width={320} />
      </div>
    </div>
  );
}
