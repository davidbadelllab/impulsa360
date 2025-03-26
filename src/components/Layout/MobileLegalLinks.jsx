import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Shield, Lock, Gavel } from 'lucide-react';

const MobileLegalLinks = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  // Colores modernos con gradientes
  const bgColor = isDark 
    ? 'bg-gradient-to-b from-gray-800 to-gray-900' 
    : 'bg-gradient-to-b from-white to-gray-100';
  
  const accentColor = isDark
    ? 'from-purple-600 to-blue-700'
    : 'from-blue-500 to-purple-600';

  const hoverEffect = isDark
    ? 'hover:bg-gray-700/50'
    : 'hover:bg-gray-200/50';

  const textColor = isDark ? 'text-gray-100' : 'text-gray-800';
  const iconColor = isDark ? '#e0e0e0' : '#333333';
  
  return (
    <div className="md:hidden fixed right-0 top-1/2 transform -translate-y-1/2 z-40">
      <AnimatePresence>
        {isExpanded ? (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`${bgColor} shadow-lg rounded-l-xl overflow-hidden border-l-4 border-${isDark ? 'purple-700' : 'blue-500'}`}
          >
            <div className="flex items-center p-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleExpand}
                className={`p-2 rounded-full ${isDark ? 'bg-gray-700/50' : 'bg-gray-200/50'}`}
              >
                <ChevronLeft size={20} color={iconColor} />
              </motion.button>
              <span className={`ml-2 font-medium ${textColor}`}>Legal</span>
            </div>
            
            <div className="flex flex-col space-y-1 p-2">
              {[
                { to: "/terms", label: "Términos", Icon: Shield },
                { to: "/privacy", label: "Privacidad", Icon: Lock },
                { to: "/legal", label: "Legal", Icon: Gavel }
              ].map((item, index) => (
                <motion.div
                  key={item.to}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={item.to}
                    className={`flex items-center px-4 py-3 rounded-lg ${textColor} ${hoverEffect} transition-all duration-300`}
                  >
                    <item.Icon size={16} className="mr-2" color={iconColor} />
                    <span>{item.label}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleExpand}
            className={`bg-gradient-to-r ${accentColor} p-3 rounded-l-lg shadow-lg text-white flex items-center justify-center`}
          >
            <Gavel size={20} color="white" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileLegalLinks;
