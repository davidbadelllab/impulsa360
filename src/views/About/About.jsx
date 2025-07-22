import React from 'react';
import { ArrowUpRight, Rocket, Shield, Target, ArrowRight, Code, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const About = () => {
  const { theme } = useTheme();
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className={`min-h-screen overflow-hidden pt-24 pb-24 ${
      theme === 'dark' 
        ? 'bg-black text-white' 
        : 'bg-white text-gray-900'
    }`}>
      {/* Hero Section con Parallax */}
      <div className="relative">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-blue-900/40 to-pink-900/40 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(101,39,190,0.2),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(76,158,255,0.2),transparent_50%)]"></div>
        </div>
        
        <div className="container mx-auto px-6 py-24 relative">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute -top-4 left-0 flex items-center space-x-2">
              <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              <span className="text-sm font-mono text-blue-400">TechX_</span>
            </div>
            
            <h1 className="text-7xl font-bold mb-8 leading-none tracking-tight">
              Transformamos
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient">
                el Futuro Digital
              </span>
            </h1>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-20 items-center mt-16 mb-8">
            <motion.div 
              className="space-y-8"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
            >
              <p className="text-2xl font-light leading-relaxed">
                No solo somos una agencia digital —
                <span className="text-purple-400 font-semibold"> somos arquitectos del éxito empresarial </span> 
                en la era digital.
              </p>
              <p className={`text-xl leading-relaxed ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Nuestro equipo élite de estrategas digitales, desarrolladores full-stack y expertos en 
                growth hacking fusiona tecnología de vanguardia con estrategias disruptivas para 
                catapultar tu negocio al siguiente nivel.
              </p>
              
              {/* <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
              >
                <span>Explora Nuestros Servicios</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button> */}
            </motion.div>
            
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-30 group-hover:opacity-70 transition duration-1000"></div>
              <div className="relative">
                <div className="absolute -z-10 w-full h-full bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-pink-600/20 rounded-2xl blur-3xl"></div>
                <img 
                  src="/img/representationUser.jpg"
                  alt="Digital Transformation"
                  className="rounded-2xl shadow-2xl border border-purple-500/20 backdrop-blur-sm transition-all duration-500 group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Misión con diseño futurista */}
      <div className="container mx-auto px-6 py-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-purple-900/10 rounded-3xl"></div>
          <div className={`backdrop-blur-xl p-16 rounded-3xl border shadow-xl ${
            theme === 'dark' 
              ? 'bg-black/40 border-purple-500/20' 
              : 'bg-white/90 border-gray-200'
          }`}>
            <div className="flex items-center space-x-4 mb-8">
              <Sparkles className="w-8 h-8 text-purple-400" />
              <h2 className="text-4xl font-bold">Nuestra Visión</h2>
            </div>
            <p className={`text-2xl leading-relaxed ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Revolucionar el panorama digital, convirtiendo ideas ambiciosas en realidades extraordinarias. 
              No seguimos las tendencias — las creamos.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Servicios con cards interactivas */}
      <div className="container mx-auto px-6 py-24 mb-8 mt-16">
        <h2 className="text-4xl font-bold mb-16">Expertise Elite</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Rocket,
              title: "Growth Marketing",
              description: "Estrategias de crecimiento exponencial con ROI medible y escalable.",
              color: "blue"
            },
            {
              icon: Code,
              title: "Desarrollo Avanzado",
              description: "Arquitecturas robustas y escalables con tecnologías de última generación.",
              color: "purple"
            },
            {
              icon: Target,
              title: "Innovación Digital",
              description: "Soluciones disruptivas que transforman desafíos en oportunidades de mercado.",
              color: "pink"
            }
          ].map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="group relative"
            >
              <div className={`absolute -inset-1 bg-gradient-to-r from-${service.color}-500 to-${service.color}-700 rounded-2xl blur opacity-30 group-hover:opacity-70 transition duration-1000`}></div>
              <div className={`relative backdrop-blur-xl p-8 rounded-2xl transition-all duration-300 ${
                theme === 'dark' 
                  ? 'bg-black/40 border-purple-500/20 hover:border-purple-500/40' 
                  : 'bg-white/90 border-gray-200 hover:border-gray-300'
              }`}>
                <service.icon className={`w-12 h-12 text-${service.color}-400 mb-6 transform group-hover:scale-110 transition-all duration-300`} />
                <h3 className="text-2xl font-semibold mb-4">{service.title}</h3>
                <p className={`text-lg ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>{service.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
