import React from 'react';
import { Shield, Database, Share2, Lock, User, Cookie, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const PrivacyPolicy = () => {
  const { theme } = useTheme();
  const sections = [
    {
      icon: Database,
      title: "Información Recopilada",
      subsections: [
        {
          subtitle: "Personal",
          content: "Nombre, correo, teléfono, datos profesionales"
        },
        {
          subtitle: "Técnica",
          content: "IP, navegador, páginas visitadas (cookies)"
        }
      ],
      gradient: "from-cyan-600/20 to-blue-600/20"
    },
    {
      icon: Share2,
      title: "Uso de los Datos",
      content: [
        "Gestionar consultas y proyectos",
        "Personalizar servicios y enviar comunicaciones comerciales",
        "Mejorar nuestra plataforma y análisis de mercado"
      ],
      gradient: "from-indigo-600/20 to-purple-600/20"
    },
    {
      icon: User,
      title: "Compartir con Terceros",
      content: [
        "Proveedores de servicios (ej. hosting, herramientas de IA)",
        "Cumplimiento legal"
      ],
      subtitle: "Solo cuando sea necesario para:",
      gradient: "from-purple-600/20 to-pink-600/20"
    },
    {
      icon: Lock,
      title: "Seguridad",
      content: "Medidas técnicas (cifrado, controles de acceso) para proteger tus datos.",
      gradient: "from-emerald-600/20 to-teal-600/20"
    },
    {
      icon: Shield,
      title: "Tus Derechos",
      content: [
        "Acceso, rectificación o eliminación de datos solicitando a:",
        "impulsa360agency@gmail.com"
      ],
      gradient: "from-orange-600/20 to-amber-600/20"
    },
    {
      icon: Cookie,
      title: "Cookies",
      content: "Puedes gestionarlas desde tu navegador, pero afectará la experiencia.",
      gradient: "from-red-600/20 to-orange-600/20"
    },
    {
      icon: RefreshCw,
      title: "Actualizaciones",
      content: "Revisa periódicamente esta política para cambios.",
      gradient: "from-blue-600/20 to-indigo-600/20"
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg blur opacity-30"></div>
              <h1 className="relative px-8 py-4 bg-[#0A0F1E] rounded-lg text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
                Política de Privacidad
              </h1>
            </div>
          </div>
          <p className={`mt-6 max-w-2xl mx-auto ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Tu privacidad es nuestra prioridad. Conoce cómo protegemos y manejamos tu información.
          </p>
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
              
              <div className={`relative backdrop-blur-sm rounded-2xl p-8 transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-[#111827]/40 border border-gray-700/50 hover:border-gray-600/50'
                  : 'bg-white/80 border border-gray-200/80 hover:border-gray-300/80'
              }`}>
                <div className="flex items-center gap-4 mb-6">
                  <section.icon className="w-8 h-8 text-blue-400" />
                  <h2 className="text-2xl font-semibold">{section.title}</h2>
                </div>

                {section.subsections ? (
                  <div className="space-y-4">
                    {section.subsections.map((subsection, i) => (
                      <div key={i} className="ml-4">
                        <h3 className="text-lg font-medium text-blue-400 mb-2">{subsection.subtitle}</h3>
                        <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{subsection.content}</p>
                      </div>
                    ))}
                  </div>
                ) : section.content instanceof Array ? (
                  <ul className="space-y-3 ml-4">
                    {section.subtitle && (
                      <p className={theme === 'dark' ? 'text-gray-300 mb-2' : 'text-gray-700 mb-2'}>{section.subtitle}</p>
                    )}
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

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className={`mt-12 text-center text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}
        >
          <p>Última actualización: Marzo 2025</p>
          <p className="mt-2">Para cualquier consulta sobre privacidad, contáctanos en impulsa360agency@gmail.com</p>
        </motion.div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
