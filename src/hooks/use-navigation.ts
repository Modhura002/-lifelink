'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useNavigationStore } from '@/store';
import type { PageRoute } from '@/types';

/**
 * Central navigation hook.
 *
 * Uses router.push('/?page=X') so every navigation creates a real browser
 * history entry. This makes the back/forward buttons work correctly
 * without a full-page reload.
 *
 * Also keeps the Zustand store in sync for components that still read from it.
 */
export function useNavigation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setCurrentPage } = useNavigationStore();

  /** Navigate to a page — updates URL and Zustand state */
  const navigate = (page: PageRoute) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page);
    router.push(`/?${params.toString()}`);
    // Keep Zustand in sync for components that read from the store
    setCurrentPage(page);
  };

  /**
   * Go back using the browser's native history stack.
   * Falls back to `fallback` route if there's no history (e.g. direct link).
   */
  const goBack = (fallback: PageRoute = 'dashboard') => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      navigate(fallback);
    }
  };

  const currentPage = (searchParams.get('page') as PageRoute) || 'landing';

  return { currentPage, navigate, goBack };
}
