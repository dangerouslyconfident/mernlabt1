import { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronDown, Check, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import gsap from 'gsap';

const SORT_OPTIONS = [
  { value: '', label: 'Featured' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

/**
 * Premium Apple-Grade Sticky Filter Bar
 * 
 * Features:
 * - Sticky placement below top glass navbar with backdrop-blur-2xl
 * - Debounced search input pill with instant clear affordance
 * - Category segmented pills with smooth GSAP sliding indicator
 * - Custom glass dropdown for sorting (no native ugly selects)
 * - Removable active filter badges + "Clear all" button
 * - Mobile responsive wrapping layout
 */
export default function FilterBar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  sort,
  onSortChange,
  categories = ['All'],
  onClearAll,
}) {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef(null);
  const pillContainerRef = useRef(null);
  const indicatorRef = useRef(null);

  // Local state for debounced search input with prop synchronization
  const [prevSearch, setPrevSearch] = useState(search);
  const [localSearch, setLocalSearch] = useState(search);

  if (prevSearch !== search) {
    setPrevSearch(search);
    setLocalSearch(search);
  }

  // Debounce search ~250ms
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== search) {
        onSearchChange(localSearch);
      }
    }, 250);

    return () => clearTimeout(handler);
  }, [localSearch, onSearchChange, search]);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // GSAP Sliding indicator animation across segmented pills
  useEffect(() => {
    if (!pillContainerRef.current || !indicatorRef.current) return;

    const activeBtn = pillContainerRef.current.querySelector(
      `[data-category-btn="${category}"]`
    );

    if (activeBtn) {
      const containerRect = pillContainerRef.current.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();
      const left = btnRect.left - containerRect.left;
      const width = btnRect.width;

      gsap.to(indicatorRef.current, {
        x: left,
        width: width,
        duration: 0.35,
        ease: 'power3.out',
      });
    }
  }, [category, categories]);

  const activeSortLabel =
    SORT_OPTIONS.find((opt) => opt.value === sort)?.label || 'Featured';

  const hasActiveFilters =
    Boolean(search) || (category && category !== 'All') || Boolean(sort);

  return (
    <div
      data-filter-bar
      className="sticky top-20 z-40 w-full mb-8 transition-all duration-300"
    >
      <div className="rounded-3xl bg-bg/85 backdrop-blur-2xl border border-glass-border/[0.1] p-3 sm:p-3.5 shadow-[0_12px_36px_0_rgba(0,0,0,0.45)] space-y-3">
        {/* Main Controls Row: Search + Category Pills + Sort Dropdown */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* 1. Search Input Pill */}
          <div className="relative flex-1 min-w-[200px]">
            <div className="relative flex items-center w-full rounded-full bg-glass/[0.04] focus-within:bg-glass/[0.08] border border-glass-border/[0.08] focus-within:border-accent/50 transition-all duration-200">
              <Search
                className="w-4 h-4 text-muted ml-3.5 shrink-0 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search products..."
                aria-label="Search products"
                className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm text-primary placeholder-muted/70 focus:outline-none"
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setLocalSearch('');
                    onSearchChange('');
                  }}
                  aria-label="Clear search"
                  className="mr-3 p-1 rounded-full text-muted hover:text-primary hover:bg-glass/[0.1] transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* 2. Category Segmented Pills (Wrapping on mobile, smooth sliding indicator) */}
          <div className="order-3 md:order-2 overflow-x-auto no-scrollbar py-0.5">
            <div
              ref={pillContainerRef}
              role="tablist"
              aria-label="Filter by product category"
              className="relative inline-flex flex-wrap items-center gap-1 p-1 rounded-full bg-glass/[0.03] border border-glass-border/[0.06]"
            >
              {/* Sliding Active Pill Background Indicator */}
              <div
                ref={indicatorRef}
                className="absolute top-1 bottom-1 rounded-full bg-primary -z-10 shadow-sm transition-[opacity] pointer-events-none"
                style={{ width: 0, left: 0 }}
                aria-hidden="true"
              />

              {categories.map((cat) => {
                const isActive = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    data-category-btn={cat}
                    onClick={() => onCategoryChange(cat)}
                    className={`relative z-10 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors duration-200 select-none cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      isActive
                        ? 'text-bg font-semibold'
                        : 'text-muted hover:text-primary hover:bg-glass/[0.05]'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Styled Glass Sort Dropdown (Replacing native select) */}
          <div ref={sortRef} className="relative order-2 md:order-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsSortOpen(!isSortOpen)}
              aria-expanded={isSortOpen}
              aria-haspopup="listbox"
              aria-label={`Sort by: currently ${activeSortLabel}`}
              className="w-full sm:w-auto inline-flex items-center justify-between gap-2.5 px-4 py-2 rounded-full bg-glass/[0.04] hover:bg-glass/[0.08] border border-glass-border/[0.08] hover:border-glass-border/[0.16] text-xs font-medium text-primary transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-accent shrink-0" />
              <span className="truncate">{activeSortLabel}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-muted transition-transform duration-200 shrink-0 ${
                  isSortOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isSortOpen && (
              <div
                role="listbox"
                className="absolute right-0 mt-2 w-48 rounded-2xl bg-bg/95 backdrop-blur-2xl border border-glass-border/[0.14] p-1.5 shadow-[0_16px_48px_0_rgba(0,0,0,0.5)] z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="px-3 py-1.5 text-[10px] font-semibold text-muted uppercase tracking-wider">
                  Sort Products
                </div>
                {SORT_OPTIONS.map((option) => {
                  const isSelected = sort === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onSortChange(option.value);
                        setIsSortOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-colors cursor-pointer select-none ${
                        isSelected
                          ? 'bg-primary text-bg font-semibold'
                          : 'text-secondary hover:text-primary hover:bg-glass/[0.08]'
                      }`}
                    >
                      <span>{option.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Active Filters Row (Removable badges + "Clear all" link) */}
        {hasActiveFilters && (
          <div className="pt-2 border-t border-glass-border/[0.06] flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted flex items-center gap-1.5 text-[11px] font-medium mr-1">
              <SlidersHorizontal className="w-3 h-3 text-accent" />
              <span>Filters:</span>
            </span>

            {search && (
              <button
                type="button"
                onClick={() => {
                  setLocalSearch('');
                  onSearchChange('');
                }}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-glass/[0.06] hover:bg-glass/[0.12] border border-glass-border/[0.1] text-[11px] text-primary transition-colors cursor-pointer"
              >
                <span>&ldquo;{search}&rdquo;</span>
                <X className="w-3 h-3 text-muted hover:text-primary" />
              </button>
            )}

            {category && category !== 'All' && (
              <button
                type="button"
                onClick={() => onCategoryChange('All')}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-glass/[0.06] hover:bg-glass/[0.12] border border-glass-border/[0.1] text-[11px] text-primary transition-colors cursor-pointer"
              >
                <span>Category: {category}</span>
                <X className="w-3 h-3 text-muted hover:text-primary" />
              </button>
            )}

            {sort && (
              <button
                type="button"
                onClick={() => onSortChange('')}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-glass/[0.06] hover:bg-glass/[0.12] border border-glass-border/[0.1] text-[11px] text-primary transition-colors cursor-pointer"
              >
                <span>Sort: {activeSortLabel}</span>
                <X className="w-3 h-3 text-muted hover:text-primary" />
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setLocalSearch('');
                onClearAll();
              }}
              className="text-[11px] text-accent hover:underline font-medium ml-1 transition-colors cursor-pointer"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
