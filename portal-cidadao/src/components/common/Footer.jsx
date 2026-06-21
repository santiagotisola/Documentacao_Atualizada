import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sobre */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Portal do Cidadão</h3>
            <p className="text-sm text-gray-400 mb-4">
              Consulte e conteste infrações de trânsito de forma rápida e segura. 
              Plataforma oficial para acesso aos seus dados.
            </p>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center">
                <span className="text-white font-bold">A</span>
              </div>
              <span className="text-xs text-gray-500">Powered by Axion Tecnologia</span>
            </div>
          </div>

          {/* Links Úteis */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Links Úteis</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Consultar Infrações
                </Link>
              </li>
              <li>
                <Link to="/meus-processos" className="hover:text-white transition-colors">
                  Meus Processos
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Como Contestar
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Perguntas Frequentes
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Política de Privacidade
                </a>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Contato</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-3">
                <Mail size={18} className="text-primary-500 mt-0.5 flex-shrink-0" />
                <a href="mailto:contato@axion.com.br" className="hover:text-white transition-colors">
                  contato@axion.com.br
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <Phone size={18} className="text-primary-500 mt-0.5 flex-shrink-0" />
                <a href="tel:+5581999999999" className="hover:text-white transition-colors">
                  (81) 99999-9999
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="text-primary-500 mt-0.5 flex-shrink-0" />
                <span>
                  Recife, PE - Brasil
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-500">
            © {currentYear} Axion Tecnologia. Todos os direitos reservados.
          </p>
          <p className="text-xs text-gray-600 mt-2">
            LGPD Compliant | Dados protegidos por criptografia AES-256
          </p>
        </div>
      </div>
    </footer>
  )
}
