import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { PrimeReactProvider } from 'primereact/api';
import { locales } from '../i18n/client';

// Types and interfaces
interface LocaleLayoutProps {
  children: ReactNode;
  params: {
    locale: string;
  };
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: LocaleLayoutProps) {
  // Ensure locale is valid
  const validLocale = locales.includes(locale) ? locale : 'en';
  
  let messages;
  try {
    messages = (await import(`../../messages/${validLocale}.json`)).default;
  } catch (error) {
    // Default to English if messages can't be loaded
    messages = (await import(`../../messages/en.json`)).default;
  }

  return (
    <NextIntlClientProvider locale={validLocale} messages={messages}>
      <PrimeReactProvider>
        {children}
      </PrimeReactProvider>
    </NextIntlClientProvider>
  );
}

// Generate static paths for all supported locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
