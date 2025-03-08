'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Divider } from 'primereact/divider';
import { Dialog } from 'primereact/dialog';
import { generateCoverageInfo } from '../../../utils/demoDataGenerator';

// Utility function for creating delays
const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

// Props interface
interface CoverageFormProps {
  initialData: any;
  driverInfo: any;
  vehicleInfo: any;
  onNext: (data: any) => void;
  onBack: () => void;
}

export default function CoverageForm({ 
  initialData, 
  driverInfo, 
  vehicleInfo, 
  onNext, 
  onBack 
}: CoverageFormProps) {
  const t = useTranslations();
  
  // Form state
  const [formData, setFormData] = useState<any>({
    mandatoryCoverages: {},
    optionalCoverages: {},
    endorsements: {},
    discounts: {},
    ...initialData
  });
  
  // Data for coverage options
  const [mandatoryCoverages, setMandatoryCoverages] = useState<any[]>([]);
  const [optionalCoverages, setOptionalCoverages] = useState<any[]>([]);
  const [endorsements, setEndorsements] = useState<any[]>([]);
  const [discounts, setDiscounts] = useState<any[]>([]);
  
  // Quote calculation state
  const [calculatedQuote, setCalculatedQuote] = useState<any>(null);
  const [calculating, setCalculating] = useState<boolean>(false);
  
  // Quote submission state
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [quoteSubmitted, setQuoteSubmitted] = useState<boolean>(false);
  const [quoteReference, setQuoteReference] = useState<string>('');
  const [showQuoteDialog, setShowQuoteDialog] = useState<boolean>(false);
  
  const router = useRouter();
  
  // Fetch coverage data when component mounts
  useEffect(() => {
    const fetchCoverageData = async () => {
      try {
        // Get province-specific coverage options
        if (driverInfo.province) {
          const coverageResponse = await fetch(`/api/coverages?province=${driverInfo.province}`);
          const coverageData = await coverageResponse.json();
          
          // 检查API响应数据
          console.log('Coverage API response:', coverageData);
          
          setMandatoryCoverages(coverageData.mandatory || []);
          setOptionalCoverages(coverageData.optional || []);
          setEndorsements(coverageData.endorsements || []);
          
          // Initialize mandatory coverages with defaults
          if (Object.keys(formData.mandatoryCoverages).length === 0 && coverageData.mandatory) {
            const mandatoryDefaults: any = {};
            
            coverageData.mandatory.forEach((coverage: any) => {
              // 为特定的强制性保险设置特殊处理
              if (['accident_benefits', 'uninsured_automobile', 'direct_compensation'].includes(coverage.id)) {
                // 为这些特殊情况设置最小默认值50000
                mandatoryDefaults[coverage.id] = {
                  amount: coverage.defaultAmount || 50000,
                  selected: true
                };
                console.log(`Setting default for ${coverage.id}:`, mandatoryDefaults[coverage.id]);
              } 
              else if (coverage.defaultAmount) {
                mandatoryDefaults[coverage.id] = {
                  amount: coverage.defaultAmount,
                  selected: true
                };
              } else if (coverage.defaultDeductible) {
                mandatoryDefaults[coverage.id] = {
                  deductible: coverage.defaultDeductible,
                  selected: true
                };
              } else {
                mandatoryDefaults[coverage.id] = { selected: true };
              }
            });
            
            console.log('Setting mandatory defaults:', mandatoryDefaults);
            
            setFormData({
              ...formData,
              mandatoryCoverages: mandatoryDefaults
            });
          }
        }
        
        // Get available discounts
        const discountResponse = await fetch('/api/discounts');
        const discountData = await discountResponse.json();
        setDiscounts(discountData);
        
        // Demo mode prefill with random data
        const demoMode = localStorage.getItem('demo-mode') === 'true';
        if (demoMode && Object.keys(initialData).length === 0) {
          // Use a short timeout to allow coverage data to load first
          setTimeout(() => {
            if (optionalCoverages.length > 0) {
              // Generate random coverage data based on vehicle info
              const randomCoverageData = generateCoverageInfo(vehicleInfo);
              
              // Apply random coverage data while respecting available options
              const optionalDefaults: any = {};
              
              // Process optional coverages to ensure they exist in the API data
              optionalCoverages.forEach((coverage: any) => {
                if (randomCoverageData.optionalCoverages[coverage.id]) {
                  optionalDefaults[coverage.id] = randomCoverageData.optionalCoverages[coverage.id];
                }
              });
              
              // Process endorsements to ensure they exist in the API data
              const endorsementDefaults: any = {};
              if (endorsements.length > 0) {
                endorsements.forEach((endorsement: any) => {
                  if (randomCoverageData.endorsements[endorsement.id]) {
                    endorsementDefaults[endorsement.id] = { selected: true };
                  }
                });
              }
              
              // Process discounts to ensure they exist in the API data
              const discountDefaults: any = {};
              if (discounts.length > 0) {
                discounts.forEach((discount: any) => {
                  // Always include winter_tires discount if vehicle has them
                  if (discount.id === 'winter_tires' && vehicleInfo.winterTires) {
                    discountDefaults[discount.id] = { selected: true };
                  }
                  // For other discounts, use the random selection
                  else if (randomCoverageData.discounts[discount.id]) {
                    discountDefaults[discount.id] = { selected: true };
                  }
                });
              }
              
              setFormData((prevData: any) => ({
                ...prevData,
                optionalCoverages: optionalDefaults,
                endorsements: endorsementDefaults,
                discounts: discountDefaults
              }));
            }
          }, 500);
        }
      } catch (error) {
        console.error('Error fetching coverage data:', error);
      }
    };
    
    fetchCoverageData();
  }, [driverInfo.province, initialData, formData.mandatoryCoverages.length]);
  
  // Calculate quote when coverage changes
  useEffect(() => {
    // Only calculate if we have all the required data
    if (
      driverInfo && 
      driverInfo.province && 
      vehicleInfo && 
      vehicleInfo.model && 
      vehicleInfo.primaryUse && (
        Object.keys(formData.mandatoryCoverages || {}).length > 0 ||
        Object.keys(formData.optionalCoverages || {}).length > 0 ||
        Object.keys(formData.endorsements || {}).length > 0 ||
        Object.keys(formData.discounts || {}).length > 0
      )
    ) {
      calculateQuote();
    }
  }, [formData, driverInfo, vehicleInfo]);
  
  // Calculate quote
  const calculateQuote = async () => {
    setCalculating(true);
    
    try {
      // Validate required data before sending to API
      if (!driverInfo || !vehicleInfo) {
        console.error('Missing driver or vehicle information');
        setCalculating(false);
        return;
      }

      // Ensure all required fields are present
      if (!driverInfo.province || !vehicleInfo.model || !vehicleInfo.primaryUse) {
        console.error('Missing required fields: province, model, or primary use');
        setCalculating(false);
        return;
      }
      
      // Ensure formData has all required properties and fix any invalid values
      const normalizedFormData = {
        mandatoryCoverages: { ...(formData.mandatoryCoverages || {}) },
        optionalCoverages: { ...(formData.optionalCoverages || {}) },
        endorsements: { ...(formData.endorsements || {}) },
        discounts: { ...(formData.discounts || {}) }
      };
      
      // 检查并修复特定强制性保险的0值
      const mandatoryCoverageIdsToCheck = ['accident_benefits', 'uninsured_automobile', 'direct_compensation'];
      mandatoryCoverageIdsToCheck.forEach(coverageId => {
        if (normalizedFormData.mandatoryCoverages[coverageId] && 
            (normalizedFormData.mandatoryCoverages[coverageId].amount === 0 || 
             !normalizedFormData.mandatoryCoverages[coverageId].amount)) {
          // 如果金额为0或未定义，则设置默认值
          normalizedFormData.mandatoryCoverages[coverageId].amount = 50000;
          console.log(`Fixed ${coverageId} amount to 50000`);
        }
      });
      
      console.log('Normalized form data for quote calculation:', normalizedFormData);
      
      const quoteRequest = {
        driverInfo,
        vehicleInfo,
        coverageInfo: normalizedFormData
      };
      
      const response = await fetch('/api/quotes/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteRequest),
      });
      
      if (response.ok) {
        const quoteData = await response.json();
        setCalculatedQuote(quoteData);
      } else {
        const errorData = await response.json();
        console.error('API error:', errorData);
        throw new Error(errorData.error || 'Failed to calculate quote');
      }
    } catch (error) {
      console.error('Error calculating quote:', error);
    } finally {
      setCalculating(false);
    }
  };
  
  // Update coverage selection
  const updateCoverage = (type: string, id: string, field: string, value: any) => {
    const updatedFormData = { ...formData };
    
    if (!updatedFormData[type][id]) {
      updatedFormData[type][id] = {};
    }
    
    updatedFormData[type][id][field] = value;
    
    // If this is a mandatory coverage, ensure it's always selected
    if (type === 'mandatoryCoverages') {
      updatedFormData[type][id].selected = true;
    }
    
    console.log(`Updating ${type}.${id}.${field} to`, value);
    setFormData(updatedFormData);
    
    // Trigger quote recalculation after a short delay to allow state to update
    if (field === 'amount' || field === 'deductible' || field === 'selected') {
      setTimeout(() => calculateQuote(), 100);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Validate required data before sending to API
      if (!driverInfo || !vehicleInfo || !calculatedQuote) {
        console.error('Missing driver, vehicle, or quote information');
        setSubmitting(false);
        return;
      }

      // Ensure all required fields are present
      if (!driverInfo.province || !vehicleInfo.model || !vehicleInfo.primaryUse) {
        console.error('Missing required fields: province, model, or primary use');
        setSubmitting(false);
        return;
      }

      // Ensure formData has all required properties
      const normalizedFormData = {
        mandatoryCoverages: formData.mandatoryCoverages || {},
        optionalCoverages: formData.optionalCoverages || {},
        endorsements: formData.endorsements || {},
        discounts: formData.discounts || {}
      };

      // Submit quote data to API
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          driverInfo,
          vehicleInfo,
          coverageInfo: normalizedFormData
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit quote');
      }
      
      const data = await response.json();
      setQuoteReference(data.referenceNumber);
      setQuoteSubmitted(true);
      setShowQuoteDialog(true);
      
      // Wait for 4 seconds to allow user to see the quote reference
      await sleep(4000); 
      
      // Pass data to parent component
      onNext({
        ...normalizedFormData,
        calculatedQuote,
        quoteReference: data.referenceNumber
      });
    } catch (error) {
      console.error('Error submitting quote:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-3 max-w-6xl mx-auto">
      <h2 className="text-xl font-bold mb-1">{t('coverage.title')}</h2>
      <p className="text-sm mb-4" style={{ color: 'var(--secondary-color)' }}>{t('coverage.subtitle')}</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* 左侧栏 - 保险选择 */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="p-fluid">
            {/* 强制性保险部分 */}
            <div className="info-card mb-3">
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--primary-color)' }}>{t('coverage.mandatory')}</h3>
              
              {mandatoryCoverages.map((coverage) => (
                <div key={coverage.id} className="mb-2 p-2 coverage-item-mandatory" style={{ backgroundColor: 'var(--secondary-light)' }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>{coverage.name_en}</h4>
                      <p className="text-xs truncate max-w-md" style={{ color: 'var(--secondary-color)' }} title={coverage.description_en}>{coverage.description_en}</p>
                    </div>
                    
                    {coverage.options && coverage.options.length > 0 && (
                      <div className="min-w-[130px]">
                        {coverage.defaultAmount && (
                          <div>
                            <label className="block text-xs mb-1" style={{ color: 'var(--secondary-color)' }}>
                              {coverage.name_en.includes('Accident') ? t('coverage.liability') : t('coverage.deductible')}
                            </label>
                            <Dropdown
                              value={formData.mandatoryCoverages[coverage.id]?.amount || coverage.defaultAmount || 50000}
                              options={coverage.options.map((option: any) => {
                                // 确保重要的强制性保险没有$0选项
                                const optionAmount = option.amount || 
                                  (['accident_benefits', 'uninsured_automobile', 'direct_compensation'].includes(coverage.id) ? 50000 : 0);
                                
                                return {
                                  label: `$${optionAmount.toLocaleString()}`,
                                  value: optionAmount
                                };
                              })}
                              onChange={(e) => {
                                updateCoverage('mandatoryCoverages', coverage.id, 'amount', e.value);
                                // 保险变更时强制重新计算
                                setTimeout(() => calculateQuote(), 100);
                              }}
                              className="w-full text-sm coverage-options-dropdown"
                            />
                          </div>
                        )}
                        
                        {coverage.defaultDeductible && (
                          <div>
                            <label className="block text-xs mb-1" style={{ color: 'var(--secondary-color)' }}>{t('coverage.deductible')}</label>
                            <Dropdown
                              value={formData.mandatoryCoverages[coverage.id]?.deductible || coverage.defaultDeductible}
                              options={coverage.options.map((option: any) => ({
                                label: option.deductible ? `$${option.deductible.toLocaleString()}` : '$0',
                                value: option.deductible || 0
                              }))}
                              onChange={(e) => {
                                updateCoverage('mandatoryCoverages', coverage.id, 'deductible', e.value);
                                // 保险变更时强制重新计算
                                setTimeout(() => calculateQuote(), 100);
                              }}
                              className="w-full text-sm coverage-options-dropdown"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>            
            {/* 可选保险部分 */}
            <div className="info-card mb-3">
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--primary-color)' }}>{t('coverage.optional')}</h3>
              
              {optionalCoverages.map((coverage) => (
                <div key={coverage.id} className="mb-2 p-2 rounded" style={{ backgroundColor: 'var(--secondary-light)' }}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-start">
                      <Checkbox
                        inputId={`optional-${coverage.id}`}
                        checked={formData.optionalCoverages[coverage.id]?.selected || false}
                        onChange={(e) => updateCoverage('optionalCoverages', coverage.id, 'selected', e.checked)}
                        className="mt-0.5 mr-1.5"
                      />
                      <div>
                        <label htmlFor={`optional-${coverage.id}`} className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>
                          {coverage.name_en}
                        </label>
                        <p className="text-xs truncate max-w-md" style={{ color: 'var(--secondary-color)' }} title={coverage.description_en}>{coverage.description_en}</p>
                      </div>
                    </div>
                    
                    {coverage.options && coverage.options.length > 0 && formData.optionalCoverages[coverage.id]?.selected && (
                      <div className="min-w-[130px]">
                        {coverage.defaultDeductible && (
                          <div>
                            <label className="block text-xs mb-1" style={{ color: 'var(--secondary-color)' }}>{t('coverage.deductible')}</label>
                            <Dropdown
                              value={formData.optionalCoverages[coverage.id]?.deductible || coverage.defaultDeductible}
                              options={coverage.options.map((option: any) => ({
                                label: option.deductible ? `$${option.deductible.toLocaleString()}` : '$0',
                                value: option.deductible || 0
                              }))}
                              onChange={(e) => updateCoverage('optionalCoverages', coverage.id, 'deductible', e.value)}
                              className="w-full text-sm coverage-options-dropdown"
                              disabled={!formData.optionalCoverages[coverage.id]?.selected}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>            
            {/* 附加条款部分 */}
            <div className="info-card mb-3">
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--primary-color)' }}>{t('coverage.endorsements')}</h3>
              
              {endorsements.map((endorsement) => (
                <div key={endorsement.id} className="mb-2 p-2 rounded" style={{ backgroundColor: 'var(--secondary-light)' }}>
                  <div className="flex items-start">
                    <Checkbox
                      inputId={`endorsement-${endorsement.id}`}
                      checked={formData.endorsements[endorsement.id]?.selected || false}
                      onChange={(e) => updateCoverage('endorsements', endorsement.id, 'selected', e.checked)}
                      className="mt-0.5 mr-1.5"
                    />
                    <div>
                      <label htmlFor={`endorsement-${endorsement.id}`} className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>
                        {endorsement.name_en}
                      </label>
                      <p className="text-xs truncate max-w-md" style={{ color: 'var(--secondary-color)' }} title={endorsement.description_en}>{endorsement.description_en}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>            
            {/* 折扣部分 */}
            <div className="info-card mb-3">
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--primary-color)' }}>{t('coverage.discounts')}</h3>
              
              {discounts.map((discount) => (
                <div key={discount.id} className="mb-2 p-2 rounded" style={{ backgroundColor: 'var(--secondary-light)' }}>
                  <div className="flex items-start">
                    <Checkbox
                      inputId={`discount-${discount.id}`}
                      checked={formData.discounts[discount.id]?.selected || false}
                      onChange={(e) => updateCoverage('discounts', discount.id, 'selected', e.checked)}
                      className="mt-0.5 mr-1.5"
                    />
                    <div>
                      <label htmlFor={`discount-${discount.id}`} className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>
                        {discount.name_en || discount.description_en}
                      </label>
                      <p className="text-xs truncate max-w-md" style={{ color: 'var(--secondary-color)' }} title={discount.description_en}>{discount.description_en}</p>
                      <p className="text-xs font-medium" style={{ color: 'var(--success-color)' }}>
                        {Math.round(discount.discount_factor * 100)}% {t('coverage.discounts')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>            
            {/* 表单操作按钮 */}
            <div className="flex justify-between mt-3">
              <Button
                type="button"
                label={t('common.previous')}
                icon="pi pi-arrow-left"
                className="p-button-secondary p-button-sm"
                onClick={onBack}
              />
              
              <Button
                type="submit"
                label={t('common.submit')}
                icon="pi pi-check"
                iconPos="right"
                className="p-button-sm"
                disabled={calculating || submitting}
                loading={submitting}
              />
            </div>
          </form>
        </div>
        
        {/* 右侧栏 - 报价摘要 */}
        <div>
          <div className="price-breakdown-card">
            <h3 className="text-lg font-semibold p-3 border-bottom" style={{ color: 'var(--primary-color)', borderColor: 'var(--border-color)' }}>
              {t('quote_result.price_breakdown')}
            </h3>
            
            {calculating ? (
              <div className="flex flex-col items-center py-3">
                <ProgressSpinner style={{ width: '40px', height: '40px' }} />
                <p className="mt-3" style={{ color: 'var(--text-color)' }}>{t('common.loading')}</p>
              </div>
            ) : calculatedQuote ? (
              <div className="p-3">
                <div className="mb-3">
                  <div className="price-item">
                    <span className="price-label">{t('quote_result.base_premium')}</span>
                    <span className="price-value">${(calculatedQuote.basePremium || 0).toFixed(2)}</span>
                  </div>
                  
                  {(calculatedQuote.discountAmount || 0) > 0 && (
                    <div className="price-item">
                      <span className="price-label price-discount">{t('quote_result.discounts')}</span>
                      <span className="price-value price-discount">-${(calculatedQuote.discountAmount || 0).toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="price-item">
                    <span className="price-label">{t('quote_result.fees')}</span>
                    <span className="price-value">${(calculatedQuote.fees || 0).toFixed(2)}</span>
                  </div>
                  
                  <div className="price-item">
                    <span className="price-label">{t('quote_result.taxes')}</span>
                    <span className="price-value">${(calculatedQuote.taxes || 0).toFixed(2)}</span>
                  </div>
                  
                  <Divider style={{ borderColor: 'var(--border-color)' }} />
                  
                  <div className="total-price-container">
                    <div className="total-price-row">
                      <span className="total-price-label">{t('quote_result.total_premium')}</span>
                      <span className="total-price-value">${(calculatedQuote.annualPremium || 0).toFixed(2)}</span>
                    </div>
                    
                    <div className="price-note">
                      {t('quote_result.annual')}
                    </div>
                  </div>
                  
                  <div className="monthly-price-container">
                    <span className="monthly-price-label">{t('quote_result.monthly')}</span>
                    <span className="monthly-price-value">${(calculatedQuote.monthlyPremium || 0).toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="security-note mt-3">
                  <i className="pi pi-lock mr-1"></i>
                  <span>{t('landing.information_protected')}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-3">
                <p className="text-sm" style={{ color: 'var(--secondary-color)' }}>
                  {t('coverage.select_coverage_to_calculate') || 'choose coverage to calculate'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 报价参考号对话框 */}
      <Dialog 
        header={t('quote.success_title')} 
        visible={showQuoteDialog} 
        style={{ width: '90%', maxWidth: '900px' }} 
        onHide={() => setShowQuoteDialog(false)}
        footer={
          <div className="flex justify-between">
            <Button 
              label={t('quote.view_quote')} 
              icon="pi pi-eye" 
              className="p-button-sm" 
              onClick={() => router.push(`/quote/view/${quoteReference}`)}
            />
            <Button 
              label={t('common.close')} 
              icon="pi pi-times" 
              className="p-button-sm p-button-secondary" 
              onClick={() => setShowQuoteDialog(false)}
            />
          </div>
        }
        className="email-dialog"
      >
        <div className="p-4 text-center">
          <i className="pi pi-check-circle text-5xl mb-3" style={{ color: 'var(--success-color)' }}></i>
          <p className="mb-4">{t('quote.success_message')}</p>
          <div className="p-3 rounded-lg mb-3 quote-reference-container">
            <h4 className="text-lg font-bold mb-1">{t('quote.reference_code')}</h4>
            <p className="text-xl font-mono quote-reference-number">{quoteReference}</p>
          </div>
          <p className="text-sm" style={{ color: 'var(--secondary-color)' }}>{t('quote.save_reference')}</p>
        </div>
      </Dialog>
    </div>
  );
}