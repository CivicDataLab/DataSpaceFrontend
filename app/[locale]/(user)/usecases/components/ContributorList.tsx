import Image from 'next/image';
import Link from 'next/link';
import { IconUser } from '@tabler/icons-react';

import type { RailContributor } from './usecase-rail';

type ContributorListProps = {
  people: RailContributor[];
};

export function ContributorList({ people }: ContributorListProps) {
  if (people.length === 0) return null;

  return (
    <section aria-label="Contributors">
      <p className="text-75 font-medium uppercase leading-1 tracking-[0.3px] text-[#0a0a0a]">
        Contributors
      </p>
      <ul className="mt-3 flex flex-col gap-3">
        {people.map((person) => (
          <li key={person.id}>
            <Link
              href={person.href}
              className="flex items-center gap-3 rounded-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryBlue"
            >
              {person.imageSrc ? (
                <Image
                  src={person.imageSrc}
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8 shrink-0 rounded-full object-cover text-75 font-regular leading-1 !text-[#0a0a0a]"
                />
              ) : (
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-baseGraySlateSolid4"
                  aria-hidden
                >
                  <IconUser
                    size={16}
                    stroke={1.75}
                    className="text-baseGraySlateSolid11"
                  />
                </span>
              )}
              <span className="min-w-0">
                <p className="m-0 truncate text-100 font-medium leading-[18px] text-[#0a0a0a]">
                  {person.name}
                </p>
                {person.caption ? (
                  <p className="m-0 text-75 font-regular leading-1 text-[#6B6B6B]">
                    {person.caption}
                  </p>
                ) : null}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
