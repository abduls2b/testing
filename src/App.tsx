import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LiveTV from './pages/LiveTV';
import ChannelPage from './pages/ChannelPage';
import CategoryPage from './pages/CategoryPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LiveTV />} />
        <Route path="/channel/:id" element={<ChannelPage />} />
        <Route path="/:category" element={<CategoryPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
