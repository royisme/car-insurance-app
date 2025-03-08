'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter, usePathname } from '@/app/i18n/client';
import Image from 'next/image';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';

// Header component
export default function Header() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  
  // Language options
  const languages = [
    { name: 'English', code: 'en' },
    { name: '中文', code: 'zh' }
  ];
  const [currentLocale, setCurrentLocale] = useState('en');
  
  // Theme state
  const [theme, setTheme] = useState<string>('professional');
  const [demoMode, setDemoMode] = useState<boolean>(false);
  
  // Load current locale on mount
  useEffect(() => {
    // Extract the locale from the path
    const pathParts = window.location.pathname.split('/');
    const localeFromPath = pathParts[1];
    if (localeFromPath === 'en' || localeFromPath === 'zh') {
      setCurrentLocale(localeFromPath);
    }
  }, []);
  
  // Handle language change
  const onLanguageChange = (e: { value: { code: string } }) => {
    const newLocale = e.value.code;
    setCurrentLocale(newLocale);
    
    // Navigate to the same page with the new locale
    router.push(pathname, { locale: newLocale });
  };
  
  // Handle theme change
  const onThemeChange = (value: boolean) => {
    const newTheme = value ? 'vibrant' : 'professional';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Save theme preference to localStorage
    localStorage.setItem('theme-preference', newTheme);
  };
  
  // Demo mode toggle
  const toggleDemoMode = (value: boolean) => {
    setDemoMode(value);
    localStorage.setItem('demo-mode', value ? 'true' : 'false');
  };
  
  // Initialize theme and demo mode from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme-preference') || 'professional';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const savedDemoMode = localStorage.getItem('demo-mode') === 'true';
    setDemoMode(savedDemoMode);
  }, []);

  return (
    <div className="surface-section">
      {/* Main Header */}
      <div className={`py-3 w-full ${theme === 'vibrant' ? 'bg-blue-600' : 'bg-indigo-800'}`}>
        <div className="container mx-auto px-3" style={{ maxWidth: '1200px' }}>
          <div className="grid">
            {/* Logo and Title */}
            <div className="col-12 md:col-6 flex align-items-center">
              <Link href="/" className="flex align-items-center">
                <div className="flex align-items-center gap-2">
                  <div className="bg-white w-3rem h-3rem flex align-items-center justify-content-center font-bold border-round-sm" 
                       style={{
                         color: theme === 'vibrant' ? '#1976d2' : '#3f51b5',
                         backgroundColor: 'white',
                         width: '3rem',
                         height: '3rem',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         borderRadius: '0.375rem',
                         fontWeight: 'bold',
                       }}>
                    ROY
                  </div>
                  <div>
                    <div className="font-bold text-xl text-white">ROY Insurance</div>
                    <div className="text-sm text-white">{t('common.appName')}</div>
                  </div>
                </div>
              </Link>
            </div>
            
            {/* Settings */}
            <div className="col-12 md:col-6 mt-3 md:mt-0">
              <div className="flex align-items-center justify-content-center md:justify-content-end gap-4">
                <div className="flex align-items-center">
                  <span className="text-white mr-2 text-sm">{t('common.language')}</span>
                  <Dropdown
                    value={languages.find(lang => lang.code === currentLocale)}
                    options={languages}
                    onChange={onLanguageChange}
                    optionLabel="name"
                    className="p-inputtext-sm"
                    style={{ width: '8rem' }}
                  />
                </div>
                
                <div className="flex align-items-center">
                  <span className="text-white mr-2 text-sm">{t('common.theme')}</span>
                  <InputSwitch
                    checked={theme === 'vibrant'}
                    onChange={(e) => onThemeChange(e.value as boolean)}
                    tooltip={theme === 'vibrant' ? t('common.vibrantTheme') : t('common.professionalTheme')}
                  />
                </div>
                
                {process.env.NODE_ENV === 'development' && (
                  <div className="flex align-items-center">
                    <span className="text-white mr-2 text-sm">{t('landing.demo_mode')}</span>
                    <InputSwitch
                      checked={demoMode}
                      onChange={(e) => toggleDemoMode(e.value as boolean)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Fast Track Banner */}
      <div className={`w-full py-2 border-bottom-1 border-300 ${theme === 'vibrant' ? 'bg-blue-50' : 'bg-indigo-50'}`}>
        <div className="container mx-auto px-3" style={{ maxWidth: '1200px' }}>
          <div className="flex align-items-center justify-content-center">
            <div className="flex align-items-center text-sm text-center">
              <span className="mr-1">⏱️</span>
              <span>Already a ROY customer? Fast track your quote using your </span>
              <a href="#" className={`font-medium ml-1 ${theme === 'vibrant' ? 'text-blue-600' : 'text-indigo-700'}`}>MyInsurance log in credentials</a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Demo Mode Banner */}
      {demoMode && (
        <div className="bg-yellow-500 text-black text-center p-1 text-sm w-full">
          <div className="container mx-auto px-3" style={{ maxWidth: '1200px' }}>
            {t('landing.demo_mode')}
          </div>
        </div>
      )}
    </div>
  );
}
