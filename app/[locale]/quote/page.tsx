'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Header from '@/app/components/Header';
import QuoteSteps from '@/app/components/QuoteSteps';
import DriverInfoForm from './components/DriverInfoForm';
import VehicleInfoForm from './components/VehicleInfoForm';
import CoverageForm from './components/CoverageForm';

// Quote wizard steps
enum QuoteStep {
  DRIVER_INFO = 0,
  VEHICLE_INFO = 1,
  COVERAGE = 2
}

export default function QuotePage() {
  const t = useTranslations();
  const [activeStep, setActiveStep] = useState<number>(QuoteStep.DRIVER_INFO);
  const [quoteData, setQuoteData] = useState<any>({
    driverInfo: {},
    vehicleInfo: {},
    coverageInfo: {}
  });
  
  // Handle step change
  const handleNext = (data: any) => {
    // Update data for the current step
    const updatedData = { ...quoteData };
    
    if (activeStep === QuoteStep.DRIVER_INFO) {
      updatedData.driverInfo = data;
    } else if (activeStep === QuoteStep.VEHICLE_INFO) {
      updatedData.vehicleInfo = data;
    } else if (activeStep === QuoteStep.COVERAGE) {
      updatedData.coverageInfo = data;
      // Submit the final quote data
      submitQuote(updatedData);
      return;
    }
    
    setQuoteData(updatedData);
    setActiveStep(activeStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };
  
  // Submit the quote to the API
  const submitQuote = async (data: any) => {
    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        const result = await response.json();
        // Redirect to the quote results page
        window.location.href = `/result?id=${result.id}`;
      } else {
        throw new Error('Failed to submit quote');
      }
    } catch (error) {
      console.error('Error submitting quote:', error);
    }
  };
  
  // Render the current step form
  const renderStepContent = () => {
    switch (activeStep) {
      case QuoteStep.DRIVER_INFO:
        return (
          <DriverInfoForm 
            initialData={quoteData.driverInfo}
            onNext={handleNext}
          />
        );
      case QuoteStep.VEHICLE_INFO:
        return (
          <VehicleInfoForm 
            initialData={quoteData.vehicleInfo}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case QuoteStep.COVERAGE:
        return (
          <CoverageForm 
            initialData={quoteData.coverageInfo}
            driverInfo={quoteData.driverInfo}
            vehicleInfo={quoteData.vehicleInfo}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <main className="min-h-screen surface-ground">
      {/* Header */}
      <Header />
      
      {/* Progress Tracker */}
      <QuoteSteps activeStep={activeStep} />
      
      {/* Main Content */}
      <div className="container mx-auto px-3" style={{ maxWidth: '1200px' }}>
        <div className="grid justify-content-center py-3 md:py-5">
          <div className="col-12 lg:col-10 xl:col-8">
            <div className="surface-card border-round shadow-2 p-3 md:p-5">
              <div className="grid grid-nogutter">
                <div className="col-12">
                  {/* Step Header */}
                  <div className="py-3 text-center">
                    <h2 className="text-xl md:text-2xl font-medium text-900 mb-2 md:mb-3">
                      {activeStep === QuoteStep.DRIVER_INFO && t('landing.step1_title')}
                      {activeStep === QuoteStep.VEHICLE_INFO && t('landing.step2_title')}
                      {activeStep === QuoteStep.COVERAGE && t('landing.step3_title')}
                    </h2>
                    
                    <p className="text-700 line-height-3 mb-3 md:mb-4 px-2 md:px-4 text-sm md:text-base">
                      {activeStep === QuoteStep.DRIVER_INFO && t('landing.step1_desc')}
                      {activeStep === QuoteStep.VEHICLE_INFO && t('landing.step2_desc')}
                      {activeStep === QuoteStep.COVERAGE && t('landing.step3_desc')}
                    </p>
                  </div>
                </div>
                
                {/* Form Container */}
                <div className="col-12">
                  <div className="p-fluid quote-form-container">
                    {renderStepContent()}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Form Tips/Help */}
            <div className="mt-3 surface-card border-round shadow-1 p-3">
              <div className="flex align-items-center">
                <i className="pi pi-info-circle text-primary mr-2 text-xl"></i>
                <span className="text-700 text-sm md:text-base">
                  {activeStep === QuoteStep.DRIVER_INFO && 'Providing accurate driver information helps us determine the right coverage for you.'}
                  {activeStep === QuoteStep.VEHICLE_INFO && 'The more details you provide about your vehicle, the more accurate your quote will be.'}
                  {activeStep === QuoteStep.COVERAGE && 'Choose the coverage that best fits your needs and budget.'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </main>
  );
}
