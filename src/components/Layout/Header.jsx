import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import BookingModal from '../BookingModal';
import MenuMovil from '../MenuMovil';

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
            
            <div className="lg:hidden">
              <MenuMovil />
            </div>
          </nav>
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
