'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLazyGetSearchSuggestionsQuery } from '@/store/api/searchApi';
import type { SearchSuggestion } from '@/types';

interface Props {
  placeholder?: string;
  className?: string;
}

export default function SearchAutocomplete({
  placeholder = 'Search by area, property type...',
  className = '',
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const [fetchSuggestions, { data, isFetching }] = useLazyGetSearchSuggestionsQuery();
  const suggestions: SearchSuggestion[] = data?.data || [];

  const handleInputChange = useCallback((value: string) => {
    setQuery(value);
    setActiveIndex(-1);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length >= 2) {
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(value.trim());
        setOpen(true);
      }, 250);
    } else {
      setOpen(false);
    }
  }, [fetchSuggestions]);

  const handleSelect = useCallback((suggestion: SearchSuggestion) => {
    setOpen(false);
    setQuery('');

    const params = new URLSearchParams();
    if (suggestion.type === 'area') {
      params.set('area_id', suggestion.id);
    } else if (suggestion.type === 'city') {
      params.set('city_id', suggestion.id);
    } else if (suggestion.type === 'property_type') {
      params.set('property_type_id', suggestion.id);
    }
    params.set('ref', 'search_suggestion');

    router.push(`/properties?${params.toString()}`);
  }, [router]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    if (query.trim()) {
      router.push(`/properties?q=${encodeURIComponent(query.trim())}&ref=search`);
    }
  }, [query, router]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!open || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i < suggestions.length - 1 ? i + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i > 0 ? i - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }, [open, suggestions, activeIndex, handleSelect]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const typeIcons: Record<string, string> = {
    area: '\uD83D\uDCCD',
    city: '\uD83C\uDFD9\uFE0F',
    property_type: '\uD83C\uDFE0',
  };

  const typeLabels: Record<string, string> = {
    area: 'Area',
    city: 'City',
    property_type: 'Type',
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim().length >= 2 && suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="w-full px-5 py-3.5 text-text-primary rounded-xl bg-background border border-border focus:outline-none focus:border-accent-dark text-base pr-12"
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors"
          aria-label="Search"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </form>

      {/* Suggestions Dropdown */}
      {open && (
        <div
          className="absolute top-full left-0 right-0 mt-1 bg-surface rounded-xl border border-border shadow-xl z-50 overflow-hidden"
          role="listbox"
        >
          {isFetching && suggestions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-text-muted">Searching...</div>
          ) : suggestions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-text-muted">No results found</div>
          ) : (
            suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.type}-${suggestion.id}`}
                onClick={() => handleSelect(suggestion)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                  index === activeIndex ? 'bg-accent/10' : 'hover:bg-background'
                }`}
                role="option"
                aria-selected={index === activeIndex}
              >
                <span className="text-lg">{typeIcons[suggestion.type] || ''}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {suggestion.label}
                  </p>
                  {suggestion.extra && (
                    <p className="text-xs text-text-muted truncate">{suggestion.extra}</p>
                  )}
                </div>
                <span className="text-xs text-text-muted bg-background px-2 py-0.5 rounded-full flex-shrink-0">
                  {typeLabels[suggestion.type] || suggestion.type}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
