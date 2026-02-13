'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Property } from '@/types';

interface Props {
  property: Property;
}

export default function PropertyCard({ property }: Props) {
  const primaryImage = property.primary_image?.image_url || property.images?.[0]?.image_url;

  return (
    <Link href={`/properties/${property.slug}`} className="group block">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100">
        <div className="relative h-48 bg-gray-200">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={property.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              No Image
            </div>
          )}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="bg-green-700 text-white text-xs px-2 py-1 rounded-full uppercase">
              {property.listing_type}
            </span>
            {property.is_featured && (
              <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                Featured
              </span>
            )}
          </div>
        </div>

        <div className="p-4">
          <p className="text-lg font-bold text-green-700">{property.formatted_price}</p>
          <h3 className="font-semibold text-gray-800 mt-1 truncate">{property.title}</h3>
          <p className="text-sm text-gray-500 mt-1 truncate">{property.address}, {property.lga}</p>

          <div className="flex gap-4 mt-3 text-sm text-gray-600">
            <span>{property.bedrooms} Beds</span>
            <span>{property.bathrooms} Baths</span>
            <span>{property.toilets} Toilets</span>
            {property.area_sqm && <span>{property.area_sqm} sqm</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
