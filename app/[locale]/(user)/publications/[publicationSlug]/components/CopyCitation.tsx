'use client';

import { IconCopy } from '@tabler/icons-react';
import { toast } from 'opub-ui';

export function CopyCitation({ citation }: { citation: string }) {
  async function onCopy() {
    try {
      await navigator.clipboard.writeText(citation);
      toast('Citation copied');
    } catch {
      toast('Could not copy. Select the citation and copy it yourself.');
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="m-0 select-all rounded-[14px] bg-[#f5f5f5] p-3 text-100 leading-[21px] text-[#18181b]">
        {citation}
      </p>
      <button
        type="button"
        onClick={onCopy}
        className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 self-start rounded-[10px] border-1 border-solid border-[#8c8c8c] bg-white px-3 font-primary text-100 font-medium leading-[20px] text-[#0a0a0a] transition-colors hover:bg-[#e4e4e6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryBlue"
      >
        <IconCopy size={16} aria-hidden />
        Copy citation
      </button>
    </div>
  );
}
