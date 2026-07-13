import { Suspense } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes.tsx';
import { AppProvider } from './context/AppContext';

export default function App() {
  return (
    <AppProvider>
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