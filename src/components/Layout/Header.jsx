import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronDown, ArrowRight, ExternalLink } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import BookingModal from '../BookingModal';

const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');
  const [isHovering, setIsHovering] = useState(null);
  const headerRef = useRef(null);
  const prevScrollY = useRef(0);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > prevScrollY.current + 20 && currentScrollY > 100) {
        setHeaderVisible(false);
      } else if (currentScrollY < prevScrollY.current - 5 || currentScrollY < 50) {
        setHeaderVisible(true);
      }
      
      prevScrollY.current = currentScrollY;
      
      if (currentScrollY > 30) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { id: 'hero', label: 'Inicio', icon: 'home', path: '/' },
    { id: 'services', label: 'Servicios', icon: 'services', path: '/services' },
    { id: 'systems', label: 'Sistemas', icon: 'systems', path: '/systems' },
    { id: 'success-cases', label: 'Casos de Éxito', icon: 'cases', path: '/success-cases' },
    { id: 'blog', label: 'Blog', icon: 'blog', path: '/blog' },
    { id: 'contact', label: 'Contacto', icon: 'contact', path: '/contact' }
  ];

  useEffect(() => {
    const currentPath = window.location.pathname;
    const currentItem = navItems.find(item => item.path === currentPath);
    if (currentItem) {
      setActiveSection(currentItem.id);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);

  const handleNavigation = (e, itemId, itemPath) => {
    e.preventDefault();
    setActiveSection(itemId);
    navigate(itemPath);
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  return (
    <>
      <header 
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-500 ${
          scrolled 
            ? 'bg-white/90 backdrop-blur-lg shadow-lg shadow-blue-900/5 py-2' 
            : 'bg-transparent py-4'
        } ${
          headerVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <nav className="flex justify-between items-center">
            <Link to="/" className="relative group cursor-pointer">
              <img 
                src={scrolled ? "/img/ImpulsaColor2.png" : "/img/LogoImpulsa.png"}
                alt="Impulsa360 Logo" 
                className="h-12 relative z-10 transition-all duration-500 group-hover:scale-110" 
              />
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-lg opacity-0 group-hover:opacity-30 blur-lg transition-all duration-500 group-hover:duration-200 animate-gradient-x"></div>
            </Link>
            
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map(item => (
                <a 
                  key={item.id}
                  href={item.path}
                  className="relative px-3 py-2 group"
                  onMouseEnter={() => setIsHovering(item.id)}
                  onMouseLeave={() => setIsHovering(null)}
                  onClick={(e) => handleNavigation(e, item.id, item.path)}
                >
                  <span 
                    className={`relative z-10 text-sm font-medium transition-all duration-300 ${
                      activeSection === item.id
                        ? 'text-white'
                        : 'text-gray-700 group-hover:text-blue-600'
                    }`}
                  >
                    {item.label}
                  </span>
                  
                  <span 
                    className={`absolute inset-0 rounded-full transition-all duration-300 ease-out ${
                      activeSection === item.id
                        ? 'bg-gradient-to-r from-blue-600 to-blue-800 opacity-100'
                        : 'bg-blue-50 opacity-0 group-hover:opacity-100'
                    }`}
                  ></span>
                  
                  <span 
                    className={`absolute bottom-0 left-0 h-0.5 bg-blue-600 transition-all duration-300 ${
                      isHovering === item.id || activeSection === item.id
                        ? 'w-full'
                        : 'w-0'
                    }`}
                  ></span>
                </a>
              ))}
            </div>
            
            <div className="hidden md:block">
              <button 
                className="relative overflow-hidden group bg-gradient-to-r from-blue-600 via-purple-700 to-blue-800 text-white px-6 py-2.5 rounded-full font-medium transition-all duration-300"
                onClick={() => setShowBookingModal(true)}
              >
                <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-600 via-blue-700 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-size-200 animate-gradient-x"></span>
                
                <span className="relative z-10 flex items-center text-sm">
                  Agendar consulta 
                  <ArrowRight className="h-4 w-4 ml-1.5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
                
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 blur-sm transform -skew-x-12 group-hover:animate-shine"></span>
              </button>
            </div>
            
            <button 
              className="lg:hidden relative overflow-hidden rounded-full p-2.5 hover:bg-gray-100 transition-colors group"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <div className="h-6 w-6 relative">
                <span className={`absolute h-0.5 w-6 bg-gray-700 group-hover:bg-blue-600 transform transition-all duration-300 ease-in-out ${isMenuOpen ? 'rotate-45 translate-y-2.5' : '-translate-y-1'}`}></span>
                <span className={`absolute h-0.5 w-6 bg-gray-700 group-hover:bg-blue-600 transform transition-all duration-300 ease-in-out ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`absolute h-0.5 w-6 bg-gray-700 group-hover:bg-blue-600 transform transition-all duration-300 ease-in-out ${isMenuOpen ? '-rotate-45 -translate-y-0.5' : 'translate-y-3'}`}></span>
              </div>
            </button>
          </nav>
        </div>
        
        <div 
          className={`lg:hidden fixed top-0 right-0 h-screen w-full bg-white z-40
            transform transition-all duration-500 ease-in-out
            ${isMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
          `}
          style={{
            clipPath: isMenuOpen 
              ? 'circle(150% at 100% 0)' 
              : 'circle(0% at 100% 0)'
          }}
        >
          <div className="pt-20 h-full overflow-y-auto">
            <div className="flex flex-col space-y-1 p-6">
              {navItems.map(item => (
                <a
                  key={item.id}
                  href={item.path}
                  className={`group px-4 py-3.5 rounded-lg transition-all duration-300 flex items-center ${
                    activeSection === item.id
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveSection(item.id);
                    setIsMenuOpen(false);
                    setTimeout(() => {
                      handleNavigation(e, item.id, item.path);
                    }, 300);
                  }}
                >
                  <span className="text-lg font-medium">{item.label}</span>
                  <ArrowRight className={`ml-auto h-5 w-5 transition-transform duration-300 ${activeSection === item.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'} ${activeSection === item.id ? 'translate-x-0' : '-translate-x-2 group-hover:translate-x-0'}`} />
                </a>
              ))}
              
              <div className="pt-6">
                <button 
                  className="w-full relative overflow-hidden group bg-gradient-to-r from-blue-600 to-purple-700 text-white px-6 py-4 rounded-xl font-medium shadow-lg shadow-blue-600/10 transition-all duration-300"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setShowBookingModal(true);
                  }}
                >
                  <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative z-10 flex items-center justify-center text-base">
                    Agendar consulta ahora
                    <ExternalLink className="h-5 w-5 ml-2 transition-transform duration-300 group-hover:rotate-12" />
                  </span>
                  
                  <span className="absolute inset-0 w-8 h-full bg-white opacity-0 group-hover:opacity-30 blur-md transform -skew-x-12 group-hover:animate-shine"></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <BookingModal 
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
      />
    </>
  );
};

const GlobalStyles = () => {
  return (
    <style jsx global>{`
      @keyframes shine {
        from {
          left: -100%;
        }
        to {
          left: 100%;
        }
      }
      
      @keyframes gradient-x {
        0% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
        100% {
          background-position: 0% 50%;
        }
      }
      
      .animate-shine {
        animation: shine 1.2s ease-in-out infinite;
      }
      
      .animate-gradient-x {
        animation: gradient-x 3s ease infinite;
      }
      
      .bg-size-200 {
        background-size: 200% 200%;
      }
    `}</style>
  );
};

const HeaderWithStyles = () => (
  <>
    <GlobalStyles />
    <Header />
  </>
);

export default Header;
