'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Divider } from 'primereact/divider';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import Header from '../../components/Header';

export default function ResultPage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const quoteId = searchParams.get('id');
  
  // State
  const [quoteData, setQuoteData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [emailDialogVisible, setEmailDialogVisible] = useState<boolean>(false);
  const [sendingEmail, setSendingEmail] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>('');
  
  // Toast reference
  const toast: any = {}; // Note: In a real app, we'd use useRef<Toast>(null)
  
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
        toast.show({
          severity: 'success',
          summary: t('common.success'),
          detail: t('common.emailSent')
        });
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.show({
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
        label={t('common.send')}
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
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[50vh]">
          <ProgressSpinner />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <Toast position="top-center" />
      
      <div className="container mx-auto px-4 py-8">
        <Card className="mt-4 shadow-lg">
          <div className="text-center mb-8">
            <i className="pi pi-check-circle text-success text-5xl mb-4"></i>
            <h2 className="text-3xl font-bold mb-1">{t('quote_result.title')}</h2>
            <p className="text-secondary mb-6">{t('quote_result.subtitle')}</p>
            
            <div className="bg-primary-50 p-3 rounded-md inline-block">
              <span className="font-bold mr-2">{t('quote_result.quote_reference')}:</span> 
              <span>{quoteData?.referenceNumber}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Quote details */}
            <div className="lg:col-span-2">
              {/* Driver Info Summary */}
              <Card className="mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-semibold">{t('driver_info.title')}</h3>
                  <Button
                    label={t('quote_result.modify_quote')}
                    icon="pi pi-pencil"
                    className="p-button-text p-button-sm"
                    onClick={handleModifyQuote}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="mb-2">
                      <span className="font-bold block text-sm text-secondary">
                        {t('driver_info.personal_details')}
                      </span>
                      {quoteData?.driverInfo.firstName} {quoteData?.driverInfo.lastName}
                      <br />
                      {quoteData?.driverInfo.email}
                      {quoteData?.driverInfo.phone && <><br />{quoteData?.driverInfo.phone}</>}
                    </p>
                  </div>
                  
                  <div>
                    <p className="mb-2">
                      <span className="font-bold block text-sm text-secondary">
                        {t('driver_info.address')}
                      </span>
                      {quoteData?.driverInfo.addressLine1}
                      {quoteData?.driverInfo.addressLine2 && <><br />{quoteData?.driverInfo.addressLine2}</>}
                      <br />
                      {quoteData?.driverInfo.city}, {quoteData?.driverInfo.province} {quoteData?.driverInfo.postalCode}
                    </p>
                  </div>
                </div>
              </Card>
              
              {/* Vehicle Info Summary */}
              <Card className="mb-4">
                <h3 className="text-xl font-semibold mb-3">{t('vehicle_info.title')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="mb-2">
                      <span className="font-bold block text-sm text-secondary">
                        {t('vehicle_info.vehicle_details')}
                      </span>
                      {quoteData?.vehicleInfo.year} {quoteData?.vehicleInfo.make} {quoteData?.vehicleInfo.model}
                      <br />
                      {quoteData?.vehicleInfo.type}
                    </p>
                  </div>
                  
                  <div>
                    <p className="mb-2">
                      <span className="font-bold block text-sm text-secondary">
                        {t('vehicle_info.primary_use')}
                      </span>
                      {quoteData?.vehicleInfo.primaryUseDescription}
                      <br />
                      {t('vehicle_info.annual_mileage')}: {quoteData?.vehicleInfo.annualMileage.toLocaleString()} km
                    </p>
                  </div>
                </div>
              </Card>
              
              {/* Coverage Summary */}
              <Card>
                <h3 className="text-xl font-semibold mb-3">{t('quote_result.coverage_summary')}</h3>
                
                {/* Mandatory Coverages */}
                <div className="mb-4">
                  <h4 className="font-bold mb-2">{t('coverage.mandatory')}</h4>
                  <div className="pl-4">
                    {quoteData?.coverages.mandatory.map((coverage: any) => (
                      <div key={coverage.id} className="mb-2">
                        <div className="flex justify-between">
                          <span>{coverage.name}</span>
                          <span className="font-bold">
                            {coverage.amount ? `$${coverage.amount.toLocaleString()}` : 
                             coverage.deductible ? `$${coverage.deductible.toLocaleString()} ${t('coverage.deductible')}` : ''}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Optional Coverages */}
                {quoteData?.coverages.optional.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-bold mb-2">{t('coverage.optional')}</h4>
                    <div className="pl-4">
                      {quoteData?.coverages.optional.map((coverage: any) => (
                        <div key={coverage.id} className="mb-2">
                          <div className="flex justify-between">
                            <span>{coverage.name}</span>
                            <span className="font-bold">
                              {coverage.deductible ? `$${coverage.deductible.toLocaleString()} ${t('coverage.deductible')}` : ''}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Endorsements */}
                {quoteData?.coverages.endorsements.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-bold mb-2">{t('coverage.endorsements')}</h4>
                    <div className="pl-4">
                      {quoteData?.coverages.endorsements.map((endorsement: any) => (
                        <div key={endorsement.id} className="mb-2">
                          <div>{endorsement.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Discounts */}
                {quoteData?.coverages.discounts.length > 0 && (
                  <div>
                    <h4 className="font-bold mb-2">{t('coverage.discounts')}</h4>
                    <div className="pl-4">
                      {quoteData?.coverages.discounts.map((discount: any) => (
                        <div key={discount.id} className="mb-2">
                          <div className="flex justify-between">
                            <span>{discount.description}</span>
                            <span className="font-bold text-green-600">
                              {discount.percentage}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>
            
            {/* Right Column - Price summary */}
            <div>
              <Card className="sticky top-4">
                <h3 className="text-xl font-semibold mb-4">{t('quote_result.price_breakdown')}</h3>
                
                <div>
                  <div className="flex justify-between py-2">
                    <span>{t('quote_result.base_premium')}</span>
                    <span className="font-bold">${quoteData?.basePremium.toFixed(2)}</span>
                  </div>
                  
                  {quoteData?.discountAmount > 0 && (
                    <div className="flex justify-between py-2 text-green-600">
                      <span>{t('quote_result.discounts')}</span>
                      <span className="font-bold">-${quoteData?.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between py-2">
                    <span>{t('quote_result.fees')}</span>
                    <span className="font-bold">${quoteData?.fees.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between py-2">
                    <span>{t('quote_result.taxes')}</span>
                    <span className="font-bold">${quoteData?.taxes.toFixed(2)}</span>
                  </div>
                  
                  <Divider />
                  
                  <div className="flex justify-between py-2 text-lg">
                    <span className="font-bold">{t('quote_result.total_premium')}</span>
                    <span className="font-bold">${quoteData?.annualPremium.toFixed(2)}</span>
                  </div>
                  
                  <div className="text-right text-sm text-secondary">
                    {t('quote_result.annual')}
                  </div>
                  
                  <div className="flex justify-between py-2 text-primary mt-3">
                    <span>{t('quote_result.monthly')}</span>
                    <span className="font-bold">${quoteData?.monthlyPremium.toFixed(2)}</span>
                  </div>
                  
                  <Button
                    label={t('quote_result.email_quote')}
                    icon="pi pi-envelope"
                    className="w-full mt-4"
                    onClick={() => setEmailDialogVisible(true)}
                  />
                  
                  {emailSent && (
                    <div className="text-center text-sm text-success mt-2">
                      <i className="pi pi-check mr-1"></i>
                      {t('quote_result.email_sent')} {emailInput}
                    </div>
                  )}
                  
                  <Button
                    label={t('quote_result.start_over')}
                    icon="pi pi-refresh"
                    className="w-full mt-2 p-button-outlined"
                    onClick={handleStartOver}
                  />
                </div>
              </Card>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Email Dialog */}
      <Dialog
        header={t('quote_result.email_quote')}
        visible={emailDialogVisible}
        style={{ width: '450px' }}
        modal
        footer={emailDialogFooter}
        onHide={() => setEmailDialogVisible(false)}
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
            />
            <small className="text-secondary block mt-1">
              {t('landing.information_protected')}
            </small>
          </div>
        </div>
      </Dialog>
    </main>
  );
}
