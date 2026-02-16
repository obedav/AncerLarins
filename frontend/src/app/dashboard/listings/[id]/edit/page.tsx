'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useGetMyPropertyByIdQuery } from '@/store/api/agentApi';
import { useUpdatePropertyMutation } from '@/store/api/propertyApi';
import { useGetStatesQuery, useGetCitiesQuery, useGetAreasQuery, useGetPropertyTypesQuery } from '@/store/api/locationApi';
import type { CreatePropertyPayload, ListingType, Furnishing, RentPeriod } from '@/types';

const FURNISHING_OPTIONS: { value: Furnishing; label: string }[] = [
  { value: 'unfurnished', label: 'Unfurnished' },
  { value: 'semi_furnished', label: 'Semi-Furnished' },
  { value: 'furnished', label: 'Furnished' },
];

export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading: loading } = useGetMyPropertyByIdQuery(id);
  const [updateProperty, { isLoading: saving }] = useUpdatePropertyMutation();
  const { data: statesData } = useGetStatesQuery();
  const { data: propertyTypesData } = useGetPropertyTypesQuery();

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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

  const property = data?.data;

  useEffect(() => {
    if (property) {
      setForm({
        listing_type: property.listing_type,
        property_type_id: property.property_type?.id || '',
        title: property.title,
        description: property.description || '',
        price_naira: String(property.price_kobo / 100),
        price_negotiable: property.price_negotiable,
        rent_period: property.rent_period || 'yearly',
        agency_fee_pct: property.agency_fee_pct?.toString() || '',
        caution_fee_naira: property.caution_fee_kobo ? String(property.caution_fee_kobo / 100) : '',
        service_charge_naira: property.service_charge_kobo ? String(property.service_charge_kobo / 100) : '',
        legal_fee_naira: property.legal_fee_kobo ? String(property.legal_fee_kobo / 100) : '',
        state_id: property.state?.id || '',
        city_id: property.city?.id || '',
        area_id: property.area?.id || '',
        address: property.address,
        landmark_note: property.landmark_note || '',
        bedrooms: property.bedrooms?.toString() || '',
        bathrooms: property.bathrooms?.toString() || '',
        toilets: property.toilets?.toString() || '',
        sitting_rooms: property.sitting_rooms?.toString() || '',
        floor_area_sqm: property.floor_area_sqm?.toString() || '',
        land_area_sqm: property.land_area_sqm?.toString() || '',
        year_built: property.year_built?.toString() || '',
        furnishing: property.furnishing || 'unfurnished',
        parking_spaces: property.parking_spaces?.toString() || '',
        has_bq: property.has_bq,
        has_swimming_pool: property.has_swimming_pool,
        has_gym: property.has_gym,
        has_cctv: property.has_cctv,
        has_generator: property.has_generator,
        has_water_supply: property.has_water_supply,
        has_prepaid_meter: property.has_prepaid_meter,
        is_serviced: property.is_serviced,
        is_new_build: property.is_new_build,
        inspection_available: property.inspection_available,
      });
    }
  }, [property]);

  const update = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload: Partial<CreatePropertyPayload> = {
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
      has_bq: form.has_bq,
      has_swimming_pool: form.has_swimming_pool,
      has_gym: form.has_gym,
      has_cctv: form.has_cctv,
      has_generator: form.has_generator,
      has_water_supply: form.has_water_supply,
      has_prepaid_meter: form.has_prepaid_meter,
      is_serviced: form.is_serviced,
      is_new_build: form.is_new_build,
      inspection_available: form.inspection_available,
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

    try {
      await updateProperty({ id, data: payload }).unwrap();
      setSuccess('Property updated successfully.');
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      setError(apiErr?.data?.message || 'Failed to update property.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl animate-pulse space-y-6">
        <div className="h-8 bg-border/50 rounded w-1/3" />
        <div className="h-64 bg-border/50 rounded-xl" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-16">
        <p className="text-text-muted">Property not found.</p>
      </div>
    );
  }

  const inputClass = 'w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:border-accent-dark text-text-primary text-sm';
  const labelClass = 'block text-sm font-medium text-text-secondary mb-1.5';

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-bold text-text-primary mb-1">Edit Listing</h1>
      <p className="text-sm text-text-muted mb-6">Update your property details below.</p>

      {success && <div className="bg-green-50 text-green-700 p-3 rounded-xl mb-6 text-sm">{success}</div>}
      {error && <div className="bg-error/10 text-error p-3 rounded-xl mb-6 text-sm">{error}</div>}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Info */}
        <section className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-text-primary">Basic Information</h2>
          <div className="grid grid-cols-2 gap-2">
            {(['rent', 'sale'] as ListingType[]).map((type) => (
              <button key={type} type="button" onClick={() => update('listing_type', type)}
                className={`px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${form.listing_type === type ? 'bg-primary text-white border-primary' : 'bg-background text-text-secondary border-border'}`}>
                {type === 'rent' ? 'For Rent' : 'For Sale'}
              </button>
            ))}
          </div>
          <div>
            <label className={labelClass}>Property Type</label>
            <select value={form.property_type_id} onChange={(e) => update('property_type_id', e.target.value)} className={inputClass}>
              <option value="">Select...</option>
              {propertyTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div><label className={labelClass}>Title</label><input type="text" value={form.title} onChange={(e) => update('title', e.target.value)} className={inputClass} /></div>
          <div><label className={labelClass}>Description</label><textarea rows={4} value={form.description} onChange={(e) => update('description', e.target.value)} className={inputClass} /></div>
        </section>

        {/* Pricing */}
        <section className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-text-primary">Pricing</h2>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-sm">₦</span>
            <input type="number" min="0" value={form.price_naira} onChange={(e) => update('price_naira', e.target.value)} className={`${inputClass} pl-8`} />
          </div>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.price_negotiable} onChange={(e) => update('price_negotiable', e.target.checked)} className="w-4 h-4" /><span className="text-sm text-text-secondary">Negotiable</span></label>
          {form.listing_type === 'rent' && (
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelClass}>Rent Period</label><select value={form.rent_period} onChange={(e) => update('rent_period', e.target.value)} className={inputClass}><option value="yearly">Yearly</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option></select></div>
              <div><label className={labelClass}>Agency Fee (%)</label><input type="number" value={form.agency_fee_pct} onChange={(e) => update('agency_fee_pct', e.target.value)} className={inputClass} /></div>
            </div>
          )}
        </section>

        {/* Location */}
        <section className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-text-primary">Location</h2>
          <div className="grid grid-cols-3 gap-4">
            <div><label className={labelClass}>State</label><select value={form.state_id} onChange={(e) => { update('state_id', e.target.value); update('city_id', ''); update('area_id', ''); }} className={inputClass}><option value="">Select...</option>{states.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
            <div><label className={labelClass}>City</label><select value={form.city_id} onChange={(e) => { update('city_id', e.target.value); update('area_id', ''); }} disabled={!form.state_id} className={inputClass}><option value="">Select...</option>{cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div><label className={labelClass}>Area</label><select value={form.area_id} onChange={(e) => update('area_id', e.target.value)} disabled={!form.city_id} className={inputClass}><option value="">Select...</option>{areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
          </div>
          <div><label className={labelClass}>Address</label><input type="text" value={form.address} onChange={(e) => update('address', e.target.value)} className={inputClass} /></div>
          <div><label className={labelClass}>Landmark</label><input type="text" value={form.landmark_note} onChange={(e) => update('landmark_note', e.target.value)} className={inputClass} /></div>
        </section>

        {/* Details */}
        <section className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-text-primary">Details</h2>
          <div className="grid grid-cols-4 gap-4">
            <div><label className={labelClass}>Bed</label><input type="number" min="0" value={form.bedrooms} onChange={(e) => update('bedrooms', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Bath</label><input type="number" min="0" value={form.bathrooms} onChange={(e) => update('bathrooms', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Toilet</label><input type="number" min="0" value={form.toilets} onChange={(e) => update('toilets', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Sitting</label><input type="number" min="0" value={form.sitting_rooms} onChange={(e) => update('sitting_rooms', e.target.value)} className={inputClass} /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className={labelClass}>Floor (sqm)</label><input type="number" value={form.floor_area_sqm} onChange={(e) => update('floor_area_sqm', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Furnishing</label><select value={form.furnishing} onChange={(e) => update('furnishing', e.target.value)} className={inputClass}>{FURNISHING_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
            <div><label className={labelClass}>Year Built</label><input type="number" value={form.year_built} onChange={(e) => update('year_built', e.target.value)} className={inputClass} /></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { key: 'has_bq', label: 'BQ' },{ key: 'has_swimming_pool', label: 'Pool' },{ key: 'has_gym', label: 'Gym' },
              { key: 'has_cctv', label: 'CCTV' },{ key: 'has_generator', label: 'Generator' },{ key: 'has_water_supply', label: 'Water' },
              { key: 'has_prepaid_meter', label: 'Meter' },{ key: 'is_serviced', label: 'Serviced' },{ key: 'is_new_build', label: 'New Build' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2"><input type="checkbox" checked={form[key as keyof typeof form] as boolean} onChange={(e) => update(key, e.target.checked)} className="w-4 h-4" /><span className="text-sm text-text-secondary">{label}</span></label>
            ))}
          </div>
        </section>

        <button type="submit" disabled={saving} className="w-full bg-accent hover:bg-accent-dark text-primary py-3 rounded-xl font-semibold transition-colors disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
