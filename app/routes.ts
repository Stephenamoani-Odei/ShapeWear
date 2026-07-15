import { createBrowserRouter } from 'react-router';
import { lazy } from 'react';

// Import Root component (not lazy loaded as it's the layout)
import { Root } from './pages/Root';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const Shop = lazy(() => import('./pages/Shop').then(module => ({ default: module.Shop })));
const ProductDetail = lazy(() => import('./pages/ProductDetail').then(module => ({ default: module.ProductDetail })));
const Cart = lazy(() => import('./pages/Cart').then(module => ({ default: module.Cart })));
const Checkout = lazy(() => import('./pages/Checkout').then(module => ({ default: module.Checkout })));
const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));
const Account = lazy(() => import('./pages/Account').then(module => ({ default: module.Account })));
const About = lazy(() => import('./pages/About').then(module => ({ default: module.About })));
const NotFound = lazy(() => import('./pages/NotFound').then(module => ({ default: module.NotFound })));
const Admin = lazy(() => import('./pages/Admin').then(module => ({ default: module.Admin })));

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
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
      { path: '*', Component: NotFound },
    ],
  },
]);
