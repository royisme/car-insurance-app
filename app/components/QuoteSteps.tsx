'use client';

import { useTranslations } from 'next-intl';

type QuoteStepsProps = {
  activeStep?: number;
};

// 步骤指示器组件
export default function QuoteSteps({ activeStep = 0 }: QuoteStepsProps) {
  const t = useTranslations();
  
  // 定义所有步骤
  const steps = [
    {
      number: 1, // 显示的步骤编号
      value: 0,  // 对应 DRIVER_INFO = 0
      title: t('landing.step1_title'),
      description: t('landing.step1_desc')
    },
    {
      number: 2, // 显示的步骤编号
      value: 1,  // 对应 VEHICLE_INFO = 1
      title: t('landing.step2_title'),
      description: t('landing.step2_desc')
    },
    {
      number: 3, // 显示的步骤编号
      value: 2,  // 对应 COVERAGE = 2
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
                {steps.map((step, index) => {
                  // 判断步骤状态
                  const isCompleted = step.value < activeStep;
                  const isCurrent = step.value === activeStep;
                  const isPending = step.value > activeStep;
                  
                  // 根据状态设置不同的圆圈颜色
                  let circleClasses = "flex align-items-center justify-content-center w-3rem h-3rem border-circle border-2 mb-2 z-1 ";
                  let textColorClass = "";
                  
                  if (isCompleted) {
                    // 已完成的步骤 - 绿色
                    circleClasses += "bg-green-500 text-white border-green-500";
                    textColorClass = "text-green-500";
                  } else if (isCurrent) {
                    // 当前步骤 - 红色
                    circleClasses += "bg-blue-500 text-white border-blue-500";
                    textColorClass = "text-blue-500";
                  } else if (isPending) {
                    // 未完成的步骤 - 黄色
                    circleClasses += "bg-gray-500 text-white border-gray-500";
                    textColorClass = "text-gray-500";
                  }
                  
                  return (
                    <div key={index} className="flex flex-column align-items-center flex-grow-1 max-w-20rem relative md:w-20rem lg:w-20rem xl:w-20rem">
                      {/* 前面的连接线 */}
                      {index > 0 && (
                        <div 
                          className={`absolute h-2px w-50 top-18px right-50 
                            ${isCompleted || isCurrent ? 'bg-green-500' : 'bg-gray-300'}`} 
                        />
                      )}
                      
                      {/* 后面的连接线 */}
                      {index < steps.length - 1 && (
                        <div 
                          className={`absolute h-2px w-50 top-18px left-50 
                            ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} 
                        />
                      )}
                      
                      {/* 圆圈和数字 */}
                      <div className={circleClasses}>
                        <span className="text-lg font-medium">{step.number}</span>
                      </div>
                      
                      {/* 步骤标题和描述 */}
                      <div className="text-center px-2">
                        <div className={`font-medium mb-1 ${textColorClass}`}>
                          {step.title}
                        </div>
                        {isCurrent && (
                          <div className="text-sm text-gray-600 hidden md:block">
                            {step.description}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}