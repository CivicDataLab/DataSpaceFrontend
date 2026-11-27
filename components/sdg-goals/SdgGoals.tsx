'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Tooltip } from 'opub-ui';

import type { SdgGoal } from './sdg-goal';

/** Up to this many goals show as badges; past it the last slot reads "+N". */
const SDG_SHOWN = 5;
const SDG_SIZE = 58;
/**
 * The gap that makes the badges exactly fill the row, by how many badges
 * there are. Written out in full because Tailwind only builds class names it
 * can read.
 */
const SDG_FIT: Record<number, string> = {
  1: '[--fit:calc((100cqw_-_58px)_/_1)]',
  2: '[--fit:calc((100cqw_-_116px)_/_1)]',
  3: '[--fit:calc((100cqw_-_174px)_/_2)]',
  4: '[--fit:calc((100cqw_-_232px)_/_3)]',
  5: '[--fit:calc((100cqw_-_290px)_/_4)]',
};

/** Earlier badges sit on top of later ones. */
const SDG_LAYER = ['z-[0]', 'z-[1]', 'z-[2]', 'z-[3]', 'z-[4]', 'z-[5]'];

const SLIDE =
  'shrink-0 transition-[margin] duration-200 ease-out motion-reduce:transition-none';
/**
 * At rest badges tuck 18px under each other; on hover or focus they slide
 * apart up to 2px. In a row too narrow for that, they tuck further so the
 * row never spills out of its box.
 */
const STACKED =
  '[margin-left:min(-18px,var(--fit))] group-focus-within:[margin-left:min(2px,var(--fit))] group-hover:[margin-left:min(2px,var(--fit))]';

const goalLabel = (goal: SdgGoal) => `Goal ${goal.number}: ${goal.name}`;

/**
 * Goal badges sit stacked; on hover or keyboard focus they slide apart to
 * fill the row, each with a tooltip naming the goal and linking to search.
 */
export function SdgGoals({
  goals,
  searchHref,
  searchNoun,
}: {
  goals: SdgGoal[];
  /** Search page for one goal, e.g. `/search?sdgs=…&types=usecase`. */
  searchHref: (goal: SdgGoal) => string;
  /** What the search lists, for the link label: "collaboratives", "use cases". */
  searchNoun: string;
}) {
  const overflow = goals.length > SDG_SHOWN;
  const shown = overflow ? goals.slice(0, SDG_SHOWN - 1) : goals;
  const rest = overflow ? goals.slice(SDG_SHOWN - 1) : [];
  const tiles = shown.length + (overflow ? 1 : 0);

  return (
    <div className="w-full [container-type:inline-size]">
      <ul
        className={`group m-0 flex list-none items-center p-0 ${SDG_FIT[tiles]}`}
        aria-label="Goals"
      >
        {shown.map((goal, index) => (
          <li
            key={goal.id}
            className={`${SLIDE} ${SDG_LAYER[tiles - index]} ${index > 0 ? STACKED : ''}`}
          >
            <Tooltip
              side="top"
              width="wide"
              disableHoverableContent
              content={
                <>
                  <span className="block font-semi-bold text-primaryBlue">
                    {goalLabel(goal)}
                  </span>
                  {goal.description ? (
                    <span className="mt-[2px] block font-regular text-[#6b6b6b]">
                      {goal.description}
                    </span>
                  ) : null}
                </>
              }
            >
              <Link
                href={searchHref(goal)}
                aria-label={`${goalLabel(goal)}. Show ${searchNoun} for this goal`}
                className="block rounded-[6px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryBlue"
              >
                {goal.imageSrc ? (
                  <Image
                    src={goal.imageSrc}
                    alt=""
                    width={SDG_SIZE}
                    height={SDG_SIZE}
                    className="size-[58px] rounded-[6px] object-cover ring-2 ring-[#f4f4f5]"
                  />
                ) : (
                  <span className="flex size-[58px] items-center justify-center rounded-[6px] bg-white text-100 font-semi-bold text-primaryBlue ring-2 ring-[#f4f4f5]">
                    {goal.number || 'SDG'}
                  </span>
                )}
              </Link>
            </Tooltip>
          </li>
        ))}
        {overflow ? (
          <li className={`${SLIDE} ${SDG_LAYER[0]} ${STACKED}`}>
            {/* Hoverable, so a long list can be scrolled inside the tooltip. */}
            <Tooltip
              side="top"
              width="wide"
              content={
                <>
                  <span className="block font-semi-bold text-primaryBlue">
                    {rest.length} more goals
                  </span>
                  <ul className="m-0 mt-[2px] list-none p-0 font-regular text-[#6b6b6b]">
                    {rest.map((goal) => (
                      <li key={goal.id}>{goalLabel(goal)}</li>
                    ))}
                  </ul>
                </>
              }
            >
              <span
                tabIndex={0}
                role="img"
                aria-label={`and ${rest.length} more goals: ${rest.map(goalLabel).join(', ')}`}
                className="flex size-[58px] items-center justify-center rounded-[6px] bg-white text-100 font-semi-bold text-primaryBlue ring-2 ring-[#f4f4f5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryBlue"
              >
                +{rest.length}
              </span>
            </Tooltip>
          </li>
        ) : null}
      </ul>
    </div>
  );
}
