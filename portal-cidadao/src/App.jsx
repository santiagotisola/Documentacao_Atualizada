import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/common/Layout'
import Home from './pages/Home'
import Resultados from './pages/Resultados'
import Contestacao from './pages/Contestacao'
import Login from './pages/Login'
import MeusProcessos from './pages/MeusProcessos'
import NotFound from './pages/NotFound'
import PrivateRoute from './components/common/PrivateRoute'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Rotas Públicas */}
        <Route index element={<Home />} />
        <Route path="resultados" element={<Resultados />} />
        <Route path="login" element={<Login />} />
        
        {/* Rotas Privadas (requerem autenticação) */}
        <Route
          path="contestacao/:infracaoId"
          element={
            <PrivateRoute>
              <Contestacao />
            </PrivateRoute>
          }
        />
        <Route
          path="meus-processos"
          element={
            <PrivateRoute>
              <MeusProcessos />
            </PrivateRoute>
          }
        />
        
        {/* 404 */}
        <Route path="404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  )
}

export default App
