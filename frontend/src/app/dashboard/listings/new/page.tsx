'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreatePropertyMutation } from '@/store/api/propertyApi';
import { useUploadPropertyImagesMutation } from '@/store/api/agentApi';
import { useGetStatesQuery, useGetCitiesQuery, useGetAreasQuery, useGetPropertyTypesQuery } from '@/store/api/locationApi';
import ImageUploader from '@/components/dashboard/ImageUploader';
import type { ImageFile } from '@/components/dashboard/ImageUploader';
import type { CreatePropertyPayload, ListingType, Furnishing, RentPeriod } from '@/types';
import { formatPrice } from '@/lib/utils';

const STEPS = ['Basic Info', 'Pricing', 'Location', 'Details', 'Photos', 'Review'];

const FURNISHING_OPTIONS: { value: Furnishing; label: string }[] = [
  { value: 'unfurnished', label: 'Unfurnished' },
  { value: 'semi_furnished', label: 'Semi-Furnished' },
  { value: 'furnished', label: 'Furnished' },
];

export default function NewListingPage() {
  const router = useRouter();
  const [createProperty, { isLoading: creating }] = useCreatePropertyMutation();
  const [uploadImages, { isLoading: uploading }] = useUploadPropertyImagesMutation();
  const { data: statesData } = useGetStatesQuery();
  const { data: propertyTypesData } = useGetPropertyTypesQuery();

  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [images, setImages] = useState<ImageFile[]>([]);

  const [form, setForm] = useState({
    listing_type: 'rent' as ListingType,
    property_type_id: '',
    title: '',
    description: '',
    price_naira: '',
    price_negotiable: false,
    rent_period: 'yearly' as RentPeriod,
    agency_fee_pct: '',
    caution_fee_naira: '',
    service_charge_naira: '',
    legal_fee_naira: '',
    state_id: '',
    city_id: '',
    area_id: '',
    address: '',
    landmark_note: '',
    bedrooms: '',
    bathrooms: '',
    toilets: '',
    sitting_rooms: '',
    floor_area_sqm: '',
    land_area_sqm: '',
    year_built: '',
    furnishing: 'unfurnished' as Furnishing,
    parking_spaces: '',
    has_bq: false,
    has_swimming_pool: false,
    has_gym: false,
    has_cctv: false,
    has_generator: false,
    has_water_supply: false,
    has_prepaid_meter: false,
    is_serviced: false,
    is_new_build: false,
    inspection_available: true,
  });

  const { data: citiesData } = useGetCitiesQuery(form.state_id, { skip: !form.state_id });
  const { data: areasData } = useGetAreasQuery(form.city_id, { skip: !form.city_id });

  const states = statesData?.data || [];
  const cities = citiesData?.data || [];
  const areas = areasData?.data || [];
  const propertyTypes = propertyTypesData?.data || [];

  const update = (field: string, value: string | boolean | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = (): boolean => {
    setError('');
    switch (step) {
      case 0:
        if (!form.title || !form.description || !form.property_type_id) {
          setError('Please fill in all required fields.');
          return false;
        }
        break;
      case 1:
        if (!form.price_naira || Number(form.price_naira) <= 0) {
          setError('Please enter a valid price.');
          return false;
        }
        break;
      case 2:
        if (!form.state_id || !form.city_id || !form.address) {
          setError('Please provide state, city, and address.');
          return false;
        }
        break;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) setStep(step + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(Math.max(0, step - 1));
  };

  const handleSaveDraft = async () => {
    setError('');
    try {
      const payload = buildPayload();
      const result = await createProperty({ ...payload, status: 'draft' as never }).unwrap();
      if (images.length > 0 && result.data?.id) {
        await uploadImagesForProperty(result.data.id);
      }
      router.push('/dashboard/listings');
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      setError(apiErr?.data?.message || 'Failed to save draft.');
    }
  };

  const handleSubmit = async () => {
    setError('');
    try {
      const payload = buildPayload();
      const result = await createProperty(payload).unwrap();
      if (images.length > 0 && result.data?.id) {
        await uploadImagesForProperty(result.data.id);
      }
      router.push('/dashboard/listings');
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string; errors?: Record<string, string[]> } };
      if (apiErr?.data?.errors) {
        const firstErr = Object.values(apiErr.data.errors)[0]?.[0];
        setError(firstErr || apiErr?.data?.message || 'Failed to create listing.');
      } else {
        setError(apiErr?.data?.message || 'Failed to create listing.');
      }
    }
  };

  const uploadImagesForProperty = async (propertyId: string) => {
    const formData = new FormData();
    images.forEach((img) => formData.append('images[]', img.file));
    await uploadImages({ propertyId, formData }).unwrap();
  };

  const buildPayload = (): CreatePropertyPayload => {
    const payload: CreatePropertyPayload = {
      listing_type: form.listing_type,
      property_type_id: form.property_type_id,
      title: form.title,
      description: form.description,
      price_kobo: Math.round(Number(form.price_naira) * 100),
      price_negotiable: form.price_negotiable,
      state_id: form.state_id,
      city_id: form.city_id,
      address: form.address,
      furnishing: form.furnishing,
      inspection_available: form.inspection_available,
      has_bq: form.has_bq,
      has_swimming_pool: form.has_swimming_pool,
      has_gym: form.has_gym,
      has_cctv: form.has_cctv,
      has_generator: form.has_generator,
      has_water_supply: form.has_water_supply,
      has_prepaid_meter: form.has_prepaid_meter,
      is_serviced: form.is_serviced,
      is_new_build: form.is_new_build,
    };
    if (form.listing_type === 'rent') payload.rent_period = form.rent_period;
    if (form.area_id) payload.area_id = form.area_id;
    if (form.landmark_note) payload.landmark_note = form.landmark_note;
    if (form.bedrooms) payload.bedrooms = Number(form.bedrooms);
    if (form.bathrooms) payload.bathrooms = Number(form.bathrooms);
    if (form.toilets) payload.toilets = Number(form.toilets);
    if (form.sitting_rooms) payload.sitting_rooms = Number(form.sitting_rooms);
    if (form.floor_area_sqm) payload.floor_area_sqm = Number(form.floor_area_sqm);
    if (form.land_area_sqm) payload.land_area_sqm = Number(form.land_area_sqm);
    if (form.year_built) payload.year_built = Number(form.year_built);
    if (form.parking_spaces) payload.parking_spaces = Number(form.parking_spaces);
    if (form.agency_fee_pct) payload.agency_fee_pct = Number(form.agency_fee_pct);
    if (form.caution_fee_naira) payload.caution_fee_kobo = Math.round(Number(form.caution_fee_naira) * 100);
    if (form.service_charge_naira) payload.service_charge_kobo = Math.round(Number(form.service_charge_naira) * 100);
    if (form.legal_fee_naira) payload.legal_fee_kobo = Math.round(Number(form.legal_fee_naira) * 100);
    return payload;
  };

  const inputClass = 'w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:border-accent-dark text-text-primary text-sm';
  const labelClass = 'block text-sm font-medium text-text-secondary mb-1.5';

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-bold text-text-primary mb-1">Create New Listing</h1>
      <p className="text-sm text-text-muted mb-6">Fill in the details step by step to publish your property.</p>

      {/* Progress */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <button
            key={s}
            onClick={() => i < step && setStep(i)}
            className={`flex items-center gap-2 shrink-0 ${i < step ? 'cursor-pointer' : 'cursor-default'}`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              i < step ? 'bg-green-500 text-white' :
              i === step ? 'bg-primary text-white' :
              'bg-border text-text-muted'
            }`}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:inline ${i === step ? 'text-text-primary' : 'text-text-muted'}`}>
              {s}
            </span>
            {i < STEPS.length - 1 && <div className="w-6 h-px bg-border mx-1" />}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-error/10 text-error p-3 rounded-xl mb-6 text-sm">{error}</div>
      )}

      {/* Step 0: Basic Info */}
      {step === 0 && (
        <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-text-primary">Basic Information</h2>

          <div>
            <label className={labelClass}>Listing Type</label>
            <div className="grid grid-cols-2 gap-2">
              {(['rent', 'sale'] as ListingType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => update('listing_type', type)}
                  className={`px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                    form.listing_type === type
                      ? 'bg-primary text-white border-primary'
                      : 'bg-background text-text-secondary border-border hover:border-accent-dark'
                  }`}
                >
                  {type === 'rent' ? 'For Rent' : 'For Sale'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>Property Type *</label>
            <select value={form.property_type_id} onChange={(e) => update('property_type_id', e.target.value)} className={inputClass}>
              <option value="">Select type...</option>
              {propertyTypes.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Title *</label>
            <input type="text" value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="e.g. Spacious 3 Bedroom Apartment in Lekki Phase 1" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Description *</label>
            <textarea rows={5} value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Describe the property in detail..." className={inputClass} />
          </div>
        </div>
      )}

      {/* Step 1: Pricing */}
      {step === 1 && (
        <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-text-primary">Pricing</h2>

          <div>
            <label className={labelClass}>Price (NGN) *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-sm">₦</span>
              <input type="number" min="0" value={form.price_naira} onChange={(e) => update('price_naira', e.target.value)} placeholder="3,500,000" className={`${inputClass} pl-8`} />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.price_negotiable} onChange={(e) => update('price_negotiable', e.target.checked)} className="w-4 h-4 text-accent-dark border-border rounded" />
            <span className="text-sm text-text-secondary">Price is negotiable</span>
          </label>

          {form.listing_type === 'rent' && (
            <>
              <div>
                <label className={labelClass}>Rent Period</label>
                <select value={form.rent_period} onChange={(e) => update('rent_period', e.target.value)} className={inputClass}>
                  <option value="yearly">Per Year</option>
                  <option value="monthly">Per Month</option>
                  <option value="quarterly">Per Quarter</option>
                </select>
              </div>

              <h3 className="text-sm font-medium text-text-primary pt-2">Additional Costs</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Agency Fee (%)</label>
                  <input type="number" min="0" max="100" value={form.agency_fee_pct} onChange={(e) => update('agency_fee_pct', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Caution Fee (NGN)</label>
                  <input type="number" min="0" value={form.caution_fee_naira} onChange={(e) => update('caution_fee_naira', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Service Charge (NGN)</label>
                  <input type="number" min="0" value={form.service_charge_naira} onChange={(e) => update('service_charge_naira', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Legal Fee (NGN)</label>
                  <input type="number" min="0" value={form.legal_fee_naira} onChange={(e) => update('legal_fee_naira', e.target.value)} className={inputClass} />
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Step 2: Location */}
      {step === 2 && (
        <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-text-primary">Location</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>State *</label>
              <select
                value={form.state_id}
                onChange={(e) => { update('state_id', e.target.value); update('city_id', ''); update('area_id', ''); }}
                className={inputClass}
              >
                <option value="">Select state...</option>
                {states.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>City *</label>
              <select
                value={form.city_id}
                onChange={(e) => { update('city_id', e.target.value); update('area_id', ''); }}
                disabled={!form.state_id}
                className={inputClass}
              >
                <option value="">Select city...</option>
                {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Area</label>
              <select value={form.area_id} onChange={(e) => update('area_id', e.target.value)} disabled={!form.city_id} className={inputClass}>
                <option value="">Select area...</option>
                {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Address *</label>
            <input type="text" value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="e.g. 15 Admiralty Way, Lekki Phase 1" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Landmark Note</label>
            <input type="text" value={form.landmark_note} onChange={(e) => update('landmark_note', e.target.value)} placeholder="e.g. Opposite Chevron, near Lekki toll gate" className={inputClass} />
          </div>
        </div>
      )}

      {/* Step 3: Details */}
      {step === 3 && (
        <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-text-primary">Property Details</h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div><label className={labelClass}>Bedrooms</label><input type="number" min="0" value={form.bedrooms} onChange={(e) => update('bedrooms', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Bathrooms</label><input type="number" min="0" value={form.bathrooms} onChange={(e) => update('bathrooms', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Toilets</label><input type="number" min="0" value={form.toilets} onChange={(e) => update('toilets', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Sitting Rooms</label><input type="number" min="0" value={form.sitting_rooms} onChange={(e) => update('sitting_rooms', e.target.value)} className={inputClass} /></div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div><label className={labelClass}>Floor Area (sqm)</label><input type="number" min="0" value={form.floor_area_sqm} onChange={(e) => update('floor_area_sqm', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Land Area (sqm)</label><input type="number" min="0" value={form.land_area_sqm} onChange={(e) => update('land_area_sqm', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Parking Spaces</label><input type="number" min="0" value={form.parking_spaces} onChange={(e) => update('parking_spaces', e.target.value)} className={inputClass} /></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Furnishing</label>
              <select value={form.furnishing} onChange={(e) => update('furnishing', e.target.value)} className={inputClass}>
                {FURNISHING_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div><label className={labelClass}>Year Built</label><input type="number" min="1900" max="2026" value={form.year_built} onChange={(e) => update('year_built', e.target.value)} className={inputClass} /></div>
          </div>

          <h3 className="text-sm font-medium text-text-primary pt-2">Features & Amenities</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { key: 'has_bq', label: 'BQ (Boys Quarter)' },
              { key: 'has_swimming_pool', label: 'Swimming Pool' },
              { key: 'has_gym', label: 'Gym' },
              { key: 'has_cctv', label: 'CCTV Security' },
              { key: 'has_generator', label: 'Generator' },
              { key: 'has_water_supply', label: '24/7 Water' },
              { key: 'has_prepaid_meter', label: 'Prepaid Meter' },
              { key: 'is_serviced', label: 'Serviced' },
              { key: 'is_new_build', label: 'New Build' },
              { key: 'inspection_available', label: 'Inspection Available' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form[key as keyof typeof form] as boolean} onChange={(e) => update(key, e.target.checked)} className="w-4 h-4 text-accent-dark border-border rounded" />
                <span className="text-sm text-text-secondary">{label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Photos */}
      {step === 4 && (
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="font-semibold text-text-primary mb-4">Photos</h2>
          <ImageUploader images={images} onChange={setImages} maxImages={20} maxSizeMB={5} />
        </div>
      )}

      {/* Step 5: Review */}
      {step === 5 && (
        <div className="space-y-4">
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="font-semibold text-text-primary mb-4">Review Your Listing</h2>

            <dl className="space-y-3 text-sm">
              <ReviewRow label="Title" value={form.title} />
              <ReviewRow label="Type" value={`${form.listing_type === 'rent' ? 'For Rent' : 'For Sale'}`} />
              <ReviewRow label="Price" value={form.price_naira ? `₦${Number(form.price_naira).toLocaleString()}` : '-'} />
              {form.listing_type === 'rent' && <ReviewRow label="Rent Period" value={form.rent_period} />}
              <ReviewRow label="Address" value={form.address} />
              <ReviewRow label="Bedrooms" value={form.bedrooms || '-'} />
              <ReviewRow label="Bathrooms" value={form.bathrooms || '-'} />
              <ReviewRow label="Furnishing" value={form.furnishing.replace('_', ' ')} />
              <ReviewRow label="Photos" value={`${images.length} images`} />
            </dl>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {images.slice(0, 6).map((img, i) => (
                <div key={img.id} className="aspect-square rounded-lg overflow-hidden bg-border/30">
                  <img src={img.preview} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
        <div>
          {step > 0 && (
            <button onClick={prevStep} className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-text-secondary hover:bg-surface transition-colors">
              Back
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <button onClick={handleSaveDraft} disabled={creating} className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-text-secondary hover:bg-surface transition-colors disabled:opacity-50">
            Save Draft
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={nextStep} className="bg-primary hover:bg-primary-light text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">
              Continue
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={creating || uploading} className="bg-accent hover:bg-accent-dark text-primary px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
              {creating || uploading ? 'Submitting...' : 'Submit for Approval'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-text-muted">{label}</dt>
      <dd className="text-text-primary font-medium capitalize">{value}</dd>
    </div>
  );
}
