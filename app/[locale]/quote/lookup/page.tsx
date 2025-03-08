'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Message } from 'primereact/message';

export default function QuoteLookupPage() {
  const t = useTranslations();
  const router = useRouter();
  
  const [referenceNumber, setReferenceNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!referenceNumber.trim()) {
      setError(t('quote.lookup.reference_required'));
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // First check if the quote exists
      const response = await fetch(`/api/quotes/reference/${referenceNumber}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError(t('quote.lookup.not_found'));
        } else {
          setError(t('quote.lookup.error'));
        }
        return;
      }
      
      // If quote exists, navigate to the quote view page
      router.push(`/quote/view/${referenceNumber}`);
    } catch (error) {
      console.error('Error looking up quote:', error);
      setError(t('quote.lookup.error'));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-3 max-w-3xl mx-auto">
      <Card className="shadow-sm">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold">{t('quote.lookup.title')}</h2>
          <p className="text-sm text-gray-600">{t('quote.lookup.subtitle')}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-fluid">
          <div className="mb-4">
            <label htmlFor="referenceNumber" className="block text-sm font-medium mb-2">
              {t('quote.lookup.reference_label')}
            </label>
            <InputText
              id="referenceNumber"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder={t('quote.lookup.reference_placeholder')}
              className="w-full"
            />
          </div>
          
          {error && (
            <div className="mb-4">
              <Message severity="error" text={error} className="w-full" />
            </div>
          )}
          
          <div className="flex justify-center">
            <Button
              type="submit"
              label={t('quote.lookup.search')}
              icon="pi pi-search"
              loading={loading}
              className="w-full md:w-auto"
            />
          </div>
        </form>
      </Card>
    </div>
  );
}
