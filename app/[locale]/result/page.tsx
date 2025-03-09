'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Divider } from 'primereact/divider';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Panel } from 'primereact/panel';
import Header from '@/app/components/Header';

export default function ResultPage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const quoteId = searchParams.get('id');
  const toastRef = useRef<Toast>(null);
  
  // State
  const [quoteData, setQuoteData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [emailDialogVisible, setEmailDialogVisible] = useState<boolean>(false);
  const [sendingEmail, setSendingEmail] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>('');
  
  // Fetch quote data
  useEffect(() => {
    const fetchQuoteData = async () => {
      if (!quoteId) {
        router.push('/');
        return;
      }
      
      try {
        const response = await fetch(`/api/quotes/${quoteId}`);
        
        if (response.ok) {
          const data = await response.json();
          setQuoteData(data);
          setEmailInput(data.driverInfo.email || '');
        } else {
          throw new Error('Quote not found');
        }
      } catch (error) {
        console.error('Error fetching quote:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuoteData();
  }, [quoteId, router]);
  
  // Handle email sending
  const sendQuoteEmail = async () => {
    if (!emailInput.trim() || !quoteId) return;
    
    setSendingEmail(true);
    
    try {
      const response = await fetch(`/api/quotes/${quoteId}/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailInput }),
      });
      
      if (response.ok) {
        setEmailDialogVisible(false);
        setEmailSent(true);
        toastRef.current?.show({
          severity: 'success',
          summary: t('common.success'),
          detail: t('common.emailSent')
        });
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toastRef.current?.show({
        severity: 'error',
        summary: t('common.error'),
        detail: t('common.emailFailed')
      });
    } finally {
      setSendingEmail(false);
    }
  };
  
  // Handle start over
  const handleStartOver = () => {
    router.push('/');
  };
  
  // Handle modify quote
  const handleModifyQuote = () => {
    router.push('/quote');
  };
  
  // Email dialog footer
  const emailDialogFooter = (
    <div>
      <Button
        label={t('common.cancel')}
        icon="pi pi-times"
        className="p-button-text"
        onClick={() => setEmailDialogVisible(false)}
        disabled={sendingEmail}
      />
      <Button
        label={t('common.sendEmail')}
        icon="pi pi-envelope"
        onClick={sendQuoteEmail}
        loading={sendingEmail}
        disabled={!emailInput.trim()}
      />
    </div>
  );

  if (loading) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <ProgressSpinner style={{ width: '50px', height: '50px' }} />
            <p className="mt-4" style={{ color: 'var(--text-color)' }}>{t('common.loading')}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen quote-result-page">
      <Header />
      <Toast ref={toastRef} position="top-center" />
      
      <div className="container">
        {/* 页面标题和引用参考号 */}
        <div className="quote-result-header">
          <div className="icon-container">
            <i className="pi pi-check-circle check-icon"></i>
          </div>
          <h1 className="title">{t('quote_result.title')}</h1>
          <p className="subtitle">{t('quote_result.subtitle')}</p>
          
          <div className="quote-reference-container">
            <span className="quote-reference-label">{t('quote_result.quote_reference')}:</span> 
            <span className="quote-reference-number">{quoteData?.referenceNumber}</span>
          </div>
        </div>
        
        <div className="grid">
          {/* 左列 - 报价详情 */}
          <div className="col-12 lg:col-8 space-y-6">
            {/* 驾驶员信息 */}
            <Panel 
              header={
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center">
                    <i className="pi pi-user info-card-icon"></i>
                    <span className="info-card-title">{t('driver_info.title')}</span>
                  </div>
                  <Button
                    label={t('quote_result.modify_quote')}
                    icon="pi pi-pencil"
                    className="p-button-text p-button-sm"
                    onClick={handleModifyQuote}
                  />
                </div>
              }
              toggleable
            >
              <div className="grid">
                <div className="col-12 md:col-6 info-section">
                  <h4 className="info-section-title">
                    {t('driver_info.personal_details')}
                  </h4>
                  <div className="info-content">
                    <div className="font-medium">{quoteData?.driverInfo.firstName} {quoteData?.driverInfo.lastName}</div>
                    <div>{quoteData?.driverInfo.email}</div>
                    {quoteData?.driverInfo.phone && <div>{quoteData?.driverInfo.phone}</div>}
                  </div>
                </div>
                
                <div className="col-12 md:col-6 info-section">
                  <h4 className="info-section-title">
                    {t('driver_info.address')}
                  </h4>
                  <div className="info-content">
                    <div>{quoteData?.driverInfo.addressLine1}</div>
                    {quoteData?.driverInfo.addressLine2 && <div>{quoteData?.driverInfo.addressLine2}</div>}
                    <div>{quoteData?.driverInfo.city}, {quoteData?.driverInfo.province} {quoteData?.driverInfo.postalCode}</div>
                  </div>
                </div>
              </div>
            </Panel>
            
            {/* 车辆信息 */}
            <Panel 
              header={
                <div className="flex items-center">
                  <i className="pi pi-car info-card-icon"></i>
                  <span className="info-card-title">{t('vehicle_info.title')}</span>
                </div>
              }
              toggleable
            >
              <div className="grid">
                <div className="col-12 md:col-6 info-section">
                  <h4 className="info-section-title">
                    {t('vehicle_info.vehicle_details')}
                  </h4>
                  <div className="info-content">
                    <div className="font-medium">{quoteData?.vehicleInfo.year} {quoteData?.vehicleInfo.make} {quoteData?.vehicleInfo.model}</div>
                    <div>{quoteData?.vehicleInfo.type}</div>
                  </div>
                </div>
                
                <div className="col-12 md:col-6 info-section">
                  <h4 className="info-section-title">
                    {t('vehicle_info.primary_use')}
                  </h4>
                  <div className="info-content">
                    <div>{quoteData?.vehicleInfo.primaryUseDescription}</div>
                    <div>{t('vehicle_info.annual_mileage')}: <span className="font-medium">{quoteData?.vehicleInfo.annualMileage.toLocaleString()} km</span></div>
                  </div>
                </div>
              </div>
            </Panel>
            
            {/* 保险范围摘要 */}
            <Panel 
              header={
                <div className="flex items-center">
                  <i className="pi pi-shield info-card-icon"></i>
                  <span className="info-card-title">{t('quote_result.coverage_summary')}</span>
                </div>
              }
              toggleable
            >
              {/* 强制性保险 */}
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <div className="w-3 h-3 rounded-full bg-primary-color mr-2" style={{ backgroundColor: 'var(--primary-color)' }}></div>
                  <h4 className="font-bold" style={{ color: 'var(--primary-color)' }}>{t('coverage.mandatory')}</h4>
                </div>
                
                <div className="col-12 md:col-6 info-section">
                  {quoteData?.coverages.mandatory.map((coverage: any, index: number) => (
                    <div key={coverage.id} className={`${index > 0 ? 'mt-3 pt-3 border-t' : ''}`} style={{ borderColor: 'var(--border-color)' }}>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium" style={{ color: 'var(--text-color)' }}>{coverage.name}</div>
                          {coverage.description && (
                            <p className="text-xs mt-1" style={{ color: 'var(--secondary-color)' }}>{coverage.description}</p>
                          )}
                        </div>
                        <div>
                          <span className="coverage-badge mandatory-badge">
                            {coverage.amount ? `$${coverage.amount.toLocaleString()}` : 
                             coverage.deductible ? `$${coverage.deductible.toLocaleString()} ${t('coverage.deductible')}` : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 可选保险 */}
              {quoteData?.coverages.optional.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center mb-3">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: 'var(--info-color)' }}></div>
                    <h4 className="font-bold" style={{ color: 'var(--info-color)' }}>{t('coverage.optional')}</h4>
                  </div>
                  
                  <div className="col-12 md:col-6 info-section">
                    {quoteData?.coverages.optional.map((coverage: any, index: number) => (
                      <div key={coverage.id} className={`${index > 0 ? 'mt-3 pt-3 border-t' : ''}`} style={{ borderColor: 'var(--border-color)' }}>
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium" style={{ color: 'var(--text-color)' }}>{coverage.name}</div>
                            {coverage.description && (
                              <p className="text-xs mt-1" style={{ color: 'var(--secondary-color)' }}>{coverage.description}</p>
                            )}
                          </div>
                          <div>
                            {coverage.deductible ? (
                              <span className="coverage-badge optional-badge">
                                ${coverage.deductible.toLocaleString()} {t('coverage.deductible')}
                              </span>
                            ) : (
                              <span className="coverage-badge optional-badge">
                                {t('coverage.included')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 附加条款 */}
              {quoteData?.coverages.endorsements.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center mb-3">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: 'var(--secondary-color)' }}></div>
                    <h4 className="font-bold" style={{ color: 'var(--secondary-color)' }}>{t('coverage.endorsements')}</h4>
                  </div>
                  
                  <div className="col-12 md:col-6 info-section">
                    {quoteData?.coverages.endorsements.map((endorsement: any, index: number) => (
                      <div key={endorsement.id} className={`${index > 0 ? 'mt-3 pt-3 border-t' : ''}`} style={{ borderColor: 'var(--border-color)' }}>
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium" style={{ color: 'var(--text-color)' }}>{endorsement.name}</div>
                            {endorsement.description && (
                              <p className="text-xs mt-1" style={{ color: 'var(--secondary-color)' }}>{endorsement.description}</p>
                            )}
                          </div>
                          <div>
                            <span className="coverage-badge endorsement-badge">
                              {t('coverage.included')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 折扣 */}
              {quoteData?.coverages.discounts.length > 0 && (
                <div>
                  <div className="flex items-center mb-3">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: 'var(--success-color)' }}></div>
                    <h4 className="font-bold" style={{ color: 'var(--success-color)' }}>{t('coverage.discounts')}</h4>
                  </div>
                  
                  <div className="col-12 md:col-6 info-section">
                    {quoteData?.coverages.discounts.map((discount: any, index: number) => (
                      <div key={discount.id} className={`${index > 0 ? 'mt-3 pt-3 border-t' : ''}`} style={{ borderColor: 'var(--border-color)' }}>
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium" style={{ color: 'var(--text-color)' }}>{discount.description}</div>
                          </div>
                          <div>
                            <span className="coverage-badge discount-badge">
                              {discount.percentage}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Panel>
          </div>
          
          {/* 右列 - 价格摘要 */}
          <div className="col-12 lg:col-4">
            <div className="price-breakdown-card">
              <div className="price-breakdown-header">
                <h2 className="price-breakdown-title">{t('quote_result.price_breakdown')}</h2>
                <p className="price-breakdown-subtitle">{t('quote_result.price_breakdown_subtitle') || '您的保险费用详情'}</p>
              </div>
              
              <div className="price-breakdown-content">
                <div className="space-y-3 mb-4">
                  <div className="price-item">
                    <span className="price-label">{t('quote_result.base_premium')}</span>
                    <span className="price-value">${quoteData?.basePremium.toFixed(2)}</span>
                  </div>
                  
                  {quoteData?.discountAmount > 0 && (
                    <div className="price-item">
                      <span className="price-label price-discount">{t('quote_result.discounts')}</span>
                      <span className="price-value price-discount">-${quoteData?.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="price-item">
                    <span className="price-label">{t('quote_result.fees')}</span>
                    <span className="price-value">${quoteData?.fees.toFixed(2)}</span>
                  </div>
                  
                  <div className="price-item">
                    <span className="price-label">{t('quote_result.taxes')}</span>
                    <span className="price-value">${quoteData?.taxes.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="total-price-container">
                  <div className="total-price-row">
                    <span className="total-price-label">{t('quote_result.total_premium')}</span>
                    <span className="total-price-value">${quoteData?.annualPremium.toFixed(2)}</span>
                  </div>
                  
                  <div className="price-note">
                    {t('quote_result.annual')}
                  </div>
                  
                  <div className="monthly-price-container">
                    <span className="monthly-price-label">{t('quote_result.monthly')}</span>
                    <span className="monthly-price-value">${quoteData?.monthlyPremium.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="actions-container">
                  <Button
                    label={t('quote_result.email_quote')}
                    icon="pi pi-envelope"
                    className="p-button w-full mb-2"
                    onClick={() => setEmailDialogVisible(true)}
                  />
                  
                  {emailSent && (
                    <div className="text-center text-sm my-2" style={{ color: 'var(--success-color)' }}>
                      <i className="pi pi-check mr-1"></i>
                      {t('quote_result.email_sent')} {emailInput}
                    </div>
                  )}
                  
                  <Button
                    label={t('quote_result.start_over')}
                    icon="pi pi-refresh"
                    className="p-button-outlined w-full"
                    onClick={handleStartOver}
                  />
                  
                  <div className="security-note">
                    <i className="pi pi-lock"></i> {t('landing.information_protected')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 邮件对话框 */}
      <Dialog
        header={t('quote_result.email_quote')}
        visible={emailDialogVisible}
        style={{ width: '450px' }}
        modal
        footer={emailDialogFooter}
        onHide={() => setEmailDialogVisible(false)}
        className="email-dialog"
      >
        <div className="p-fluid">
          <div className="field">
            <label htmlFor="email" className="font-medium mb-2 block">
              {t('driver_info.email')}
            </label>
            <InputText
              id="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              type="email"
              className="p-inputtext-lg"
            />
            <small className="block mt-2" style={{ color: 'var(--secondary-color)' }}>
              <i className="pi pi-lock mr-1"></i> {t('landing.information_protected')}
            </small>
          </div>
        </div>
      </Dialog>
    </main>
  );
}