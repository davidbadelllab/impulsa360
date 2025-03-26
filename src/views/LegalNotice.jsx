import React from 'react';
import { Building2, Copyright, AlertTriangle, Link, Scale, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const LegalNotice = () => {
  const { theme } = useTheme();
  const sections = [
    {
      icon: Building2,
      title: "Identificación",
      content: [
        { label: "Nombre", value: "Impulsa360" },
        { label: "Contacto", value: "impulsa360agency@gmail.com" }
      ],
      gradient: "from-violet-600/20 via-indigo-600/20 to-blue-600/20"
    },
    {
      icon: Copyright,
      title: "Propiedad Intelectual",
      content: "Todo el contenido (textos, software, logos) es propiedad de Impulsa360 o licenciado. Prohibido su uso no autorizado.",
      gradient: "from-blue-600/20 via-cyan-600/20 to-teal-600/20"
    },
    {
      icon: AlertTriangle,
      title: "Exención de Garantías",
      content: "Los servicios se ofrecen . No garantizamos resultados específicos.",
      gradient: "from-amber-600/20 via-orange-600/20 to-red-600/20"
    },
    {
      icon: Link,
      title: "Enlaces Externos",
      content: "No nos hacemos responsables por contenidos en sitios web vinculados.",
      gradient: "from-emerald-600/20 via-teal-600/20 to-cyan-600/20"
    },
    {
      icon: Scale,
      title: "Jurisdicción",
      content: "Cualquier disputa se resolverá en los tribunales de [ciudad/país aplicable].",
      gradient: "from-purple-600/20 via-pink-600/20 to-rose-600/20"
    }
  ];

  return (
    <div className={`min-h-screen pt-24 pb-24 ${
      theme === 'dark' 
        ? 'bg-[#0A0F1E] text-gray-100' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      {theme === 'dark' && (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#1A103D,transparent_50%)] opacity-50"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,#1E293B,transparent_50%)] opacity-50"></div>
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        </>
      )}

      <main className="relative container mx-auto px-4 py-16">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg blur opacity-30"></div>
              <h1 className="relative px-8 py-4 bg-[#0A0F1E] rounded-lg text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-400">
                Aviso Legal
              </h1>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`mt-6 flex justify-center items-center gap-2 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>impulsa360agency@gmail.com</span>
          </motion.div>
        </motion.div>

        {/* Content Sections */}
        <div className="grid gap-8">
          {sections.map((section, index) => (
            <motion.section
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${section.gradient} rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300`}></div>
              
              <div className={`relative overflow-hidden backdrop-blur-sm rounded-2xl p-8 transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-[#111827]/40 border border-gray-700/50 hover:border-gray-600/50'
                  : 'bg-white/80 border border-gray-200/80 hover:border-gray-300/80'
              }`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-lg blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                    <section.icon className="relative w-8 h-8 text-indigo-400" />
                  </div>
                  <h2 className="text-2xl font-semibold">{section.title}</h2>
                </div>

                {Array.isArray(section.content) ? (
                  <div className="space-y-4 ml-4">
                    {section.content.map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-indigo-400 font-medium">{item.label}:</span>
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`leading-relaxed ml-4 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>{section.content}</p>
                )}

                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-600/5 to-violet-600/5 rounded-bl-full"></div>
              </div>
            </motion.section>
          ))}
        </div>

        {/* Footer Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className={`mt-12 text-center text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}
        >
        
          <p className="mt-2">Este aviso legal fue actualizado por última vez en Marzo 2025</p>
        </motion.div>
      </main>
    </div>
  );
};

export default LegalNotice;
