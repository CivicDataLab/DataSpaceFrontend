import { Children, type ReactNode } from 'react';

type StoryRailProps = {
  children: ReactNode;
};

export function StoryRail({ children }: StoryRailProps) {
  const sections = Children.toArray(children).filter(Boolean);

  return (
    <aside className="h-fit w-full rounded-4 border-1 border-solid border-borderDisabled bg-white px-4 py-4 lg:sticky lg:top-32 lg:max-h-[calc(100vh-9rem)] lg:max-w-[250px] lg:overflow-y-auto">
      {sections.map((section, index) => (
        <div
          key={index}
          className={
            index > 0
              ? 'mt-4 border-solid border-baseGraySlateSolid5 pt-4'
              : undefined
          }
        >
          {section}
        </div>
      ))}
    </aside>
  );
}
