'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for fetching and managing list data from a service function.
 * @param {Function} fetchFn - Service function that returns { data, error, count }
 * @param {object} [initialParams] - Initial query params
 * @returns {{ items, loading, error, total, params, setParams, refetch }}
 */
export function useDataList(fetchFn, initialParams = {}) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError, count } = await fetchFn(params);
      if (fetchError) throw fetchError;
      setItems(data || []);
      setTotal(count || 0);
    } catch (err) {
      setError(err.message || 'An error occurred while fetching data.');
    } finally {
      setLoading(false);
    }
  }, [fetchFn, params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { items, loading, error, total, params, setParams, refetch: fetchData };
}
