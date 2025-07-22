import React from 'react';
import { Shield, AlertCircle, Book, Settings, Scale, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const TermsOfService = () => {
  const { theme } = useTheme();
  const sections = [
    {
      icon: Shield,
      title: "Aceptación de los Términos",
      content: "Al utilizar los servicios digitales de Impulsa360 (incluyendo marketing digital, desarrollo de aplicaciones, IA y automatizaciones), aceptas cumplir con estos términos y condiciones. Si no estás de acuerdo, abstente de usar nuestros servicios.",
      gradient: "from-emerald-500/20 to-teal-500/20"
    },
    {
      icon: Settings,
      title: "Servicios Ofrecidos",
      content: ["Estrategias de marketing digital", "Desarrollo de aplicaciones y sistemas personalizados", "Soluciones basadas en inteligencia artificial", "Automatizaciones avanzadas"],
      isList: true,
      gradient: "from-blue-500/20 to-indigo-500/20"
    },
    {
      icon: Book,
      title: "Obligaciones del Usuario",
      content: ["Proporcionar información veraz y actualizada", "No utilizar nuestros servicios para actividades ilegales o fraudulentas", "Respetar la propiedad intelectual de Impulsa360 y terceros"],
      isList: true,
      gradient: "from-violet-500/20 to-purple-500/20"
    },
    {
      icon: AlertCircle,
      title: "Limitación de Responsabilidad",
      content: ["Daños indirectos o pérdidas derivadas del uso de nuestros servicios", "Fallos técnicos fuera de nuestro control (ej. cortes de internet)"],
      isList: true,
      gradient: "from-rose-500/20 to-pink-500/20"
    },
    {
      icon: RefreshCw,
      title: "Modificaciones",
      content: "Nos reservamos el derecho de actualizar estos términos. Se notificarán cambios significativos mediante nuestro sitio web.",
      gradient: "from-amber-500/20 to-orange-500/20"
    },
    {
      icon: Scale,
      title: "Ley Aplicable",
      content: "Estos términos se rigen por las leyes de [país/jurisdicción correspondiente].",
      gradient: "from-cyan-500/20 to-sky-500/20"
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
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,#1A103D,transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,#1E293B,transparent_50%)]"></div>
        </>
      )}
      
      <main className="relative container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-30"></div>
              <h1 className="relative px-8 py-4 bg-[#0A0F1E] rounded-lg text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                Términos de Servicio
              </h1>
            </div>
          </div>
        </motion.div>

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
              
              <div className={`relative backdrop-blur-sm rounded-2xl p-8 transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-[#111827]/40 border border-gray-700/50 hover:border-gray-600/50'
                  : 'bg-white/80 border border-gray-200/80 hover:border-gray-300/80'
              }`}>
                <div className="flex items-center gap-4 mb-6">
                  <section.icon className="w-8 h-8 text-blue-400" />
                  <h2 className="text-2xl font-semibold">{section.title}</h2>
                </div>
                
                {section.isList ? (
                  <ul className="space-y-3">
                    {section.content.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={`leading-relaxed ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>{section.content}</p>
                )}
              </div>
            </motion.section>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className={`mt-12 text-center text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}
        >
          Última actualización: Marzo 2025
        </motion.div>
      </main>
    </div>
  );
};

export default TermsOfService;
