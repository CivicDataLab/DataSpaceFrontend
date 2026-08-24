import { getRequestConfig } from 'next-intl/server';

import locales from './config/locales';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  console.log('locale', locale);
  if (!locale || !locales.all.includes(locale as any)) {
    locale = locales.default;
  }

  return {
    locale,
    messages: (await import(`./locales/${locale}.json`)).default,
  };
});
