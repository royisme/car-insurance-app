'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { RadioButton } from 'primereact/radiobutton';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { classNames } from 'primereact/utils';

import { generateVehicleInfo } from '@/app/../../utils/demoDataGenerator';

// Props interface
interface VehicleInfoFormProps {
  initialData: any;
  onNext: (data: any) => void;
  onBack: () => void;
}

export default function VehicleInfoForm({ initialData, onNext, onBack }: VehicleInfoFormProps) {
  const t = useTranslations();
  
  // Form state
  const [formData, setFormData] = useState<any>({
    make: '',
    model: '',
    year: null,
    type: '',
    primaryUse: 'commute',
    annualMileage: 15000,
    parking: '',
    antiTheft: false,
    winterTires: false,
    ...initialData
  });
  
  // Data for dropdowns
  const [makes, setMakes] = useState<Array<{id: number; name: string}>>([]);
  const [models, setModels] = useState<Array<{id: number; name: string}>>([]);
  const [years, setYears] = useState<number[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [vehicleUses, setVehicleUses] = useState<Array<{id: string; name_en: string; name_zh: string}>>([]);
  
  // Validation state
  const [submitted, setSubmitted] = useState(false);
  
  // Fetch vehicle data when component mounts
  useEffect(() => {
    const fetchVehicleData = async () => {
      try {
        // Fetch makes
        const makesResponse = await fetch('/api/vehicles/makes');
        const makesData = await makesResponse.json();
        setMakes(makesData);
        
        // We'll use hardcoded vehicle uses instead of fetching from API
        // since the API seems to be returning problematic data
        setVehicleUses([
          { id: 'commute', name_en: 'Commute to Work', name_zh: '上下班通勤' },
          { id: 'pleasure', name_en: 'Pleasure', name_zh: '休闲' },
          { id: 'business', name_en: 'Business', name_zh: '商务' }
        ]);
        
        // Make sure primaryUse is set
        if (!formData.primaryUse) {
          setFormData((prev: any) => ({ ...prev, primaryUse: 'commute' }));
        }
        
        // If we have initial data, load dependent fields
        if (initialData.make) {
          await loadModels(initialData.make);
          
          if (initialData.model) {
            await loadYearsAndTypes(initialData.make, initialData.model);
          }
        }
      } catch (error) {
        console.error('Error fetching vehicle data:', error);
      }
    };
    
    fetchVehicleData();
    
    // Demo mode prefill with random data
    const demoMode = localStorage.getItem('demo-mode') === 'true';
    if (demoMode && !initialData.make) {
      const randomVehicleData = generateVehicleInfo();
      setFormData(randomVehicleData);
      
      // Load related data for demo mode
      if (randomVehicleData.make) {
        loadModels(randomVehicleData.make).then(() => {
          if (randomVehicleData.model) {
            loadYearsAndTypes(randomVehicleData.make, randomVehicleData.model);
          }
        });
      }
    }
  }, [initialData]);
  
  // Load models when make changes
  useEffect(() => {
    if (formData.make) {
      loadModels(formData.make);
    }
  }, [formData.make]);
  
  // Load years and types when model changes
  useEffect(() => {
    if (formData.make && formData.model) {
      loadYearsAndTypes(formData.make, formData.model);
    }
  }, [formData.model]);
  
  // Load models for selected make
  const loadModels = async (makeId: number) => {
    try {
      const response = await fetch(`/api/vehicles/makes/${makeId}/models`);
      const data = await response.json();
      setModels(data);
    } catch (error) {
      console.error('Error fetching models:', error);
      setModels([]);
    }
  };
  
  // Load years and types for selected model
  const loadYearsAndTypes = async (makeId: number, modelId: number) => {
    try {
      const response = await fetch(`/api/vehicles/makes/${makeId}/models/${modelId}`);
      const data = await response.json();
      setYears(data.years || []);
      setTypes(data.types || []);
    } catch (error) {
      console.error('Error fetching model details:', error);
      setYears([]);
      setTypes([]);
    }
  };
  
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
      'make', 'model', 'year', 'type', 'primaryUse', 'parking'
    ];
    
    const missingRequiredFields = requiredFields.some(field => !formData[field]);
    if (missingRequiredFields) {
      return;
    }
    
    // Move to next step
    onNext(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        
        <form onSubmit={handleSubmit} className="space-y-4 max-w-4xl mx-auto">
          {/* Vehicle Details Section */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('vehicle_info.vehicle_details')}
              </h3>
            </div>
          
          {/* Vehicle Selection Tree */}
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Vehicle Make Selection */}
                <div>
                  <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('vehicle_info.make')} *
                  </label>
                  <Dropdown
                    id="make"
                    value={formData.make}
                    options={makes}
                    optionLabel="name"
                    optionValue="id"
                    onChange={(e) => {
                      updateFormData('make', e.value);
                      updateFormData('model', null);
                      updateFormData('year', null);
                      updateFormData('type', '');
                    }}
                    placeholder={t('vehicle_info.select_make')}
                    filter
                    className={classNames(
                      'w-full transition-colors duration-200',
                      { 'p-invalid': submitted && !formData.make }
                    )}
                  />
                  {submitted && !formData.make && (
                    <small className="text-red-500 text-sm mt-1">{t('validation.required')}</small>
                  )}
                </div>

                {/* Vehicle Model Selection */}
                <div>
                  <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('vehicle_info.model')} *
                  </label>
                  <Dropdown
                    id="model"
                    value={formData.model}
                    options={models}
                    optionLabel="name"
                    optionValue="id"
                    onChange={(e) => {
                      updateFormData('model', e.value);
                      updateFormData('year', null);
                      updateFormData('type', '');
                    }}
                    placeholder={t('vehicle_info.model')}
                    filter
                    disabled={!formData.make}
                    className={classNames(
                      'w-full transition-colors duration-200',
                      { 'p-invalid': submitted && !formData.model }
                    )}
                  />
                  {submitted && !formData.model && (
                    <small className="text-red-500 text-sm mt-1">{t('validation.car_type_invalid')}</small>
                  )}
                </div>

                {/* Vehicle Year Selection */}
                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('vehicle_info.year')} *
                  </label>
                  <Dropdown
                    id="year"
                    value={formData.year}
                    options={years.map(year => ({ label: year.toString(), value: year }))}
                    onChange={(e) => {
                      updateFormData('year', e.value);
                    }}
                    placeholder={t('common.required')}
                    disabled={!formData.model}
                    className={classNames(
                      'w-full transition-colors duration-200',
                      { 'p-invalid': submitted && !formData.year }
                    )}
                  />
                  {submitted && !formData.year && (
                    <small className="text-red-500 text-sm mt-1">{t('validation.required')}</small>
                  )}
                </div>

                {/* Vehicle Type Selection */}
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('vehicle_info.type')} *
                  </label>
                  <Dropdown
                    id="type"
                    value={formData.type}
                    options={types}
                    onChange={(e) => updateFormData('type', e.value)}
                    placeholder={formData.model ? t('common.required') : t('validation.select_model_first')}
                    disabled={!formData.model}
                    className={classNames(
                      'w-full transition-colors duration-200',
                      { 'p-invalid': submitted && !formData.type }
                    )}
                  />
                  {submitted && !formData.type && (
                    <small className="text-red-500 text-sm mt-1">{t('validation.required')}</small>
                  )}
                </div>
              </div>

              {/* Selected Vehicle Summary */}
              {(formData.make || formData.model || formData.year || formData.type) && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <h4 className="text-sm font-medium text-blue-900 mb-3">{t('vehicle_info.selected_vehicle')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.make && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-blue-800">{t('vehicle_info.make')}:</span>
                        <span className="text-sm text-blue-900">{makes.find(m => m.id === formData.make)?.name || ''}</span>
                      </div>
                    )}
                    {formData.model && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-blue-800">{t('vehicle_info.model')}:</span>
                        <span className="text-sm text-blue-900">{models.find(m => m.id === formData.model)?.name || ''}</span>
                      </div>
                    )}
                    {formData.year && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-blue-800">{t('vehicle_info.year')}:</span>
                        <span className="text-sm text-blue-900">{formData.year}</span>
                      </div>
                    )}
                    {formData.type && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-blue-800">{t('vehicle_info.type')}:</span>
                        <span className="text-sm text-blue-900">{formData.type}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Usage Section */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden mt-4">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('vehicle_info.primary_use')}
              </h3>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Primary Use */}
                <div>
                  <label htmlFor="primaryUse" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('vehicle_info.primary_use')} *
                  </label>
                  <Dropdown
                    id="primaryUse"
                    value={formData.primaryUse}
                    options={[
                      { label: 'Commute to Work', value: 'commute' },
                      { label: 'Pleasure', value: 'pleasure' },
                      { label: 'Business', value: 'business' }
                    ]}
                    onChange={(e) => updateFormData('primaryUse', e.value)}
                    placeholder={t('common.required')}
                    className="w-full"
                    filter
                  />
                  {submitted && !formData.primaryUse && (
                    <small className="text-red-500 text-sm mt-1">{t('validation.required')}</small>
                  )}
                </div>

                {/* Annual Mileage */}
                <div>
                  <label htmlFor="annualMileage" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('vehicle_info.annual_mileage')}
                  </label>
                  <InputNumber
                    id="annualMileage"
                    value={formData.annualMileage}
                    onValueChange={(e) => updateFormData('annualMileage', e.value)}
                    min={0}
                    max={100000}
                    step={1000}
                    showButtons
                    buttonLayout="horizontal"
                    decrementButtonIcon="pi pi-minus"
                    incrementButtonIcon="pi pi-plus"
                    decrementButtonClassName="p-button-secondary"
                    incrementButtonClassName="p-button-secondary"
                    mode="decimal"
                    useGrouping={true}
                    suffix=" km"
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Parking and Features Section */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden mt-4">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('vehicle_info.parking')}
              </h3>
            </div>

            <div className="p-4">
              {/* Parking Options */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-4">{t('vehicle_info.parking')} *</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <RadioButton
                      inputId="parking-garage"
                      name="parking"
                      value="garage"
                      onChange={(e) => updateFormData('parking', e.value)}
                      checked={formData.parking === 'garage'}
                    />
                    <label htmlFor="parking-garage" className="text-sm text-gray-700">{t('vehicle_info.garage')}</label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <RadioButton
                      inputId="parking-driveway"
                      name="parking"
                      value="driveway"
                      onChange={(e) => updateFormData('parking', e.value)}
                      checked={formData.parking === 'driveway'}
                      className="cursor-pointer"
                    />
                    <label htmlFor="parking-driveway" className="text-sm text-gray-700 cursor-pointer select-none">{t('vehicle_info.driveway')}</label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <RadioButton
                      inputId="parking-street"
                      name="parking"
                      value="street"
                      onChange={(e) => updateFormData('parking', e.value)}
                      checked={formData.parking === 'street'}
                      className="cursor-pointer"
                    />
                    <label htmlFor="parking-street" className="text-sm text-gray-700 cursor-pointer select-none">{t('vehicle_info.street')}</label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <RadioButton
                      inputId="parking-lot"
                      name="parking"
                      value="parking_lot"
                      onChange={(e) => updateFormData('parking', e.value)}
                      checked={formData.parking === 'parking_lot'}
                      className="cursor-pointer"
                    />
                    <label htmlFor="parking-lot" className="text-sm text-gray-700 cursor-pointer select-none">{t('vehicle_info.parking_lot')}</label>
                  </div>
                </div>
                {submitted && !formData.parking && (
                  <small className="text-red-500 text-sm mt-2">{t('validation.required')}</small>
                )}
              </div>
              
              {/* Vehicle Features */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-4">{t('vehicle_info.vehicle_features')}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      inputId="antiTheft"
                      name="antiTheft"
                      checked={formData.antiTheft}
                      onChange={(e) => updateFormData('antiTheft', e.checked)}
                      className="cursor-pointer"
                    />
                    <label htmlFor="antiTheft" className="text-sm text-gray-700 cursor-pointer select-none">{t('vehicle_info.anti_theft')}</label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      inputId="winterTires"
                      name="winterTires"
                      checked={formData.winterTires}
                      onChange={(e) => updateFormData('winterTires', e.checked)}
                      className="cursor-pointer"
                    />
                    <label htmlFor="winterTires" className="text-sm text-gray-700 cursor-pointer select-none">{t('vehicle_info.winter_tires')}</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <Button
              type="button"
              label={t('common.previous')}
              icon="pi pi-arrow-left"
              className="p-button-secondary"
              onClick={onBack}
            />
            
            <Button
              type="submit"
              label={t('common.next')}
              icon="pi pi-arrow-right"
              iconPos="right"
              className="p-button-primary"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
