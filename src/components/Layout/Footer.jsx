import React, { useState } from 'react';
import { MapPin, Phone, Mail, ArrowUpRight, Facebook, Instagram, Linkedin, Twitter, ChevronRight, Globe, Award, Shield } from 'lucide-react';
import BookingModal from '../BookingModal';

const Footer = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <>
      <footer className="relative bg-gradient-to-b from-blue-950 to-black overflow-hidden pt-20 pb-8">
      {/* Elementos decorativos */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-blue-900/10 to-transparent"></div>
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600 rounded-full filter blur-3xl opacity-10"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-600 rounded-full filter blur-3xl opacity-10"></div>
      
      {/* Patrón de fondo */}
      <div className="absolute inset-0 bg-grid-white/[0.02]" style={{
        backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
        backgroundSize: '20px 20px'
      }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        {/* Sección superior con logo y descripción */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          {/* Columna de logo y descripción */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center space-x-3">
              <img src="/img/LogoImpulsa.png" alt="Impulsa360 Logo" className="h-12" />
              <div className="h-6 w-px bg-gradient-to-b from-blue-500 to-indigo-600"></div>
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">DIGITAL AGENCY</span>
            </div>
            
            <p className="text-gray-300 text-lg max-w-md">
              Transformamos negocios ordinarios en líderes digitales mediante estrategias disruptivas y tecnología de vanguardia.
            </p>
            
            <div className="flex flex-wrap gap-4 mt-6">
              <div className="inline-flex items-center bg-blue-900/20 border border-blue-800/30 rounded-lg px-4 py-2 text-blue-300">
                <Globe size={16} className="mr-2" />
                <span>Presencia global</span>
              </div>
              <div className="inline-flex items-center bg-indigo-900/20 border border-indigo-800/30 rounded-lg px-4 py-2 text-indigo-300">
                <Award size={16} className="mr-2" />
                <span>Premiados 2024</span>
              </div>
              <div className="inline-flex items-center bg-purple-900/20 border border-purple-800/30 rounded-lg px-4 py-2 text-purple-300">
                <Shield size={16} className="mr-2" />
                <span>ISO 27001</span>
              </div>
            </div>
          </div>
          
          {/* Columna para newsletter y suscripción */}
          <div className="lg:col-span-3">
            <h3 className="text-xl font-bold mb-6 text-white">
              <span className="border-b-2 border-blue-500 pb-1">Contacto</span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-blue-400 mt-1 mr-3 flex-shrink-0" />
                <p className="text-gray-300">Maracaibo, Venezuela <br/>Edificio Millenium, Torre A, Piso 5</p>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" />
                <p className="text-gray-300">+58 (424) 631-2483</p>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" />
                <p className="text-gray-300">impulsa360agency@gmail.com</p>
              </div>
            </div>
          </div>
          
          {/* Columna para enlaces rápidos */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold mb-6 text-white">
              <span className="border-b-2 border-blue-500 pb-1">Enlaces</span>
            </h3>
            <ul className="space-y-3">
              {[
                { label: 'Inicio', path: '/' },
                { label: 'Servicios', path: '/services' },
                { label: 'Casos de éxito', path: '/success-cases' },
                { label: 'Blog', path: '/blog' },
                { label: 'Contacto', path: '/contact' }
              ].map((item, index) => (
                <li key={index}>
                  <a href={item.path} className="text-gray-300 hover:text-blue-400 transition-colors duration-300 flex items-center group">
                    <ChevronRight size={16} className="mr-2 text-blue-500 transform group-hover:translate-x-1 transition-transform" />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Columna para redes sociales */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold mb-6 text-white">
              <span className="border-b-2 border-blue-500 pb-1">Conéctate</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <a href="#" className="flex items-center space-x-2 bg-gray-800/50 hover:bg-blue-900/30 p-3 rounded-lg transition-colors group border border-gray-700/50 hover:border-blue-700/50">
                <img src="/img/threads_dark.svg" alt="" />
              </a>
              <a href="https://www.instagram.com/impulsa360agency/?utm_source=ig_web_button_share_sheet" className="flex items-center space-x-2 bg-gray-800/50 hover:bg-purple-900/30 p-3 rounded-lg transition-colors group border border-gray-700/50 hover:border-purple-700/50">
              <img src="/img/instagram_dark.svg" alt="" />
              </a>
            </div>
            
            <div className="mt-8">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 p-4 rounded-lg text-white font-medium transition-all group w-full justify-center"
              >
                <span>Consulta</span>
                <ArrowUpRight size={18} className="transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Línea divisoria con gradiente */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
        
        {/* Copyright y políticas */}
        <div className="py-6 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
          <div>
            &copy; {new Date().getFullYear()} Impulsa360. Todos los derechos reservados
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-blue-400 transition-colors">Términos de servicio</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Política de privacidad</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Aviso legal</a>
          </div>
        </div>
      </div>
      </footer>
      
      <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default Footer;
