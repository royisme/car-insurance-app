import { getRequestConfig } from 'next-intl/server';
import { locales } from './client';
 
export default getRequestConfig(async ({ requestLocale }) => {
  // 使用 requestLocale 代替 locale 参数
  const locale = await requestLocale;
  // 确保 locale 不为 undefined
  const localeValue = typeof locale === 'string' ? locale : 'en';
  const validLocale = locales.includes(localeValue) ? localeValue : 'en';
  
  return {
    messages: (await import(`@/messages/${validLocale}.json`)).default,
    timeZone: 'America/New_York',
    locale: validLocale
  };
});
