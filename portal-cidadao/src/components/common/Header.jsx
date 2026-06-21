import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, User, FileText, LogOut, LogIn } from 'lucide-react'
import { useState } from 'react'
import { isAuthenticated, getUser, logout } from '@services/api'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const authenticated = isAuthenticated()
  const user = getUser()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold text-gray-900">Portal do Cidadão</span>
              <p className="text-xs text-gray-500">Powered by Axion</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'text-primary-600' 
                  : 'text-gray-700 hover:text-primary-600'
              }`}
            >
              Consultar Infrações
            </Link>
            
            {authenticated ? (
              <>
                <Link
                  to="/meus-processos"
                  className={`text-sm font-medium transition-colors flex items-center space-x-1 ${
                    isActive('/meus-processos') 
                      ? 'text-primary-600' 
                      : 'text-gray-700 hover:text-primary-600'
                  }`}
                >
                  <FileText size={16} />
                  <span>Meus Processos</span>
                </Link>
                
                <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
                  <div className="flex items-center space-x-2">
                    <User size={18} className="text-gray-600" />
                    <span className="text-sm text-gray-700">{user?.nome || 'Usuário'}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="btn btn-secondary btn-sm flex items-center space-x-1"
                  >
                    <LogOut size={16} />
                    <span>Sair</span>
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="btn btn-primary flex items-center space-x-2"
              >
                <LogIn size={16} />
                <span>Entrar</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-slide-down">
            <div className="flex flex-col space-y-3">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive('/') 
                    ? 'bg-primary-50 text-primary-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Consultar Infrações
              </Link>
              
              {authenticated ? (
                <>
                  <Link
                    to="/meus-processos"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 ${
                      isActive('/meus-processos') 
                        ? 'bg-primary-50 text-primary-600' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <FileText size={16} />
                    <span>Meus Processos</span>
                  </Link>
                  
                  <div className="px-3 py-2 border-t border-gray-100 mt-2 pt-3">
                    <p className="text-sm text-gray-600 mb-2">
                      Olá, <span className="font-medium">{user?.nome || 'Usuário'}</span>
                    </p>
                    <button
                      onClick={() => {
                        handleLogout()
                        setMobileMenuOpen(false)
                      }}
                      className="btn btn-secondary w-full flex items-center justify-center space-x-2"
                    >
                      <LogOut size={16} />
                      <span>Sair</span>
                    </button>
                  </div>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-primary w-full flex items-center justify-center space-x-2"
                >
                  <LogIn size={16} />
                  <span>Entrar</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
