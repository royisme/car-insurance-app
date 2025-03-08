'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Divider } from 'primereact/divider';

export default function QuoteViewPage() {
  const t = useTranslations();
  const params = useParams();
  const reference = params.reference as string;
  
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchQuote = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/quotes/reference/${reference}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch quote');
        }
        
        const data = await response.json();
        setQuote(data);
      } catch (error) {
        console.error('Error fetching quote:', error);
        setError('Failed to fetch quote. Please check your reference number and try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (reference) {
      fetchQuote();
    }
  }, [reference]);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-6 min-h-[50vh]">
        <ProgressSpinner />
        <p className="mt-4">{t('quote.loading')}</p>
      </div>
    );
  }
  
  if (error || !quote) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-red-600">{t('quote.error_title')}</h2>
          <p className="mb-4">{error || t('quote.not_found')}</p>
          <div className="flex justify-center">
            <Button
              label={t('quote.go_back')}
              icon="pi pi-arrow-left"
              className="p-button-sm"
              onClick={() => window.history.back()}
            />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-3 max-w-6xl mx-auto">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">{t('quote.view_title')}</h2>
            <p className="text-sm text-gray-600">{t('quote.reference')}: <span className="font-mono font-medium">{quote.referenceNumber}</span></p>
          </div>
          <div>
            <Button
              label={t('quote.print')}
              icon="pi pi-print"
              className="p-button-sm p-button-outlined mr-2"
              onClick={() => window.print()}
            />
            <Button
              label={t('quote.go_back')}
              icon="pi pi-arrow-left"
              className="p-button-sm"
              onClick={() => window.history.back()}
            />
          </div>
        </div>
        
        <Divider />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Customer Information */}
          <div>
            <h3 className="text-lg font-semibold mb-2">{t('driver_info.title')}</h3>
            <div className="bg-gray-50 p-3 rounded">
              <p><span className="font-medium">{t('driver_info.name')}:</span> {quote.firstName} {quote.lastName}</p>
              <p><span className="font-medium">{t('driver_info.email')}:</span> {quote.email}</p>
              <p><span className="font-medium">{t('driver_info.phone')}:</span> {quote.phone || t('common.not_provided')}</p>
              <p><span className="font-medium">{t('driver_info.dob')}:</span> {formatDate(quote.dateOfBirth)}</p>
              <p><span className="font-medium">{t('driver_info.gender')}:</span> {quote.gender}</p>
              <p><span className="font-medium">{t('driver_info.address')}:</span> {quote.addressLine1}{quote.addressLine2 ? `, ${quote.addressLine2}` : ''}</p>
              <p><span className="font-medium">{t('driver_info.city_province')}:</span> {quote.city}, {quote.province.name_en}</p>
              <p><span className="font-medium">{t('driver_info.postal')}:</span> {quote.postalCode}</p>
            </div>
          </div>
          
          {/* Vehicle Information */}
          <div>
            <h3 className="text-lg font-semibold mb-2">{t('vehicle_info.title')}</h3>
            {quote.vehicles.map((vehicle: any) => (
              <div key={vehicle.id} className="bg-gray-50 p-3 rounded">
                <p><span className="font-medium">{t('vehicle_info.make_model')}:</span> {vehicle.model.make.name} {vehicle.model.name}</p>
                <p><span className="font-medium">{t('vehicle_info.year')}:</span> {vehicle.year}</p>
                <p><span className="font-medium">{t('vehicle_info.type')}:</span> {vehicle.type}</p>
                <p><span className="font-medium">{t('vehicle_info.primary_use')}:</span> {vehicle.primaryUse.description_en}</p>
                <p><span className="font-medium">{t('vehicle_info.annual_mileage')}:</span> {vehicle.annualMileage} km</p>
                <p><span className="font-medium">{t('vehicle_info.parking')}:</span> {vehicle.parking}</p>
                <p><span className="font-medium">{t('vehicle_info.anti_theft')}:</span> {vehicle.antiTheft ? t('common.yes') : t('common.no')}</p>
                <p><span className="font-medium">{t('vehicle_info.winter_tires')}:</span> {vehicle.winterTires ? t('common.yes') : t('common.no')}</p>
              </div>
            ))}
          </div>
        </div>
        
        <Divider />
        
        {/* Coverage Information */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">{t('coverage.title')}</h3>
          
          {/* Mandatory Coverages */}
          <div className="mb-3">
            <h4 className="text-md font-medium mb-2">{t('coverage.mandatory')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {quote.selectedCoverages
                .filter((item: any) => item.coverage.isMandatory)
                .map((item: any) => (
                  <div key={item.id} className="bg-gray-50 p-2 rounded">
                    <p className="font-medium">{item.coverage.name_en}</p>
                    <p className="text-sm">{t('coverage.amount')}: {formatCurrency(parseFloat(item.amount))}</p>
                    {item.deductible && (
                      <p className="text-sm">{t('coverage.deductible')}: {formatCurrency(item.deductible)}</p>
                    )}
                    <p className="text-sm">{t('coverage.premium')}: {formatCurrency(item.premium)}</p>
                  </div>
                ))}
            </div>
          </div>
          
          {/* Optional Coverages */}
          {quote.selectedCoverages.some((item: any) => !item.coverage.isMandatory) && (
            <div className="mb-3">
              <h4 className="text-md font-medium mb-2">{t('coverage.optional')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {quote.selectedCoverages
                  .filter((item: any) => !item.coverage.isMandatory)
                  .map((item: any) => (
                    <div key={item.id} className="bg-gray-50 p-2 rounded">
                      <p className="font-medium">{item.coverage.name_en}</p>
                      {item.amount && (
                        <p className="text-sm">{t('coverage.amount')}: {formatCurrency(parseFloat(item.amount))}</p>
                      )}
                      {item.deductible && (
                        <p className="text-sm">{t('coverage.deductible')}: {formatCurrency(item.deductible)}</p>
                      )}
                      <p className="text-sm">{t('coverage.premium')}: {formatCurrency(item.premium)}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}
          
          {/* Endorsements */}
          {quote.selectedEndorsements.length > 0 && (
            <div className="mb-3">
              <h4 className="text-md font-medium mb-2">{t('coverage.endorsements')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {quote.selectedEndorsements.map((item: any) => (
                  <div key={item.id} className="bg-gray-50 p-2 rounded">
                    <p className="font-medium">{item.endorsement.name_en}</p>
                    <p className="text-sm text-gray-600">{item.endorsement.description_en}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Discounts */}
          {quote.appliedDiscounts.length > 0 && (
            <div>
              <h4 className="text-md font-medium mb-2">{t('coverage.discounts')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {quote.appliedDiscounts.map((item: any) => (
                  <div key={item.id} className="bg-gray-50 p-2 rounded">
                    <p className="font-medium">{item.discount.description_en}</p>
                    <p className="text-sm">{t('quote_result.discount_factor')}: {(item.discount.discount_factor * 100).toFixed(0)}%</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <Divider />
        
        {/* Quote Summary */}
        <div>
          <h3 className="text-lg font-semibold mb-2">{t('quote_result.price_breakdown')}</h3>
          <div className="bg-gray-50 p-3 rounded">
            <div className="flex justify-between mb-2">
              <span>{t('quote_result.base_premium')}:</span>
              <span>{formatCurrency(quote.basePremium)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>{t('quote_result.discounts')}:</span>
              <span>-{formatCurrency(quote.discountAmount)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>{t('quote_result.fees')}:</span>
              <span>{formatCurrency(quote.fees)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>{t('quote_result.taxes')}:</span>
              <span>{formatCurrency(quote.taxes)}</span>
            </div>
            <Divider />
            <div className="flex justify-between font-bold">
              <span>{t('quote_result.annual_premium')}:</span>
              <span>{formatCurrency(quote.annualPremium)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>{t('quote_result.monthly_premium')}:</span>
              <span>{formatCurrency(quote.monthlyPremium)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
