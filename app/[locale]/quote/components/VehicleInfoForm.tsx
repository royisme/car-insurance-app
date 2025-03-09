'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { RadioButton } from 'primereact/radiobutton';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { classNames } from 'primereact/utils';

import { generateVehicleInfo } from '@/app/utils/demoDataGenerator';
import VehicleCard from './CarSummary';

// Props interface
interface VehicleInfoFormProps {
  initialData: any;
  onNext: (data: any) => void;
  onBack: () => void;
}

// Define the form data interface
interface VehicleFormData {
  make: number | string | null;
  model: number | string | null;
  year: number | null;
  type: string;
  primaryUse: string;
  annualMileage: number;
  parking: string;
  antiTheft: boolean;
  winterTires: boolean;
  [key: string]: any; // For dynamic field access
}

export default function VehicleInfoForm({ initialData, onNext, onBack }: VehicleInfoFormProps) {
  const t = useTranslations();
  
  // Form state
  const [formData, setFormData] = useState<VehicleFormData>({
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
  // parking options
  const parkingOptions = [
    { id: 'garage', value: 'garage', label: t('vehicle_info.garage') },
    { id: 'driveway', value: 'driveway', label: t('vehicle_info.driveway') },
    { id: 'street', value: 'street', label: t('vehicle_info.street') },
    { id: 'parking_lot', value: 'parking_lot', label: t('vehicle_info.parking_lot') }
  ];
  
  // vehicle features options
  const featureOptions = [
    { id: 'antiTheft', name: 'antiTheft', label: t('vehicle_info.anti_theft') },
    { id: 'winterTires', name: 'winterTires', label: t('vehicle_info.winter_tires') }
  ]
  // Data for dropdowns
  const [makes, setMakes] = useState<Array<{id: number; name: string}>>([]);
  const [models, setModels] = useState<Array<{id: number; name: string}>>([]);
  const [years, setYears] = useState<number[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [vehicleUses, setVehicleUses] = useState<Array<{id: string}>>([]);
  
  const vehicleUsesData = [
    { id: 'commute' },
    { id: 'pleasure'},
    { id: 'business'}
  ];
  // Validation state
  const [submitted, setSubmitted] = useState(false);
  
  // Fetch vehicle data when component mounts
  useEffect(() => {
    const fetchVehicleData = async () => {
      try {
        // Fetch makes
        const makesResponse = await fetch('/api/vehicles/makes');
        if (!makesResponse.ok) {
          throw new Error(`HTTP error! status: ${makesResponse.status}`);
        }
        const makesData = await makesResponse.json();
        console.log('Makes fetched:', makesData);
        setMakes(makesData);

        // set vehicle uses
        setVehicleUses(vehicleUsesData);
        
        // Make sure primaryUse is set
        if (!formData.primaryUse) {
          setFormData((prev: VehicleFormData) => ({ ...prev, primaryUse: 'commute' }));
        }
        
        // If we have initial data, load dependent fields
        if (initialData.make) {
          console.log('Initial make found:', initialData.make);
          await loadModels(initialData.make);
          
          if (initialData.model) {
            console.log('Initial model found:', initialData.model);
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
      console.log('Demo mode: setting random vehicle data', randomVehicleData);
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
    console.log('Make changed effect triggered, make:', formData.make);
    if (formData.make) {
      loadModels(formData.make);
    } else {
      // Clear dependent fields if make is cleared
      setModels([]);
      setYears([]);
      setTypes([]);
    }
  }, [formData.make]);
  
  // Load years and types when model changes
  useEffect(() => {
    console.log('Model changed effect triggered, model:', formData.model);
    if (formData.make && formData.model) {
      loadYearsAndTypes(formData.make, formData.model);
    } else {
      // Clear dependent fields if model is cleared
      setYears([]);
      setTypes([]);
    }
  }, [formData.model]);
  
  // Load models for selected make
  const loadModels = async (makeId: number | string) => {
    // Ensure makeId is a number
    const numericMakeId = typeof makeId === 'string' ? parseInt(makeId, 10) : makeId;
    try {
      console.log('Loading models for make ID:', numericMakeId);
      const response = await fetch(`/api/vehicles/makes/${numericMakeId}/models`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Models received:', data);
      setModels(data);
      
      // If we have a previously selected model that doesn't belong to this make, clear it
      if (formData.model) {
        const modelExists = data.some((model: any) => model.id === formData.model);
        console.log('Current model ID:', formData.model, 'Exists in new models:', modelExists);
        if (!modelExists) {
          updateFormData('model', null);
          updateFormData('year', null);
          updateFormData('type', '');
        }
      }
    } catch (error) {
      console.error('Error fetching models:', error);
      setModels([]);
    }
  };
  
  // Load years and types for selected model
  const loadYearsAndTypes = async (makeId: number | string, modelId: number | string) => {
    // Ensure makeId and modelId are numbers
    const numericMakeId = typeof makeId === 'string' ? parseInt(makeId, 10) : makeId;
    const numericModelId = typeof modelId === 'string' ? parseInt(modelId, 10) : modelId;
    try {
      console.log('Loading years and types for make ID:', numericMakeId, 'model ID:', numericModelId);
      const response = await fetch(`/api/vehicles/makes/${numericMakeId}/models/${numericModelId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Years and types received:', data);
      
      // Ensure years is an array of numbers
      const yearsArray = Array.isArray(data.years) ? data.years : [];
      console.log('Setting years array:', yearsArray);
      setYears(yearsArray);
      
      // Ensure types is an array of strings
      const typesArray = Array.isArray(data.types) ? data.types : [];
      console.log('Setting types array:', typesArray);
      setTypes(typesArray);
      
      // If previously selected year or type is not in the new arrays, clear them
      if (formData.year) {
        const yearExists = yearsArray.includes(formData.year);
        console.log('Current year:', formData.year, 'Exists in new years:', yearExists);
        if (!yearExists) {
          updateFormData('year', null);
        }
      }
      
      if (formData.type) {
        const typeExists = typesArray.includes(formData.type);
        console.log('Current type:', formData.type, 'Exists in new types:', typeExists);
        if (!typeExists) {
          updateFormData('type', '');
        }
      }
    } catch (error) {
      console.error('Error fetching model details:', error);
      setYears([]);
      setTypes([]);
    }
  };
  
  // Update form data
  const updateFormData = (field: string, value: any) => {
    console.log(`Updating ${field} to:`, value);
    setFormData((prevData: VehicleFormData) => ({
      ...prevData,
      [field]: value
    }));
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
            <div className="px-4 py-3 border-b border-gray-200 bg-primary-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('vehicle_info.vehicle_selection')}
              </h3>
            </div>
          
          {/* Vehicle Selection Tree */}
            <div className="p-4">
              <div className="grid">
                {/* Vehicle Make Selection */}
                <div className="col-12 md:col-6">
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
                      console.log('Make selected:', e.value, typeof e.value);
                      // First reset dependent fields to avoid race conditions
                      setFormData((prevData: VehicleFormData) => ({
                        ...prevData,
                        make: e.value,
                        model: null,
                        year: null,
                        type: ''
                      }));
                    }}
                    placeholder={t('vehicle_info.make')}
                    filter
                    className={classNames(
                      'w-full transition-colors duration-200',
                      { 'p-invalid': submitted && !formData.make }
                    )}
                    emptyMessage={t('common.no_results')}
                  />
                  {submitted && !formData.make && (
                    <small className="text-red-500 text-sm mt-1">{t('validation.required')}</small>
                  )}
                </div>

                {/* Vehicle Model Selection */}
                <div className="col-12 md:col-6">
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
                      console.log('Model selected:', e.value, typeof e.value);
                      // First reset dependent fields to avoid race conditions
                      setFormData((prevData: VehicleFormData) => ({
                        ...prevData,
                        model: e.value,
                        year: null,
                        type: ''
                      }));
                    }}
                    placeholder={formData.make ? t('vehicle_info.model') : t('validation.select_make_first')}
                    filter
                    disabled={!formData.make}
                    className={classNames(
                      'w-full transition-colors duration-200',
                      { 'p-invalid': submitted && !formData.model }
                    )}
                    emptyMessage={models.length === 0 ? t('vehicle_info.no_models_available') : t('common.no_results')}
                  />
                  {submitted && !formData.model && (
                    <small className="text-red-500 text-sm mt-1">{t('validation.required')}</small>
                  )}
                </div>

                {/* Vehicle Year Selection */}
                <div className="col-12 md:col-6">
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('vehicle_info.year')} *
                  </label>
                  <Dropdown
                    id="year"
                    value={formData.year}
                    options={years.map(year => ({ label: year.toString(), value: year }))}
                    onChange={(e) => {
                      console.log('Year selected:', e.value, typeof e.value);
                      setFormData((prevData: VehicleFormData) => ({
                        ...prevData,
                        year: e.value
                      }));
                    }}
                    placeholder={formData.model ? t('vehicle_info.select_year') : t('validation.select_model_first')}
                    disabled={!formData.model}
                    className={classNames(
                      'w-full transition-colors duration-200',
                      { 'p-invalid': submitted && !formData.year }
                    )}
                    emptyMessage={years.length === 0 ? t('vehicle_info.no_years_available') : t('common.no_results')}
                  />
                  {submitted && !formData.year && (
                    <small className="text-red-500 text-sm mt-1">{t('validation.required')}</small>
                  )}
                </div>

                {/* Vehicle Type Selection */}
                <div className="col-12 md:col-6">
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('vehicle_info.type')} *
                  </label>
                  <Dropdown
                    id="type"
                    value={formData.type}
                    options={types.map(type => ({ label: type, value: type  }))}
                    optionLabel="label"
                    optionValue="value"
                    onChange={(e) => {
                      console.log('Type selected:', e.value, typeof e.value);
                      setFormData((prevData: VehicleFormData) => ({
                        ...prevData,
                        type: e.value
                      }));
                    }}
                    placeholder={formData.model ? t('vehicle_info.select_type') : t('validation.select_model_first')}
                    disabled={!formData.model}
                    className={classNames(
                      'w-full transition-colors duration-200',
                      { 'p-invalid': submitted && !formData.type }
                    )}
                    emptyMessage={types.length === 0 ? t('vehicle_info.no_types_available') : t('common.no_results')}
                  />
                  {submitted && !formData.type && (
                    <small className="text-red-500 text-sm mt-1">{t('validation.required')}</small>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Vehicle Summary */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden mt-4">
            <div className="px-4 py-3 border-b border-gray-200 bg-primary-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('vehicle_info.selected_vehicle')}
              </h3>
            </div>
            <div className="p-4">
            {(formData.make && formData.model) && (
            <VehicleCard
              make={formData.make}
              model={formData.model}
              year={formData.year}
              type={formData.type}
              makes={makes}
              models={models}
              vehicleUses={vehicleUses}
              primaryUse={formData.primaryUse}
              annualMileage={formData.annualMileage}
              parking={formData.parking}
              antiTheft={formData.antiTheft}
              winterTires={formData.winterTires}
              t={t}
            />
          )}
            </div>
          </div>

          {/* Usage Section */}
          {/* Usage Section */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden mt-4">
            <div className="px-4 py-3 border-b border-gray-200 bg-primary-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('vehicle_info.primary_use')}
              </h3>
            </div>

            <div className="p-4">
              <div className="grid">
                {/* Primary Use */}
                <div className="col-12 md:col-6">
                  <label htmlFor="primaryUse" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('vehicle_info.primary_use')} *
                  </label>
                  <Dropdown
                    id="primaryUse"
                    value={formData.primaryUse}
                    options={vehicleUsesData.map(use => ({
                      label: t(`vehicle_info.${use.id}`),
                      value: use.id
                    }))}
                    onChange={(e) => updateFormData('primaryUse', e.value)}
                    placeholder={t('validation.select_primary_use_first')}
                    disabled={!formData.model}
                    className={classNames(
                      'w-full transition-colors duration-200',
                      { 'p-invalid': submitted && !formData.primaryUse }
                    )}
                    emptyMessage={vehicleUses.length === 0 ? t('common.no_results') : t('common.no_results')}
                  />
                  {submitted && !formData.primaryUse && (
                    <small className="text-red-500 text-sm mt-1">{t('validation.required')}</small>
                  )}
                </div>

                {/* Annual Mileage */}
                <div className="col-12 md:col-6">
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
            <div className="px-4 py-3 border-b border-gray-200 bg-primary-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('vehicle_info.parking')}
              </h3>
            </div>

            <div className="p-4">
              <div className="flex flex-wrap gap-3">
                {parkingOptions.map((option) => (
                  <div key={option.id} className="flex items-center ">
                    <RadioButton
                      inputId={`parking-${option.id}`}
                        name="parking"
                        value={option.value}
                        onChange={(e) => updateFormData('parking', e.value)}
                        checked={formData.parking === option.value}
                      />
                      <label 
                        htmlFor={`parking-${option.id}`} 
                        className="ml-1"  >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
                {submitted && !formData.parking && (
                  <small className="text-red-500 text-sm mt-2">{t('validation.required')}</small>
                )}
              </div>
            </div>
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden mt-4">
            <div className="px-4 py-3 border-b border-gray-200 bg-primary-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('vehicle_info.vehicle_features')}
              </h3>
            </div>
            <div className="p-4">
                <div className="flex flex-wrap gap-3">
                {featureOptions.map((feature) => (
                    <div key={feature.id} className="flex items-center space-x-3">
                      <Checkbox
                        inputId={feature.id}
                        name={feature.name}
                        checked={formData[feature.name as keyof typeof formData] as boolean}
                        onChange={(e) => updateFormData(feature.name, e.checked)}
                        className="cursor-pointer"
                      />
                      <label 
                        htmlFor={feature.id} 
                        className="ml-2"                      >
                        {feature.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div> 
            </div>
          {/* Form Actions */}
          <div className="flex justify-content-between mt-4 w-full">
            <div>
              <Button
                type="button"
                label={t('common.previous')}
                icon="pi pi-arrow-left"
                onClick={onBack}
              />
            </div>
            
            <div>
              <Button
                type="submit"
                label={t('common.next')}
                icon="pi pi-arrow-right"
                iconPos="right"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
