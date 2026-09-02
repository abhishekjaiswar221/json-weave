import { useEffect } from 'react';

/**
 * Sets the document title and meta description for the current route.
 * Deliberately tiny — this is a client-rendered SPA, so it can't help
 * pre-render output for crawlers, but it keeps the tab title, the meta
 * description, and (by extension) link-preview/bookmark text accurate per
 * page instead of frozen on whatever index.html shipped with.
 */
export function useDocumentMeta(title: string, description?: string) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    let prevDescription: string | null = null;
    const meta = document.querySelector('meta[name="description"]');
    if (description && meta) {
      prevDescription = meta.getAttribute('content');
      meta.setAttribute('content', description);
    }

    return () => {
      document.title = prevTitle;
      if (description && meta && prevDescription !== null) meta.setAttribute('content', prevDescription);
    };
  }, [title, description]);
}
