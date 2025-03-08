'use client';

import { useTranslations } from 'next-intl';

type QuoteStepsProps = {
  activeStep?: number;
};

export default function QuoteSteps({ activeStep = 0 }: QuoteStepsProps) {
  const t = useTranslations();
  
  // Define steps
  const steps = [
    {
      number: 1,
      title: t('landing.step1_title'),
      description: t('landing.step1_desc')
    },
    {
      number: 2,
      title: t('landing.step2_title'),
      description: t('landing.step2_desc')
    },
    {
      number: 3,
      title: t('landing.step3_title'),
      description: t('landing.step3_desc')
    }
  ];

  return (
    <div className="surface-section py-3 border-bottom-1 border-300">
      <div className="container mx-auto px-3" style={{ maxWidth: '1200px' }}>
        <div className="grid">
          <div className="col-12">
            <div className="flex justify-content-center">
              <div className="flex flex-wrap justify-content-center">
                {steps.map((step, index) => (
                  <div key={index} className="flex flex-column align-items-center flex-grow-1 max-w-20rem relative md:w-20rem lg:w-20rem xl:w-20rem">
                    {/* Progress line before */}
                    {index > 0 && (
                      <div 
                        className={`absolute h-2px w-50 top-18px right-50 
                          ${index <= activeStep ? 'bg-[#006e46]' : 'bg-gray-300'}`} 
                      />
                    )}
                    
                    {/* Progress line after */}
                    {index < steps.length - 1 && (
                      <div 
                        className={`absolute h-2px w-50 top-18px left-50 
                          ${index < activeStep ? 'bg-[#006e46]' : 'bg-gray-300'}`} 
                      />
                    )}
                    
                    {/* Circle with number */}
                    <div 
                      className={`flex align-items-center justify-content-center w-3rem h-3rem border-circle border-2 mb-2 z-1
                        ${index < activeStep 
                          ? 'bg-[#006e46] text-white border-[#006e46]' 
                          : index === activeStep 
                            ? 'bg-white text-[#006e46] border-[#006e46]' 
                            : 'bg-white text-gray-500 border-gray-300'
                        }`}
                    >
                      {index < activeStep ? (
                        <i className="pi pi-check text-lg"></i>
                      ) : (
                        <span className="text-lg font-medium">{step.number}</span>
                      )}
                    </div>
                    
                    {/* Step title and description */}
                    <div className="text-center px-2">
                      <div className={`font-medium mb-1 ${index === activeStep ? 'text-[#006e46]' : 'text-gray-700'}`}>
                        {step.title}
                      </div>
                      {index === activeStep && (
                        <div className="text-sm text-gray-600 hidden md:block">
                          {step.description}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
