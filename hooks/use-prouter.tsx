import { useRouter } from 'next/navigation';

import { navigateStart } from '@/lib/navigation';

export const usePRouter = () => {
  const router = useRouter();

  return {
    ...router,
    push: (href: string, options?: Parameters<typeof router.push>[1]) => {
      navigateStart();
      router.push(href, options);
    },
  };
};
