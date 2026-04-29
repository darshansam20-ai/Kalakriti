/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { Collections } from './pages/Collections';
import { Wishlist } from './pages/Wishlist';
import { Orders } from './pages/Orders';
import { Addresses } from './pages/Addresses';
import { FAQ } from './pages/FAQ';
import { ContentPage } from './pages/ContentPage';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminReviews } from './pages/admin/AdminReviews';
import { AdminShipments } from './pages/admin/AdminShipments';
import { AdminFAQs } from './pages/admin/AdminFAQs';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminNewsletter } from './pages/admin/AdminNewsletter';
import { Checkout } from './pages/Checkout';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export default function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <CartProvider>
          <Router>
          <ScrollToTop />
          <Routes>
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="shipments" element={<AdminShipments />} />
              <Route path="faqs" element={<AdminFAQs />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="newsletter" element={<AdminNewsletter />} />
            </Route>

            {/* Public/Customer Routes */}
            <Route path="*" element={
              <div className="flex flex-col min-h-screen font-sans text-ink bg-bg selection:bg-gold/30">
                <Navbar />
                <CartDrawer />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/collections" element={<Collections />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/addresses" element={<Addresses />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/contact" element={<ContentPage type="contact" title="Contact Us" />} />
                    <Route path="/shipping-policy" element={<ContentPage type="shipping" title="Shipping Policy" />} />
                    <Route path="/returns-exchanges" element={<ContentPage type="returns" title="Returns & Exchanges" />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            } />
          </Routes>
        </Router>
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  );
}
