import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Funcionarios from './pages/Funcionarios'
import Gastos from './pages/Gastos'
import Orcamentos from './pages/Orcamentos'
import OrcamentoManual from './pages/OrcamentoManual'
import { ProtectedRoute } from './components/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/funcionarios" element={<ProtectedRoute><Funcionarios /></ProtectedRoute>} />
        <Route path="/gastos" element={<ProtectedRoute><Gastos /></ProtectedRoute>} />
        <Route path="/orcamentos" element={<ProtectedRoute><Orcamentos /></ProtectedRoute>} />
        <Route path="/orcamento-manual" element={<ProtectedRoute><OrcamentoManual /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  )
}