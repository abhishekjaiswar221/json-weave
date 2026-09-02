import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Workspace from './pages/Workspace';
import { useThemeSync } from './hooks/useThemeSync';
import { LogoMark } from './components/common/Logo';

// The workspace *is* the product — it's mounted directly at "/" (no
// marketing page in front of it) and loaded eagerly so there's nothing to
// wait on. The informational/features page is secondary traffic, so it's
// the one that's code-split away instead.
const Features = lazy(() => import('./pages/Features'));

function RouteFallback() {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center gap-3 bg-canvas">
      <LogoMark size={32} />
      <span className="text-[12.5px] text-text-faint">Loading…</span>
    </div>
  );
}

export default function App() {
  useThemeSync();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Workspace />} />
        <Route
          path="/features"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Features />
            </Suspense>
          }
        />
        {/* legacy link compatibility — the workspace used to live at /workspace */}
        <Route path="/workspace" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
