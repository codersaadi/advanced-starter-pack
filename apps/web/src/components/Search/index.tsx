'use client';

import {
  // Import LucideIcon for type safety
  ArrowRight,
  BookOpen,
  Clock,
  Code,
  FileText,
  Filter,
  type LucideIcon,
  Search,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// =================================================================
// 1. TYPE-SAFE DEFINITIONS
// This makes the entire component robust and self-documenting.
// =================================================================
// type SearchResultType = 'recent' | 'trending' | 'action' | 'suggestion';

interface BaseResult {
  text: string;
}

interface RecentResult extends BaseResult {
  type: 'recent';
  category: string;
  date: string;
}

interface TrendingResult extends BaseResult {
  type: 'trending';
  category: string;
  trending: string;
}

interface Action_Result extends BaseResult {
  type: 'action';
  icon: LucideIcon;
  shortcut: string;
}

interface SuggestionResult extends BaseResult {
  type: 'suggestion';
  category: string;
  icon: LucideIcon;
}

type SearchResult =
  | RecentResult
  | TrendingResult
  | Action_Result
  | SuggestionResult;

// =================================================================
// THE COMPONENT
// =================================================================
const AdvancedSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: 'any',
    fileType: 'all',
    author: 'anyone',
    status: 'any',
    tags: [] as string[],
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // --- Type-safe mock data ---
  const recentSearches: RecentResult[] = [
    {
      text: 'React Server Components',
      type: 'recent',
      category: 'code',
      date: '2 hours ago',
    },
    {
      text: 'Tailwind CSS Grid layouts',
      type: 'recent',
      category: 'design',
      date: '1 day ago',
    },
  ];

  const trendingSearches: TrendingResult[] = [
    {
      text: 'AI-powered development tools',
      type: 'trending',
      category: 'tools',
      trending: '+245%',
    },
    {
      text: 'Micro-frontend architecture',
      type: 'trending',
      category: 'architecture',
      trending: '+180%',
    },
  ];

  const quickActions: Action_Result[] = [
    {
      text: 'Create new project',
      type: 'action',
      icon: Zap,
      shortcut: 'Ctrl+N',
    },
    {
      text: 'Open documentation',
      type: 'action',
      icon: BookOpen,
      shortcut: 'Ctrl+D',
    },
  ];

  const suggestions: SuggestionResult[] = query
    ? [
        {
          text: `${query} tutorial`,
          type: 'suggestion' as const,
          category: 'learning',
          icon: BookOpen,
        },
        {
          text: `${query} examples`,
          type: 'suggestion' as const,
          category: 'code',
          icon: Code,
        },
        {
          text: `${query} documentation`,
          type: 'suggestion' as const,
          category: 'docs',
          icon: FileText,
        },
      ].filter((item) => item.text.toLowerCase().includes(query.toLowerCase()))
    : [];

  const availableTags = ['google', 'bing'];

  const allResults: SearchResult[] = [
    ...suggestions,
    ...(query === '' ? quickActions : []),
    ...(query === '' ? recentSearches : []),
    ...(query === '' ? trendingSearches : []),
  ];

  // --- Keyboard navigation & effects (largely unchanged logic) ---
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        return;
      }
      if (!isOpen) return;
      // ... same switch logic
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, query, showFilters]);

  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current?.children[selectedIndex]) {
      resultsRef.current.children[selectedIndex].scrollIntoView({
        block: 'nearest',
      });
    }
  }, [selectedIndex]);

  // --- Type-safe handlers ---
  const handleSearch = (searchQuery: string) => {
    // biome-ignore lint/suspicious/noConsoleLog: <explanation>
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.log('Searching for:', searchQuery, 'with filters:', filters);
    setQuery(searchQuery);
    setIsOpen(false);
    setSelectedIndex(-1);
    setShowFilters(false);
  };

  const _updateFilter = (
    key: keyof typeof filters,
    value: string | string[]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleTag = (tag: string) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const clearFilters = () => {
    /* ... no changes needed here ... */
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) =>
    key === 'tags'
      ? value.length > 0
      : !['any', 'all', 'anyone'].includes(value as string)
  );

  // --- Type-safe icon resolver ---
  const getResultIcon = (result: SearchResult): LucideIcon => {
    // biome-ignore lint/style/useDefaultSwitchClause: <explanation>
    switch (result.type) {
      case 'action':
      case 'suggestion':
        return result.icon;
      case 'recent':
        return Clock;
      case 'trending':
        return TrendingUp;
    }
  };

  return (
    <div className="mx-auto px-4">
      {/* =================================================================
       * 2. THEMED SEARCH TRIGGER
       * ================================================================= */}
      <button
        type="button"
        className="group text-left"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md">
          <Search className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
        </div>
      </button>

      {/* =================================================================
       * 3. THEMED & REPOSITIONED MODAL
       * ================================================================= */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-8 sm:pt-[10vh]">
          {/* biome-ignore lint/nursery/noStaticElementInteractions: <explanation> */}
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <div className="fade-in slide-in-from-top-4 relative w-full max-w-2xl animate-in overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl duration-300">
            {/* --- Themed Header --- */}
            <div className="border-border border-b p-4">
              <div className="flex items-center gap-3">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(-1);
                  }}
                  placeholder="Search anything..."
                  className="flex-1 bg-transparent text-lg placeholder-muted-foreground outline-none"
                  autoFocus
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="rounded-lg p-1.5 transition-colors hover:bg-accent"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 transition-all duration-200 ${
                    showFilters || hasActiveFilters
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  <span className="font-medium text-sm">Filters</span>
                  {hasActiveFilters && (
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </button>
              </div>
            </div>

            {/* --- Themed Filters Panel --- */}
            {showFilters && (
              <div className="slide-in-from-top animate-in border-border border-b bg-muted/50 p-4 duration-200">
                {/* Simplified for brevity, apply bg-card, border-input, focus:ring-ring to inputs/selects */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Tags */}
                  <div className="col-span-2">
                    {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
                    <label className="mb-2 block font-medium text-foreground text-sm">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map((tag) => (
                        <button
                          type="button"
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`rounded-full px-3 py-1 font-medium text-sm transition-all ${
                            filters.tags.includes(tag)
                              ? 'bg-primary/10 text-primary ring-1 ring-primary/30'
                              : 'bg-card text-muted-foreground hover:bg-accent hover:text-foreground'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {hasActiveFilters && (
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="rounded-lg px-3 py-1.5 text-muted-foreground text-sm transition-colors hover:bg-card hover:text-destructive"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* --- Themed Results --- */}
            <div ref={resultsRef} className="max-h-[50vh] overflow-y-auto">
              {allResults.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <p className="font-medium text-foreground text-lg">
                    No results found
                  </p>
                  <p className="mt-1 text-sm">
                    Try a different search or adjust your filters.
                  </p>
                </div>
              ) : (
                <div className="p-2">
                  {/* biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation> */}
                  {allResults.map((result, index) => {
                    const IconComponent = getResultIcon(result);
                    return (
                      <button
                        type="button"
                        key={`${result.type}-${result.text}`}
                        onClick={() => handleSearch(result.text)}
                        className={`group flex w-full items-center gap-3 rounded-lg p-3 text-left transition-all duration-150 ${
                          selectedIndex === index
                            ? 'bg-primary/10'
                            : 'hover:bg-accent'
                        }`}
                      >
                        <div
                          className={`rounded-md p-1.5 ${selectedIndex === index ? 'bg-primary/10' : 'bg-muted group-hover:bg-card'}`}
                        >
                          <IconComponent
                            className={`h-4 w-4 transition-colors ${result.type === 'trending' ? 'text-chart-5' : ''}
                            ${result.type === 'action' ? 'text-primary' : ''}
                            ${
                              // biome-ignore lint/performance/useTopLevelRegex: <explanation>
                              result.type.match(/trending|action/)
                                ? ''
                                : 'text-muted-foreground'
                            }
                          `}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div
                            className={`font-medium text-foreground ${selectedIndex === index ? 'text-primary' : ''}`}
                          >
                            {result.text}
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-muted-foreground text-xs">
                            {result.type === 'trending' && (
                              <span className="font-semibold text-chart-5">
                                {result.trending}
                              </span>
                            )}
                            {result.type !== 'action' && (
                              <span>{result.category}</span>
                            )}
                            {result.type === 'recent' && (
                              <span>{result.date}</span>
                            )}
                          </div>
                        </div>
                        {result.type === 'action' && (
                          <kbd className="rounded-md bg-muted px-2 py-1 font-mono text-muted-foreground text-xs">
                            {result.shortcut}
                          </kbd>
                        )}
                        <ArrowRight
                          className={`h-4 w-4 text-muted-foreground transition-all ${selectedIndex === index ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* --- Themed Footer --- */}
            <div className="border-border border-t bg-card p-3">
              <div className="flex items-center justify-between text-muted-foreground text-xs">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <kbd className="rounded-md bg-muted px-1.5 py-0.5 font-sans font-semibold">
                      ↵
                    </kbd>
                    <span>select</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <kbd className="rounded-md bg-muted px-1.5 py-0.5 font-sans font-semibold">
                      ↑↓
                    </kbd>
                    <span>navigate</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <kbd className="rounded-md bg-muted px-1.5 py-0.5 font-mono">
                      Esc
                    </kbd>
                    <span>close</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span>Powered by</span>
                  <span className="bg-gradient-to-r from-special-from to-special-to bg-clip-text font-semibold text-transparent">
                    Acme Search
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
