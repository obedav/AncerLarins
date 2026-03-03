'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { estateSchema, parseEstateAmenities, type EstateFormData } from '@/lib/schemas/estate';
import {
  useGetAdminEstatesQuery,
  useCreateEstateMutation,
  useUpdateEstateMutation,
  useDeleteEstateMutation,
} from '@/store/api/estateApi';
import { useGetStatesQuery, useGetCitiesQuery, useGetAreasQuery } from '@/store/api/locationApi';
import type { EstateType, EstateListItem } from '@/types/estate';

const ESTATE_TYPE_OPTIONS: { value: EstateType; label: string }[] = [
  { value: 'gated_estate', label: 'Gated Estate' },
  { value: 'open_estate', label: 'Open Estate' },
  { value: 'highrise', label: 'Highrise' },
  { value: 'mixed_use', label: 'Mixed Use' },
];

const DEFAULT_VALUES: EstateFormData = {
  name: '',
  area_id: '',
  estate_type: 'gated_estate',
  description: '',
  developer: '',
  year_built: '',
  total_units: '',
  amenities: '',
  security_type: '',
  service_charge_kobo: '',
  service_charge_period: '',
  electricity_source: '',
  water_source: '',
  cover_image_url: '',
};

export default function AdminEstatesPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const { data, isLoading } = useGetAdminEstatesQuery({ page, per_page: 20, ...(searchQuery ? { q: searchQuery } : {}) });
  const [createEstate, { isLoading: creating }] = useCreateEstateMutation();
  const [updateEstate] = useUpdateEstateMutation();
  const [deleteEstate] = useDeleteEstateMutation();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Cascading location selects
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const { data: statesData } = useGetStatesQuery();
  const { data: citiesData } = useGetCitiesQuery(selectedState, { skip: !selectedState });
  const { data: areasData } = useGetAreasQuery(selectedCity, { skip: !selectedCity });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<EstateFormData>({
    resolver: zodResolver(estateSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const estates = data?.data || [];
  const meta = data?.meta;

  const resetForm = () => {
    reset(DEFAULT_VALUES);
    setEditId(null);
    setShowForm(false);
    setSelectedState('');
    setSelectedCity('');
  };

  const onSubmit = async (data: EstateFormData) => {
    const payload = {
      ...data,
      amenities: parseEstateAmenities(data.amenities),
      year_built: data.year_built ? Number(data.year_built) : undefined,
      total_units: data.total_units ? Number(data.total_units) : undefined,
      service_charge_kobo: data.service_charge_kobo ? Number(data.service_charge_kobo) : undefined,
    };

    try {
      if (editId) {
        await updateEstate({ id: editId, data: payload }).unwrap();
      } else {
        await createEstate(payload).unwrap();
      }
      resetForm();
    } catch { /* RTK handles */ }
  };

  const handleEdit = (estate: EstateListItem) => {
    reset({
      name: estate.name,
      area_id: estate.area?.id || '',
      estate_type: estate.estate_type,
      description: '',
      developer: '',
      security_type: estate.security_type || '',
      service_charge_kobo: estate.service_charge_kobo?.toString() || '',
      service_charge_period: estate.service_charge_period || '',
      cover_image_url: estate.cover_image_url || '',
      year_built: '',
      total_units: '',
      amenities: '',
      electricity_source: '',
      water_source: '',
    });
    setEditId(estate.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this estate?')) return;
    try {
      await deleteEstate(id).unwrap();
    } catch { /* RTK handles */ }
  };

  const fieldError = (name: keyof EstateFormData) => {
    const err = errors[name];
    return err?.message ? <p className="text-error text-xs mt-1">{err.message as string}</p> : null;
  };

  const inputClass = 'px-4 py-3 border border-border rounded-xl bg-background text-text-primary text-sm';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-text-primary">Estate Management</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          New Estate
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search estates..."
        value={searchQuery}
        onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
        className="w-full sm:w-80 px-4 py-2.5 border border-border rounded-xl bg-background text-text-primary text-sm"
      />

      {/* Create/Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-text-primary">{editId ? 'Edit Estate' : 'New Estate'}</h2>

          <div>
            <input type="text" placeholder="Estate name" {...register('name')} className={`w-full ${inputClass}`} />
            {fieldError('name')}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <select
              value={selectedState}
              onChange={(e) => { setSelectedState(e.target.value); setSelectedCity(''); setValue('area_id', ''); }}
              className={inputClass}
            >
              <option value="">Select State</option>
              {statesData?.data?.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            <select
              value={selectedCity}
              onChange={(e) => { setSelectedCity(e.target.value); setValue('area_id', ''); }}
              disabled={!selectedState}
              className={`${inputClass} disabled:opacity-50`}
            >
              <option value="">Select City</option>
              {citiesData?.data?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <div>
              <select
                {...register('area_id')}
                disabled={!selectedCity}
                className={`${inputClass} w-full disabled:opacity-50`}
              >
                <option value="">Select Area</option>
                {areasData?.data?.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              {fieldError('area_id')}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <select {...register('estate_type')} className={inputClass}>
              {ESTATE_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <input type="text" placeholder="Developer" {...register('developer')} className={inputClass} />
            <input type="number" placeholder="Year built" {...register('year_built')} className={inputClass} />
          </div>

          <textarea placeholder="Description" {...register('description')} rows={3} className={`w-full ${inputClass}`} />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input type="number" placeholder="Total units" {...register('total_units')} className={inputClass} />
            <input type="text" placeholder="Security type" {...register('security_type')} className={inputClass} />
            <input type="text" placeholder="Electricity source" {...register('electricity_source')} className={inputClass} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input type="text" placeholder="Water source" {...register('water_source')} className={inputClass} />
            <input type="number" placeholder="Service charge (kobo)" {...register('service_charge_kobo')} className={inputClass} />
            <input type="text" placeholder="Service charge period (e.g. monthly)" {...register('service_charge_period')} className={inputClass} />
          </div>

          <input type="text" placeholder="Amenities (comma-separated)" {...register('amenities')} className={`w-full ${inputClass}`} />

          <div>
            <input type="text" placeholder="Cover image URL" {...register('cover_image_url')} className={`w-full ${inputClass}`} />
            {fieldError('cover_image_url')}
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={resetForm} className="px-4 py-2 rounded-xl border border-border text-sm text-text-secondary">Cancel</button>
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium disabled:opacity-50"
            >
              {editId ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      )}

      {/* Estates List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-4 animate-pulse h-16" />
          ))}
        </div>
      ) : estates.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-border rounded-xl">
          <p className="text-text-muted">No estates found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {estates.map((estate) => (
            <div key={estate.id} className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-text-primary truncate">{estate.name}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs bg-accent/15 text-accent-dark px-2 py-0.5 rounded-full capitalize">
                    {estate.estate_type.replace(/_/g, ' ')}
                  </span>
                  {estate.area && (
                    <span className="text-xs text-text-muted">{estate.area.name}</span>
                  )}
                  <span className="text-xs text-text-muted">{estate.reviews_count ?? 0} reviews</span>
                  <span className="text-xs text-text-muted">{estate.properties_count ?? 0} properties</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleEdit(estate)}
                  className="text-xs text-primary hover:underline px-2 py-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(estate.id)}
                  className="text-xs text-error hover:underline px-2 py-1"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-xs text-text-muted">Page {meta.current_page} of {meta.last_page}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1 rounded-lg border border-border text-xs disabled:opacity-40">Previous</button>
                <button onClick={() => setPage(Math.min(meta.last_page, page + 1))} disabled={page === meta.last_page} className="px-3 py-1 rounded-lg border border-border text-xs disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
