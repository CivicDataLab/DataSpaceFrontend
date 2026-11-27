import { IconArrowDown } from '@tabler/icons-react';

const FOCUSABLE = 'a[href], button:not([disabled])';

/**
 * "Load more" under a card list: the label, an arrow, and how many are left.
 * After loading, focus moves to the first new card so keyboard and screen
 * reader users land on what was added.
 */
export function LoadMoreButton({
  label,
  remaining,
  controls,
  onClick,
}: {
  label: string;
  remaining: number;
  /** Id of the list this button adds cards to. */
  controls: string;
  onClick: () => void;
}) {
  function loadMore() {
    const list = document.getElementById(controls);
    const shownBefore = list?.children.length ?? 0;
    onClick();
    // Wait for React to render the new cards before moving focus.
    requestAnimationFrame(() => {
      const firstNew = list?.children[shownBefore];
      const target = firstNew?.matches(FOCUSABLE)
        ? firstNew
        : firstNew?.querySelector(FOCUSABLE);
      if (target instanceof HTMLElement) target.focus();
    });
  }

  return (
    <button
      type="button"
      aria-controls={controls}
      onClick={loadMore}
      className="inline-flex cursor-pointer items-center gap-2 border-[0px] bg-transparent p-0 text-100 font-medium text-primaryBlue hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryBlue"
    >
      {label}
      <IconArrowDown size={16} aria-hidden />
      <span className="font-regular text-[#6b6b6b]">({remaining} more)</span>
    </button>
  );
}
