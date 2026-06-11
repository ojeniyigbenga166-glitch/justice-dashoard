'use client';

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * Hook for form submission with loading, error, and success states.
 * @param {Function} submitFn - The async submit function
 * @param {object} [options]
 * @param {string} [options.successMessage] - Toast message on success
 * @param {string} [options.errorMessage] - Toast message on error
 * @param {Function} [options.onSuccess] - Callback on success
 * @param {Function} [options.onError] - Callback on error
 */
export function useForm(submitFn, options = {}) {
  const {
    successMessage = 'Saved successfully!',
    errorMessage = 'Something went wrong. Please try again.',
    onSuccess,
    onError,
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = useCallback(
    async (data) => {
      setLoading(true);
      setError(null);
      setSuccess(false);

      try {
        const result = await submitFn(data);
        setSuccess(true);
        toast.success(successMessage);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const message = err?.message || errorMessage;
        setError(message);
        toast.error(message);
        onError?.(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [submitFn, successMessage, errorMessage, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return { handleSubmit, loading, error, success, reset };
}
