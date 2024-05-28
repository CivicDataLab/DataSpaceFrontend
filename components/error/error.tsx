import { Icon } from 'opub-ui';

import { Icons } from '../icons';

export function ErrorPage() {
  return (
    <div className="text font-Medium flex h-[680px] w-full flex-col items-center justify-center gap-4 text-600">
      <Icon source={Icons.errorPage} size={100} />
      Error fetching information. Please try again later.
    </div>
  );
}
