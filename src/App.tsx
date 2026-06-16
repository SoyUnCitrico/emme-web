import { lazy, Suspense, type ReactElement } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AudioProvider } from './hooks/useAudio';

// Lazy loading pages for better performance
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));

function RouteFallback() {
  return (
    <div className="flex items-center justify-center h-screen bg-matrix-black">
      <p className="font-mono text-matrix-green text-glow-green animate-flicker">
        &gt; cargando<span className="animate-pulse">_</span>
      </p>
    </div>
  );
}

const withSuspense = (element: ReactElement) => (
  <Suspense fallback={<RouteFallback />}>{element}</Suspense>
);

const router = createBrowserRouter(
  [
    { path: '/', element: withSuspense(<Home />) },
    { path: '/about', element: withSuspense(<About />) },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
    },
  }
);

export default function App() {
  return (
    <AudioProvider>
      <RouterProvider
        router={router}
        future={{
          v7_startTransition: true,
        }}
      />
    </AudioProvider>
  );
}
