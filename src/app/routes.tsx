import { createBrowserRouter } from 'react-router';
import { lazy } from 'react';
import { retryDynamicImport } from './utils/retryDynamicImport';

// Import Root component (not lazy loaded as it's the layout)
import { Root } from './pages/Root';
import { ErrorPage } from './pages/ErrorPage';

// Lazy load pages with retry logic for failed imports
const Home = lazy(() =>
  retryDynamicImport(() =>
    import('./pages/Home').then(module => ({ default: module.Home })),
    {
      maxRetries: 3,
      baseDelay: 1000,
      onRetry: (attempt, error) => {
        console.warn(`Retrying Home import (attempt ${attempt}):`, error.message);
      },
    }
  )
);

const Shop = lazy(() =>
  retryDynamicImport(() =>
    import('./pages/Shop').then(module => ({ default: module.Shop })),
    {
      maxRetries: 3,
      baseDelay: 1000,
      onRetry: (attempt, error) => {
        console.warn(`Retrying Shop import (attempt ${attempt}):`, error.message);
      },
    }
  )
);

const ProductDetail = lazy(() =>
  retryDynamicImport(() =>
    import('./pages/ProductDetail').then(module => ({ default: module.ProductDetail })),
    {
      maxRetries: 3,
      baseDelay: 1000,
    }
  )
);

const Cart = lazy(() =>
  retryDynamicImport(() =>
    import('./pages/Cart').then(module => ({ default: module.Cart })),
    {
      maxRetries: 3,
      baseDelay: 1000,
    }
  )
);

const Checkout = lazy(() =>
  retryDynamicImport(() =>
    import('./pages/Checkout').then(module => ({ default: module.Checkout })),
    {
      maxRetries: 3,
      baseDelay: 1000,
    }
  )
);

const Login = lazy(() =>
  retryDynamicImport(() =>
    import('./pages/Login').then(module => ({ default: module.Login })),
    {
      maxRetries: 3,
      baseDelay: 1000,
    }
  )
);

const Account = lazy(() =>
  retryDynamicImport(() =>
    import('./pages/Account').then(module => ({ default: module.Account })),
    {
      maxRetries: 3,
      baseDelay: 1000,
    }
  )
);

const About = lazy(() =>
  retryDynamicImport(() =>
    import('./pages/About').then(module => ({ default: module.About })),
    {
      maxRetries: 3,
      baseDelay: 1000,
    }
  )
);

const NotFound = lazy(() =>
  retryDynamicImport(() =>
    import('./pages/NotFound').then(module => ({ default: module.NotFound })),
    {
      maxRetries: 3,
      baseDelay: 1000,
    }
  )
);

const Admin = lazy(() =>
  retryDynamicImport(() =>
    import('./pages/Admin').then(module => ({ default: module.Admin })),
    {
      maxRetries: 3,
      baseDelay: 1000,
    }
  )
);

const OrderTracker = lazy(() =>
  retryDynamicImport(() =>
    import('./pages/OrderTracker').then(module => ({ default: module.OrderTracker })),
    {
      maxRetries: 3,
      baseDelay: 1000,
    }
  )
);

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    errorElement: <ErrorPage />,
    children: [
      { index: true, Component: Home },
      { path: 'shop', Component: Shop },
      { path: 'product/:id', Component: ProductDetail },
      { path: 'cart', Component: Cart },
      { path: 'checkout', Component: Checkout },
      { path: 'login', Component: Login },
      { path: 'account', Component: Account },
      { path: 'admin', Component: Admin },
      { path: 'about', Component: About },
      // Order tracker — /track (list/lookup) and /track/:id (direct reference link)
      { path: 'track', Component: OrderTracker },
      { path: 'track/:id', Component: OrderTracker },
      { path: '*', Component: NotFound },
    ],
  },
]);
