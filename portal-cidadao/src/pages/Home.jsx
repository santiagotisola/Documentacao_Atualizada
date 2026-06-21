import { useState } from 'react'
import { Search, FileText, Shield, MessageCircle } from 'lucide-react'
import FormConsulta from '@components/consulta/FormConsulta'

export default function Home() {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
              Portal do Cidadão
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 animate-slide-up">
              Consulte e conteste infrações de trânsito de forma rápida e segura
            </p>
            
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-3 inline-flex items-center space-x-2 animate-slide-up"
              >
                <Search size={20} />
                <span>Consultar Agora</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Formulário de Consulta */}
      {showForm && (
        <section className="py-12 animate-slide-down">
          <div className="container-custom">
            <FormConsulta />
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-center mb-12">Como funciona?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card text-center hover:shadow-medium transition-shadow">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">1. Consulte</h3>
              <p className="text-gray-600">
                Informe seu CPF ou placa do veículo para consultar infrações pendentes
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card text-center hover:shadow-medium transition-shadow">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={32} className="text-success-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">2. Analise</h3>
              <p className="text-gray-600">
                Veja detalhes completos das infrações, incluindo fotos e documentos
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card text-center hover:shadow-medium transition-shadow">
              <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield size={32} className="text-warning-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">3. Conteste</h3>
              <p className="text-gray-600">
                Abra uma contestação online com documentos e acompanhe o processo
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Chat IA Feature */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={40} className="text-white" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold mb-2 text-gray-900">
                    Assistente Virtual com IA
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Tire suas dúvidas sobre infrações, processos e legislação com nosso 
                    assistente inteligente, disponível 24/7.
                  </p>
                  <div className="inline-flex items-center text-sm text-blue-700 font-medium">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                    Disponível agora
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Segurança e LGPD */}
      <section className="py-16 bg-white border-t border-gray-200">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <Shield size={48} className="text-primary-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4">Segurança e Privacidade</h3>
            <p className="text-gray-600 mb-6">
              Seus dados estão protegidos por criptografia de ponta a ponta. 
              Somos 100% conformes com a Lei Geral de Proteção de Dados (LGPD).
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="badge badge-info">🔒 Criptografia AES-256</span>
              <span className="badge badge-info">✅ LGPD Compliant</span>
              <span className="badge badge-info">🛡️ reCAPTCHA v3</span>
              <span className="badge badge-info">🔐 Autenticação JWT</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
