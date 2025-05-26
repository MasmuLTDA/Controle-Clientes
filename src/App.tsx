import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GlobalStyle } from './styles/GlobalStyle';
import HomePage from './pages/home/HomePage';
import LojaFisicaPage from './pages/loja-fisica/LojaFisicaPage';
import WhatsappPage from './pages/whatsapp/WhatsappPage';
import CaixaPage from './pages/caixa/CaixaPage';
import AdminPage from './pages/admin/AdminPage';

function App() {
  return (
    <Router>
      <GlobalStyle />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/loja-fisica" element={<LojaFisicaPage />} />
        <Route path="/whatsapp" element={<WhatsappPage />} />
        <Route path="/caixa" element={<CaixaPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
