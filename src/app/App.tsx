import { Suspense } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes.tsx';
import { AppProvider } from './context/AppContext';
import { OfflineBanner } from './components/OfflineBanner';

export default function App() {
  return (
    <AppProvider>
      <OfflineBanner />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
        </div>
      }>
        <RouterProvider router={router} />
      </Suspense>
    </AppProvider>
  );
}