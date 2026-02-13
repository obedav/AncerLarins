'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/store/store';
import { fetchProperties } from '@/store/slices/propertySlice';
import { setFilters } from '@/store/slices/searchSlice';
import Navbar from '@/components/layout/Navbar';
import PropertyCard from '@/components/property/PropertyCard';

function SearchContent() {
  const dispatch = useDispatch<AppDispatch>();
  const searchParams = useSearchParams();
  const { properties, loading, meta } = useSelector((state: RootState) => state.property);

  useEffect(() => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => { params[key] = value; });
    dispatch(setFilters(params));
    dispatch(fetchProperties(params));
  }, [searchParams, dispatch]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Search Properties
        {meta && <span className="text-base font-normal text-gray-500 ml-2">({meta.total} results)</span>}
      </h1>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading properties...</div>
      ) : properties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500">
          No properties found. Try adjusting your search.
        </div>
      )}
    </main>
  );
}

export default function SearchPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="text-center py-20 text-gray-500">Loading...</div>}>
        <SearchContent />
      </Suspense>
    </>
  );
}
