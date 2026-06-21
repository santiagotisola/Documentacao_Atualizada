import { Link } from 'react-router-dom'
import { Home, AlertCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="container-custom py-16">
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-24 h-24 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={48} className="text-danger-600" />
        </div>
        
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Página não encontrada
        </h2>
        <p className="text-gray-600 mb-8">
          A página que você está procurando não existe ou foi removida.
        </p>
        
        <Link
          to="/"
          className="btn btn-primary inline-flex items-center space-x-2"
        >
          <Home size={20} />
          <span>Voltar para Home</span>
        </Link>
      </div>
    </div>
  )
}
