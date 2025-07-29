import React, { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Facebook,
  Instagram,
  MessageCircle,
  Video,
  X
} from 'lucide-react';

interface CampanasSubmenuProps {
  isVisible: boolean;
  onClose: () => void;
  isSidebarOpen: boolean;
}

const CampanasSubmenu: React.FC<CampanasSubmenuProps> = ({ isVisible, onClose, isSidebarOpen }) => {
  const submenuRef = useRef<HTMLDivElement>(null);

  // Cerrar submenú cuando se hace click fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (submenuRef.current && !submenuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClose]);

  const campanasItems = [
    { path: "/dashboard/campanas/facebook", icon: <Facebook />, label: "Facebook" },
    { path: "/dashboard/campanas/instagram", icon: <Instagram />, label: "Instagram" },
    { path: "/dashboard/campanas/whatsapp", icon: <MessageCircle />, label: "WhatsApp" },
    { path: "/dashboard/campanas/tiktok", icon: <Video />, label: "TikTok" },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={submenuRef}
          initial={{ opacity: 0, x: -20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={`fixed ${isSidebarOpen ? 'left-56' : 'left-20'} top-44 bg-gradient-to-br from-pink-800 via-rose-700 to-rose-600 rounded-xl shadow-2xl border border-pink-500/30 backdrop-blur-sm z-40 min-w-[220px]`}
          style={{ 
            transformOrigin: 'left center',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
          }}
        >
          {/* Header del submenú */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold text-sm tracking-wide">
                Campañas
              </h3>
              <button
                onClick={onClose}
                className="text-white/70 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                title="Cerrar menú"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Lista de opciones */}
          <div className="p-3 space-y-1">
            {campanasItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  group relative flex items-center px-3 py-2.5 rounded-lg transition-all duration-300
                  ${isActive 
                    ? "bg-gradient-to-r from-white/90 to-white/80 text-rose-800 font-medium shadow-lg border border-white/40" 
                    : "text-rose-100 hover:bg-white/10 border border-transparent"
                  }
                `}
                onClick={onClose}
              >
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="w-4 h-4 flex items-center justify-center"
                >
                  {item.icon}
                </motion.div>
                <motion.span
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  transition={{ duration: 0.2 }}
                  className="ml-3 text-sm font-medium tracking-wide"
                >
                  {item.label}
                </motion.span>
              </NavLink>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CampanasSubmenu; 