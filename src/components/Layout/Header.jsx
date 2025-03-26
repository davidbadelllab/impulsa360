import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage, LanguageSwitcher } from '../../context/LanguageContext';
import axios from 'axios';
import BookingModal from '../BookingModal';
import MobileLegalLinks from './MobileLegalLinks';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { Sun, Moon } from 'lucide-react';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('http://localhost:3001/api/user', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setIsAuthenticated(true);
          setUser(response.data);
        } catch (error) {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    };

    checkAuth();

    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
  };

  return (
    <>
      {/* Header para desktop */}
      <header className={`hidden md:flex fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? isDark 
            ? 'bg-gray-900/90 backdrop-blur-lg shadow-lg py-2' 
            : 'bg-white/90 backdrop-blur-lg shadow-lg py-2'
          : 'bg-transparent py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center group relative mr-8">
              <img 
                src={isDark ? "/img/LogoImpulsa.png" : "/img/ImpulsaColor2.png"} 
                alt="Logo" 
                className="h-12 transition-transform duration-300 transform group-hover:scale-105"
              />
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-lg opacity-0 group-hover:opacity-20 blur-lg transition-all duration-500"></div>
            </Link>

            {/* Navegación Principal */}
            <nav className="hidden md:flex items-center space-x-7">
              {[
                { path: '/', labelEs: 'Inicio', labelEn: 'Home' },
                { path: '/services', labelEs: 'Servicios', labelEn: 'Services' },
                { path: '/blog', labelEs: 'Blog', labelEn: 'Blog' },
                { path: '/success-cases', labelEs: 'Exito', labelEn: 'Success Cases' },
                { path: '/about', labelEs: 'About Us', labelEn: 'About Us' },
                { path: '/faq', labelEs: 'FAQ', labelEn: 'FAQ' },
                { path: '/contact', labelEs: 'Contact', labelEn: 'Contact' }
              ].map((item) => (
                <Link 
                  key={item.path}
                  to={item.path} 
                  className={`relative group ${
                    isDark ? 'text-gray-300' : 'text-gray-900'
                  } transition-colors duration-300`}
                >
                  <span className={`relative z-10 ${
                    isDark ? 'group-hover:text-white' : 'group-hover:text-blue-600'
                  }`}>
                    {language === 'es' ? item.labelEs : item.labelEn}
                  </span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
            </nav>

            {/* Botones y Controles */}
            <div className="flex items-center space-x-8">
              {/* Botón de Agenda */}
              <button
                onClick={() => setShowBookingModal(true)}
                className={`group relative bg-slate-900 h-12 w-48 border-2 border-teal-600 text-white text-base font-bold rounded-xl overflow-hidden transform transition-all duration-500 hover:scale-105 hover:border-emerald-400 hover:text-emerald-300 px-4 flex items-center gap-2 before:absolute before:w-8 before:h-8 before:content[''] before:right-1 before:top-1 before:z-10 before:bg-indigo-500 before:rounded-full before:blur-lg before:transition-all before:duration-500 after:absolute after:z-10 after:w-12 after:h-12 after:content[''] after:bg-teal-400 after:right-3 after:top-2 after:rounded-full after:blur-lg after:transition-all after:duration-500 hover:before:right-8 hover:before:-bottom-2 hover:before:blur hover:after:-right-3 hover:after:scale-110 ${
                  isDark ? '' : 'bg-slate-800'
                }`}
              >
                <CalendarIcon className="h-5 w-5 z-20" />
                <span className="z-20">{language === 'es' ? 'Agenda' : 'Book'}</span>
              </button>

              {/* Selector de Idioma */}
              <LanguageSwitcher 
                className={`${
                  isDark 
                    ? 'bg-gray-800 text-white border-gray-700' 
                    : 'bg-white text-gray-900 border-gray-200'
                } border rounded-lg px-3 py-2 transition-colors duration-300`}
              />

              {/* Botón de Tema */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  isDark 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {/* Autenticación */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className={`font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    {user?.username}
                  </span>
                  <button
                    onClick={handleLogout}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                      isDark 
                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-700/30' 
                        : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30'
                    }`}
                  >
                    {language === 'es' ? 'Cerrar sesión' : 'Logout'}
                  </button>
                </div>
              ) : (
                <Link to="/login" className="relative inline-flex items-center justify-center gap-4 group">
                  <div
                    className="absolute inset-0 duration-1000 opacity-60 transition-all bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-400 rounded-xl blur-lg filter group-hover:opacity-100 group-hover:duration-200"
                  ></div>
                  <div
                    className="group relative inline-flex items-center justify-center text-base rounded-xl bg-gray-900 px-8 py-3 font-semibold text-white transition-all duration-200 hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 hover:shadow-gray-600/30"
                  >
                    Iniciar sesión
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 10 10"
                      height="10"
                      width="10"
                      fill="none"
                      className="mt-0.5 ml-2 -mr-1 stroke-white stroke-2"
                    >
                      <path
                        d="M0 5h7"
                        className="transition opacity-0 group-hover:opacity-100"
                      ></path>
                      <path
                        d="M1 1l4 4-4 4"
                        className="transition group-hover:translate-x-[3px]"
                      ></path>
                    </svg>
                  </div>
                </Link>
              )}





            </div>
          </div>
        </div>
      </header>

      {/* Logo para móvil */}
      <div className={`md:hidden fixed top-4 left-0 right-0 z-50 flex justify-center transition-opacity duration-300 ${
        scrolled ? 'opacity-0' : 'opacity-100'
      }`}>
        <Link to="/" className="flex items-center">
          <img 
            src={isDark ? "/img/LogoImpulsa.png" : "/img/ImpulsaColor2.png"} 
            alt="Logo" 
            className="h-20"
          />
        </Link>
      </div>

      <MobileLegalLinks />
      <BookingModal 
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
      />
    </>
  );
};

export default Header;
