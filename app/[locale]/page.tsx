import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Header from '../components/Header';
import QuoteSteps from '../components/QuoteSteps';

// Homepage component
export default function Home() {
  return (
    <Suspense fallback={<div className="surface-ground min-h-screen flex align-items-center justify-content-center">
      <i className="pi pi-spin pi-spinner text-3xl text-primary"></i>
    </div>}>
      <HomeContent />
    </Suspense>
  );
}

// Homepage content with translations
// Using client directive to avoid hydration issues
function HomeContent() {
  const t = useTranslations();
  
  return (
    <main className="min-h-screen surface-ground">
      {/* Header Component */}
      <Header />
      
      {/* Main Content */}
      <div className="container mx-auto px-3" style={{ maxWidth: '1200px' }}>
        <div className="grid py-5 md:py-8">
          {/* Hero Section */}
          <div className="col-12">
            <div className="grid">
              {/* Left Column - Marketing Content */}
              <div className="col-12 md:col-6 p-3 md:p-5">
                <div className="px-2 py-3 md:px-4 md:py-5">
                  <h1 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4 text-[#006e46]" suppressHydrationWarning>
                    {t('landing.title')}
                  </h1>
                  <p className="text-lg md:text-xl mb-4 md:mb-5 text-gray-700 line-height-3" suppressHydrationWarning>
                    {t('landing.subtitle')}
                  </p>
                  <Link
                    href="/quote"
                    className="bg-[#006e46] text-white px-4 py-2 border-round font-medium text-base md:text-lg hover:bg-[#005a3a] transition-colors flex align-items-center justify-content-center md:inline-flex w-full md:w-auto max-w-15rem no-underline"
                    style={{ height: '3rem' }}
                  >
                    {t('landing.get_quote')}
                  </Link>
                  <div className="mt-4 flex align-items-center">
                    <i className="pi pi-lock mr-2 text-gray-600"></i>
                    <p className="text-sm text-gray-600 m-0" suppressHydrationWarning>
                      {t('landing.information_protected')}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Right Column - Quote Process */}
              <div className="col-12 md:col-6 p-3 md:p-5">
                <div className="surface-card p-3 md:p-4 border-round shadow-2 h-full">
                  <h2 className="text-xl md:text-2xl font-medium mb-3 md:mb-4 text-center text-gray-800">
                    {t('landing.quote_process')}
                  </h2>
                  
                  {/* Quote Steps Preview */}
                  <div className="mb-4 md:mb-5 mt-3 md:mt-5">
                    <QuoteSteps />
                  </div>
                  
                  {/* Call to Action */}
                  <div className="text-center mt-4 md:mt-6">
                    <p className="text-gray-600 mb-3 md:mb-4 line-height-3 px-2 md:px-3" suppressHydrationWarning>
                      {t('landing.ready_to_start')}
                    </p>
                    <Link
                      href="/quote"
                      className="bg-gray-200 text-gray-800 px-4 py-2 border-round font-medium hover:bg-gray-300 transition-colors inline-flex align-items-center justify-content-center no-underline"
                      style={{ height: '3rem', minWidth: '10rem' }}
                    >
                      {t('landing.start_now')}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Additional Features Section */}
          <div className="col-12 mt-3 md:mt-5">
            <div className="grid">
              {/* Feature 1 */}
              <div className="col-12 md:col-4 p-3">
                <div className="surface-card p-3 md:p-4 border-round shadow-1 h-full">
                  <div className="flex flex-column align-items-center">
                    <i className="pi pi-shield text-3xl md:text-4xl text-[#006e46] mb-3"></i>
                    <h3 className="text-lg md:text-xl font-medium mb-2 text-gray-800 text-center">
                      {t('landing.feature1_title')}
                    </h3>
                    <p className="text-gray-600 text-center line-height-3" suppressHydrationWarning>
                      {t('landing.feature1_desc')}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Feature 2 */}
              <div className="col-12 md:col-4 p-3">
                <div className="surface-card p-3 md:p-4 border-round shadow-1 h-full">
                  <div className="flex flex-column align-items-center">
                    <i className="pi pi-money-bill text-3xl md:text-4xl text-[#006e46] mb-3"></i>
                    <h3 className="text-lg md:text-xl font-medium mb-2 text-gray-800 text-center">
                      {t('landing.feature2_title')}
                    </h3>
                    <p className="text-gray-600 text-center line-height-3" suppressHydrationWarning>
                      {t('landing.feature2_desc')}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Feature 3 */}
              <div className="col-12 md:col-4 p-3">
                <div className="surface-card p-3 md:p-4 border-round shadow-1 h-full">
                  <div className="flex flex-column align-items-center">
                    <i className="pi pi-clock text-3xl md:text-4xl text-[#006e46] mb-3"></i>
                    <h3 className="text-lg md:text-xl font-medium mb-2 text-gray-800 text-center">
                      {t('landing.feature3_title')}
                    </h3>
                    <p className="text-gray-600 text-center line-height-3" suppressHydrationWarning>
                      {t('landing.feature3_desc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
