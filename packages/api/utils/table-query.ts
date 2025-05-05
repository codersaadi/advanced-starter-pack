export const isAdvanceQueryFilter = (
  filterFlag: 'commandFilters' | 'advancedFilters' | null | undefined
): boolean =>
  !!(filterFlag === 'advancedFilters' || filterFlag === 'commandFilters');
