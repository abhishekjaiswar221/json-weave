import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import { useThemeSync } from './hooks/useThemeSync';
import { LogoMark } from './components/common/Logo';

// Code-split the workspace (and the Monaco editor it pulls in) away from the
// landing page bundle, so the first impression stays fast.
const Workspace = lazy(() => import('./pages/Workspace'));

function RouteFallback() {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center gap-3 bg-canvas">
      <LogoMark size={32} />
      <span className="text-[12.5px] text-text-faint">Loading workspace…</span>
    </div>
  );
}

export default function App() {
  useThemeSync();

  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/workspace" element={<Workspace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
