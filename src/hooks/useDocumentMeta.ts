import { useEffect } from 'react';
import { SITE_URL } from '../lib/seo';

/**
 * Sets the document title, meta description and canonical URL for the
 * current route. Deliberately tiny — this is a client-rendered SPA, so it
 * can't help pre-render output for crawlers, but it keeps the tab title,
 * meta description, canonical link and (by extension) link-preview/bookmark
 * text accurate per page instead of frozen on whatever index.html shipped
 * with. `path` defaults to the current location, so callers only need to
 * pass it when the route can't be read from window.location (there isn't
 * such a case here, but it keeps the hook explicit and testable).
 */
export function useDocumentMeta(title: string, description?: string, path?: string) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    let prevDescription: string | null = null;
    const descriptionMeta = document.querySelector('meta[name="description"]');
    if (description && descriptionMeta) {
      prevDescription = descriptionMeta.getAttribute('content');
      descriptionMeta.setAttribute('content', description);
    }

    let prevCanonical: string | null = null;
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      prevCanonical = canonicalLink.getAttribute('href');
      canonicalLink.setAttribute('href', `${SITE_URL}${path ?? window.location.pathname}`);
    }

    return () => {
      document.title = prevTitle;
      if (description && descriptionMeta && prevDescription !== null) descriptionMeta.setAttribute('content', prevDescription);
      if (canonicalLink && prevCanonical !== null) canonicalLink.setAttribute('href', prevCanonical);
    };
  }, [title, description, path]);
}
