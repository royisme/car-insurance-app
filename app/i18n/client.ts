import { createSharedPathnamesNavigation } from 'next-intl/navigation';

export const locales = ['en', 'zh'];
export const defaultLocale = 'en';

export const { Link, redirect, usePathname, useRouter } = 
  createSharedPathnamesNavigation({ locales });
