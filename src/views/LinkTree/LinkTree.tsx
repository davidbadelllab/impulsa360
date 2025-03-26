import React, { useState, useEffect } from 'react';
import { Instagram, Youtube, Linkedin, Video, Globe, Twitter, Sun, Moon, Share2 } from 'lucide-react';

const LinkTree = () => {
  const [theme, setTheme] = useState('dark');
  const [mounted, setMounted] = useState(false);
  const isDark = theme === 'dark';
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const socialLinks = [
    {
      name: "Instagram",
      url: "https://www.instagram.com/impulsa360agency",
      icon: <Instagram className="h-6 w-6" />,
      gradient: "from-pink-500 via-purple-500 to-orange-500"
    },
    {
      name: "Pinterest",
      url: "https://pinterest.com/impulsa360agency",
      icon: <Share2 className="h-6 w-6" />,
      gradient: "from-red-500 via-red-600 to-red-700"
    },
    {
      name: "YouTube",
      url: "https://www.youtube.com/@impulsa360agency",
      icon: <Youtube className="h-6 w-6" />,
      gradient: "from-red-600 via-red-500 to-red-600"
    },
    {
      name: "TikTok",
      url: "https://www.tiktok.com/@impulsa360agency",
      icon: <Video className="h-6 w-6" />,
      gradient: "from-black via-gray-800 to-black"
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/impulsa360agency",
      icon: <Linkedin className="h-6 w-6" />,
      gradient: "from-blue-600 via-blue-500 to-blue-600"
    },
    {
      name: "Twitter/X",
      url: "https://x.com/impulsa360agenc",
      icon: <Twitter className="h-6 w-6" />,
      gradient: "from-gray-900 via-gray-800 to-gray-900"
    }
  ];

  if (!mounted) return null;

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-500 ${
      isDark ? 'bg-gradient-to-br from-gray-900 via-black to-gray-800' : 'bg-gradient-to-br from-white via-gray-50 to-gray-100'
    }`}>
      <div className="w-full max-w-md relative">
        {/* Animated Background Blur Effect */}
        <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl opacity-20 blur-xl animate-pulse"></div>
        
        <div className={`relative backdrop-blur-sm rounded-xl p-8 ${
          isDark ? 'bg-gray-900/60' : 'bg-white/60'
        }`}>
          {/* Header with Logo and Theme Toggle */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center group relative">
            <img 
                src={isDark ? "/img/LogoImpulsa.png" : "/img/ImpulsaColor2.png"} 
                alt="Logo" 
                className="h-12 transition-transform duration-300 transform group-hover:scale-105"
              />
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-lg opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500"></div>
            </div>
            
            <button
              onClick={toggleTheme}
              className={`p-3 rounded-full transition-all duration-300 transform hover:scale-110 ${
                isDark 
                  ? 'bg-gray-800 text-yellow-400 hover:text-yellow-300' 
                  : 'bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
              aria-label="Toggle theme"
            >
              {isDark ? 
                <Sun className="h-5 w-5" /> : 
                <Moon className="h-5 w-5" />
              }
            </button>
          </div>
          
          {/* Title with Gradient */}
          <h1 className={`text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent transform hover:scale-105 transition-transform duration-300`}>
            Impulsa360 Agency
          </h1>
          
          {/* Social Links */}
          <div className="space-y-4">
            {socialLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex items-center gap-3 w-full p-4 rounded-xl transition-all duration-500 transform hover:-translate-y-1 ${
                  isDark 
                    ? 'bg-gray-800/50 hover:bg-gradient-to-r hover:shadow-xl hover:shadow-blue-700/20' 
                    : 'bg-gray-100/50 hover:bg-gradient-to-r hover:shadow-xl hover:shadow-blue-500/20'
                } ${link.gradient} ${isDark ? 'text-white' : 'text-gray-900'}`}
              >
                <div className={`transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-6 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {link.icon}
                </div>
                <span className="font-medium transform transition-all duration-300 group-hover:translate-x-1">
                  {link.name}
                </span>
              </a>
            ))}
          </div>
          
          {/* Website CTA */}
          <div className="mt-12 text-center">
            <h2 className={`text-xl font-medium mb-6 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Sumérgete en nuestro sitio web
            </h2>
            
            <a
              href="/"
              className={`group inline-flex items-center gap-3 px-8 py-4 rounded-xl transition-all duration-500 transform hover:scale-105 ${
                isDark 
                  ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:shadow-xl hover:shadow-purple-700/30' 
                  : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:shadow-xl hover:shadow-purple-500/30'
              } text-white`}
            >
              <Globe className="h-5 w-5 transform transition-transform duration-300 group-hover:rotate-12" />
              <span className="font-medium">Visitar sitio web</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkTree;