'use client';

import SearchAutocomplete from './SearchAutocomplete';

export default function HeroSearch() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-surface rounded-2xl p-2 shadow-2xl">
        <SearchAutocomplete placeholder="Search by area, property type..." />
      </div>
    </div>
  );
}
