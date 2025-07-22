import React, { useState, useEffect } from 'react';
import { Rocket, Server, Trophy, BookOpen, PhoneCall, Home, UserRound, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MenuMovil = () => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('hero');
  const [previousItem, setPreviousItem] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const menuItems = [
    { id: 'hero', icon: <Home size={24} />, path: '/' },
    { id: 'services', icon: <Rocket size={24} />,  path: '/services' },
    { id: 'systems', icon: <Server size={24} />,  path: '/systems' },
    { id: 'success-cases', icon: <Trophy size={24} />,  path: '/success-cases' },
    { id: 'blog', icon: <BookOpen size={24} />,  path: '/blog' },
    { id: 'contact', icon: <PhoneCall size={24} />,  path: '/contact' },
    { id: 'about', icon: <UserRound size={24} />,  path: '/about' },
    { id: 'faq', icon: <HelpCircle size={24} />,  path: '/faq' }
  ];



  const handleItemClick = (id, path) => {
    if (id !== activeItem && !isAnimating) {
      setPreviousItem(activeItem);
      setActiveItem(id);
      setIsAnimating(true);
      navigate(path);
    }
  };

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[70] bg-gradient-to-r from-indigo-900 via-purple-800 to-indigo-900 shadow-lg rounded-t-xl" style={{ transform: 'translateZ(0)' }}>
      {/* Blur effect backdrop for modern UI */}
      <div className="absolute inset-0 bg-black bg-opacity-20 backdrop-blur-sm rounded-t-xl z-0"></div>
      {/* Semi-transparent floating effect */}
      <div className="absolute bottom-full left-0 right-0 h-4 bg-gradient-to-t from-indigo-900/80 to-transparent"></div>
      
      <div className="relative z-10 flex justify-between items-center h-16 px-1 pb-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`relative flex flex-col items-center justify-center w-1/5 py-2 transition-all duration-300 ease-in-out
              ${activeItem === item.id ? 'transform -translate-y-3' : ''}`}
            onClick={() => handleItemClick(item.id, item.path)}
          >
            {/* Glow effect for active item */}
            {activeItem === item.id && (
              <div className="absolute -top-1 w-12 h-12 bg-white bg-opacity-20 rounded-full blur-md"></div>
            )}
            
            {/* Icon container with animations */}
            <div 
              className={`relative flex items-center justify-center mb-1 p-2 rounded-xl transition-all duration-300
                ${activeItem === item.id 
                  ? 'bg-white text-purple-900 shadow-lg shadow-purple-500/30 scale-110' 
                  : 'text-gray-300 hover:text-white'}`}
            >
              {item.icon}
              
              {/* Ripple effect on click */}
              {isAnimating && activeItem === item.id && (
                <span className="absolute inset-0 rounded-xl animate-ping bg-white bg-opacity-30"></span>
              )}
            </div>
            
            {/* Label with conditional rendering */}
            <span className={`text-xs font-medium transition-all duration-300
              ${activeItem === item.id 
                ? 'text-white font-bold' 
                : 'text-gray-300'}`}>
              {item.label}
            </span>
            
            {/* Active indicator line */}
            {activeItem === item.id && (
              <div className="absolute -bottom-1 w-10 h-1 bg-white rounded-full"></div>
            )}
          </button>
        ))}
      </div>
      
      {/* Semi-transparent floating effect */}
      <div className="absolute bottom-full left-0 right-0 h-4 bg-gradient-to-t from-indigo-900/80 to-transparent"></div>
    </div>
  );
};

export default MenuMovil;
