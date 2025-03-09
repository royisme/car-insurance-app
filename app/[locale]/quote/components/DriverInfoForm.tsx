'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { InputText } from 'primereact/inputtext';
import { InputMask } from 'primereact/inputmask';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { classNames } from 'primereact/utils';
import { generateDriverInfo } from '@/app/utils/demoDataGenerator';

// Props interface
interface DriverInfoFormProps {
  initialData: any;
  onNext: (data: any) => void;
}

export default function DriverInfoForm({ initialData, onNext }: DriverInfoFormProps) {
  const t = useTranslations();
  
  // Form state
  const [formData, setFormData] = useState<any>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: null,
    gender: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    province: '',
    postalCode: '',
    licenseYears: 0,
    accidents3Years: 0,
    violations3Years: 0,
    claims3Years: 0,
    ...initialData
  });
  
  // Validation state
  const [submitted, setSubmitted] = useState(false);
  const [provinces, setProvinces] = useState<any[]>([]);
  
  // Load provinces on component mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch('/api/provinces');
        const data = await response.json();
        setProvinces(data);
      } catch (error) {
        console.error('Error fetching provinces:', error);
      }
    };
    
    // Load provinces from API
    fetchProvinces();
    
    // Demo mode prefill with random data
    const demoMode = localStorage.getItem('demo-mode') === 'true';
    if (demoMode && !initialData.firstName) {
      // Generate random driver data
      const randomDriverData = generateDriverInfo();
      setFormData(randomDriverData);
    }
  }, [initialData]);
  
  // Update form data
  const updateFormData = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    
    // Required fields validation
    const requiredFields = [
      'firstName', 'lastName', 'email', 'dateOfBirth', 
      'gender', 'addressLine1', 'city', 'province', 'postalCode', 'licenseYears'
    ];
    
    const missingRequiredFields = requiredFields.some(field => !formData[field]);
    if (missingRequiredFields) {
      return;
    }
    
    // Move to next step
    onNext(formData);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-1">{t('driver_info.title')}</h2>
      <p className="text-secondary mb-6">{t('driver_info.subtitle')}</p>
      
      <form onSubmit={handleSubmit} className="p-fluid">
        {/* Personal Details Section */}
        <div className="card mb-6">
          <h3 className="text-xl font-semibold mb-4">{t('driver_info.personal_details')}</h3>
          
          <div className="grid mb-4">
            {/* First Name */}
            <div className="field col-12 md:col-6">
              <label htmlFor="firstName" className="block font-medium mb-2">
                {t('driver_info.first_name')} *
              </label>
              <InputText
                id="firstName"
                value={formData.firstName}
                onChange={(e) => updateFormData('firstName', e.target.value)}
                className={classNames({ 'p-invalid': submitted && !formData.firstName })}
              />
              {submitted && !formData.firstName && (
                <small className="p-error block mt-2">{t('validation.required')}</small>
              )}
            </div>
            
            {/* Last Name */}
            <div className="field col-12 md:col-6">
              <label htmlFor="lastName" className="block font-medium mb-2">
                {t('driver_info.last_name')} *
              </label>
              <InputText
                id="lastName"
                value={formData.lastName}
                onChange={(e) => updateFormData('lastName', e.target.value)}
                className={classNames({ 'p-invalid': submitted && !formData.lastName })}
              />
              {submitted && !formData.lastName && (
                <small className="p-error block mt-2">{t('validation.required')}</small>
              )}
            </div>
          </div>
          
          <div className="grid mb-4">
            {/* Email */}
            <div className="field col-12 md:col-6">
              <label htmlFor="email" className="block font-medium mb-2">
                {t('driver_info.email')} *
              </label>
              <InputText
                id="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                className={classNames({ 'p-invalid': submitted && !formData.email })}
              />
              {submitted && !formData.email && (
                <small className="p-error block mt-2">{t('validation.required')}</small>
              )}
            </div>
            
            {/* Phone */}
            <div className="field col-12 md:col-6">
              <label htmlFor="phone" className="block font-medium mb-2">
                {t('driver_info.phone')}
              </label>
              <InputMask
                id="phone"
                value={formData.phone}
                onChange={(e) => updateFormData('phone', e.value)}
                mask="(999) 999-9999"
                placeholder="(___) ___-____"
              />
            </div>
          </div>
          
          <div className="grid mb-4">
            {/* Date of Birth */}
            <div className="field col-12 md:col-6">
              <label htmlFor="dateOfBirth" className="block font-medium mb-2">
                {t('driver_info.dob')} *
              </label>
              <Calendar
                id="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={(e) => updateFormData('dateOfBirth', e.value)}
                dateFormat="mm/dd/yy"
                showIcon
                className={classNames({ 'p-invalid': submitted && !formData.dateOfBirth })}
                maxDate={new Date()}
              />
              {submitted && !formData.dateOfBirth && (
                <small className="p-error block mt-2">{t('validation.required')}</small>
              )}
            </div>
            
            {/* Gender */}
            <div className="field col-12 md:col-6">
              <label htmlFor="gender" className="block font-medium mb-2">
                {t('driver_info.gender')} *
              </label>
              <Dropdown
                id="gender"
                value={formData.gender}
                options={[
                  { label: t('driver_info.male'), value: 'male' },
                  { label: t('driver_info.female'), value: 'female' },
                  { label: t('driver_info.other'), value: 'other' }
                ]}
                onChange={(e) => updateFormData('gender', e.value)}
                placeholder={t('common.required')}
                className={classNames({ 'p-invalid': submitted && !formData.gender })}
              />
              {submitted && !formData.gender && (
                <small className="p-error block mt-2">{t('validation.required')}</small>
              )}
            </div>
          </div>
        </div>
        
        {/* Address Section */}
        <div className="card mb-6">
          <h3 className="text-xl font-semibold mb-4">{t('driver_info.address')}</h3>
          
          {/* Address Line 1 */}
          <div className="field mb-4">
            <label htmlFor="addressLine1" className="block font-medium mb-2">
              {t('driver_info.address_line1')} *
            </label>
            <InputText
              id="addressLine1"
              value={formData.addressLine1}
              onChange={(e) => updateFormData('addressLine1', e.target.value)}
              className={classNames({ 'p-invalid': submitted && !formData.addressLine1 })}
            />
            {submitted && !formData.addressLine1 && (
              <small className="p-error block mt-2">{t('validation.required')}</small>
            )}
          </div>
          
          {/* Address Line 2 */}
          <div className="field mb-4">
            <label htmlFor="addressLine2" className="block font-medium mb-2">
              {t('driver_info.address_line2')} <span className="text-sm text-secondary">{t('common.optional')}</span>
            </label>
            <InputText
              id="addressLine2"
              value={formData.addressLine2}
              onChange={(e) => updateFormData('addressLine2', e.target.value)}
            />
          </div>
          
          <div className="grid mb-4">
            {/* City */}
            <div className="field col-12 md:col-6">
              <label htmlFor="city" className="block font-medium mb-2">
                {t('driver_info.city')} *
              </label>
              <InputText
                id="city"
                value={formData.city}
                onChange={(e) => updateFormData('city', e.target.value)}
                className={classNames({ 'p-invalid': submitted && !formData.city })}
              />
              {submitted && !formData.city && (
                <small className="p-error block mt-2">{t('validation.required')}</small>
              )}
            </div>
            
            {/* Province */}
            <div className="field col-12 md:col-6">
              <label htmlFor="province" className="block font-medium mb-2">
                {t('driver_info.province')} *
              </label>
              <Dropdown
                id="province"
                value={formData.province}
                options={provinces.map((p: any) => ({ 
                  label: p.name_en, 
                  value: p.id 
                }))}
                onChange={(e) => updateFormData('province', e.value)}
                className={classNames({ 'p-invalid': submitted && !formData.province })}
              />
              {submitted && !formData.province && (
                <small className="p-error block mt-2">{t('validation.required')}</small>
              )}
            </div>
            
            {/* Postal Code */}
            <div className="field col-12 md:col-6">
              <label htmlFor="postalCode" className="block font-medium mb-2">
                {t('driver_info.postal_code')} *
              </label>
              <InputMask
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => updateFormData('postalCode', e.value)}
                mask="a9a 9a9"
                placeholder="A1A 1A1"
                className={classNames({ 'p-invalid': submitted && !formData.postalCode })}
              />
              {submitted && !formData.postalCode && (
                <small className="p-error block mt-2">{t('validation.required')}</small>
              )}
            </div>
          </div>
        </div>
        
        {/* Driving History Section */}
        <div className="card mb-6">
          <h3 className="text-xl font-semibold mb-4">{t('driver_info.driving_history')}</h3>
          
          <div className="grid mb-4">
            {/* Years Licensed */}
            <div className="field col-12 md:col-6">
              <label htmlFor="licenseYears" className="block font-medium mb-2">
                {t('driver_info.license_years')} *
              </label>
              <div className="custom-input-number-container">
                <InputNumber
                  id="licenseYears"
                  value={formData.licenseYears}
                  onValueChange={(e) => updateFormData('licenseYears', e.value)}
                  min={0}
                  max={80}
                  showButtons
                  decrementButtonIcon="pi pi-chevron-down"
                  incrementButtonIcon="pi pi-chevron-up"
                  decrementButtonClassName="p-button-indigo"
                  incrementButtonClassName="p-button-indigo"
                  mode="decimal"
                  useGrouping={false}
                  style={{ width: '100%' }}
                  className={classNames('number-input-field', { 'p-invalid': submitted && (formData.licenseYears === null || formData.licenseYears === undefined) })}
                />
              </div>
              {submitted && (formData.licenseYears === null || formData.licenseYears === undefined) && (
                <small className="p-error block mt-2">{t('validation.required')}</small>
              )}
            </div>
            
            {/* At-fault Accidents */}
            <div className="field col-12 md:col-6">
              <label htmlFor="accidents3Years" className="block font-medium mb-2">
                {t('driver_info.accidents_3years')}
              </label>
              <div className="custom-input-number-container">
                <InputNumber
                  id="accidents3Years"
                  value={formData.accidents3Years}
                  onValueChange={(e) => updateFormData('accidents3Years', e.value)}
                  min={0}
                  max={10}
                  showButtons
                  decrementButtonIcon="pi pi-chevron-down"
                  incrementButtonIcon="pi pi-chevron-up"
                  decrementButtonClassName="p-button-indigo"
                  incrementButtonClassName="p-button-indigo"
                  mode="decimal"
                  useGrouping={false}
                  className="number-input-field"
                />
              </div>
            </div>
          </div>
          
          <div className="grid mb-4">
            {/* Traffic Violations */}
            <div className="field col-12 md:col-6">
              <label htmlFor="violations3Years" className="block font-medium mb-2">
                {t('driver_info.violations_3years')}
              </label>
              <div className="custom-input-number-container">
                <InputNumber
                  id="violations3Years"
                  value={formData.violations3Years}
                  onValueChange={(e) => updateFormData('violations3Years', e.value)}
                  min={0}
                  max={10}
                  showButtons
                  decrementButtonIcon="pi pi-chevron-down"
                  incrementButtonIcon="pi pi-chevron-up"
                  decrementButtonClassName="p-button-indigo"
                  incrementButtonClassName="p-button-indigo"
                  mode="decimal"
                  useGrouping={false}
                  className="number-input-field"
                />
              </div>
            </div>
            
            {/* Insurance Claims */}
            <div className="field col-12 md:col-6">
              <label htmlFor="claims3Years" className="block font-medium mb-2">
                {t('driver_info.claims_3years')}
              </label>
              <div className="custom-input-number-container">
                <InputNumber
                  id="claims3Years"
                  value={formData.claims3Years}
                  onValueChange={(e) => updateFormData('claims3Years', e.value)}
                  min={0}
                  max={10}
                  showButtons
                  decrementButtonIcon="pi pi-chevron-down"
                  incrementButtonIcon="pi pi-chevron-up"
                  decrementButtonClassName="p-button-indigo"
                  incrementButtonClassName="p-button-indigo"
                  mode="decimal"
                  useGrouping={false}
                  className="number-input-field"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-between mt-2 w-full">
          <div>
            {/* This div is empty for the first form, but maintains consistent layout */}
          </div>
          <div>
            <Button
              type="submit"
              label={t('common.next')}
              icon="pi pi-arrow-right" 
              iconPos="right"
              className="form-submit-button"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
