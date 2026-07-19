export const QUERY_DEFAULTS = {
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
} as const;

export const MUTATION_DEFAULTS = {
  retry: 1,
} as const;
