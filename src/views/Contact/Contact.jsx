import React, { useState, useEffect, useRef } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  MessageSquare, 
  Clock, 
  Globe, 
  ArrowUpRight, 
  User, 
  Briefcase, 
  Building, 
  CheckCircle, 
  Rocket,
  Zap,
  ChevronRight,
  Star,
  Loader
} from 'lucide-react';

const Contact = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [typing, setTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { 
      type: 'bot', 
      message: '👋 ¡Hola! Soy el asistente virtual de Impulsa360. ¿Cómo puedo ayudarte hoy?',
      initialDelay: 500
    }
  ]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    message: ''
  });
  
  const [currentInput, setCurrentInput] = useState('');
  const chatEndRef = useRef(null);
  
  const services = [
    "Marketing Digital",
    "Desarrollo Web",
    "SEO",
    "E-commerce",
    "Sistemas Empresariales",
    "Ciberseguridad"
  ];

  useEffect(() => {
    setIsVisible(true);
    
    // Iniciar la conversación después de cargar
    const timer = setTimeout(() => {
      addMessage({ 
        type: 'bot', 
        message: '¿Podrías decirme tu nombre completo para empezar?',
        initialDelay: 1000 
      });
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    // Usar setTimeout para asegurar que el scroll ocurra después de la renderización
    const scrollTimer = setTimeout(() => {
      scrollToBottom();
    }, 50);
    
    return () => clearTimeout(scrollTimer);
  }, [chatHistory]);

  const scrollToBottom = () => {
    if (chatEndRef.current) {
      // Usar scrollTop en lugar de scrollIntoView para evitar afectar el scroll de la página
      const chatContainer = chatEndRef.current.parentElement;
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  };

  const addMessage = (message) => {
    setChatHistory(prev => [...prev, message]);
    
    if (message.type === 'bot') {
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
      }, message.initialDelay || 800);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Si hay un mensaje en curso, envíelo
    if (currentInput.trim()) {
      processUserInput(currentInput);
      setCurrentInput('');
    }
  };

  const handleInputChange = (e) => {
    setCurrentInput(e.target.value);
  };

  const processUserInput = (input) => {
    // Añadir mensaje del usuario al historial
    addMessage({ type: 'user', message: input });
    
    // Procesar según el paso actual
    switch (step) {
      case 0: // Nombre
        setFormData({ ...formData, name: input });
        setTimeout(() => {
          addMessage({ 
            type: 'bot', 
            message: `Gracias ${input}. ¿Cuál es tu correo electrónico para poder contactarte?` 
          });
          setStep(1);
        }, 600);
        break;
        
      case 1: // Email
        setFormData({ ...formData, email: input });
        setTimeout(() => {
          addMessage({ 
            type: 'bot', 
            message: 'Perfecto. ¿Nos compartes un número de teléfono?' 
          });
          setStep(2);
        }, 600);
        break;
        
      case 2: // Teléfono
        setFormData({ ...formData, phone: input });
        setTimeout(() => {
          addMessage({ 
            type: 'bot', 
            message: '¿Para qué empresa trabajas? (Si eres independiente, puedes indicarlo)' 
          });
          setStep(3);
        }, 600);
        break;
        
      case 3: // Empresa
        setFormData({ ...formData, company: input });
        setTimeout(() => {
          addMessage({ 
            type: 'bot', 
            message: `Excelente. ¿En cuál de nuestros servicios estás interesado?
            
            1. Marketing Digital
            2. Desarrollo Web
            3. SEO
            4. E-commerce
            5. Sistemas Empresariales
            6. Ciberseguridad
            
            Puedes escribir el número o el nombre del servicio.` 
          });
          setStep(4);
        }, 600);
        break;
        
      case 4: // Servicio
        let selectedService = '';
        
        // Comprobar si el usuario ingresó un número o un texto
        if (!isNaN(input) && parseInt(input) > 0 && parseInt(input) <= services.length) {
          selectedService = services[parseInt(input) - 1];
        } else {
          // Buscar el servicio más cercano al texto ingresado
          selectedService = services.find(service => 
            service.toLowerCase().includes(input.toLowerCase())
          ) || input;
        }
        
        setFormData({ ...formData, service: selectedService });
        
        setTimeout(() => {
          addMessage({ 
            type: 'bot', 
            message: `Gracias por elegir ${selectedService}. ¿En qué podemos ayudarte específicamente? Por favor describe brevemente tu proyecto o necesidad.` 
          });
          setStep(5);
        }, 600);
        break;
        
      case 5: // Mensaje final
        setFormData({ ...formData, message: input });
        
        // Mostrar mensaje de procesamiento
        setTimeout(() => {
          addMessage({ 
            type: 'bot', 
            message: `⚙️ Procesando tu solicitud...` 
          });
        }, 600);
        
        // Simular procesamiento y mostrar confirmación
        setTimeout(() => {
          addMessage({ 
            type: 'bot', 
            message: `¡Perfecto ${formData.name}! Hemos recibido tu solicitud y uno de nuestros especialistas se pondrá en contacto contigo a la brevedad posible a través de ${formData.email} o al teléfono ${formData.phone}.
            
            📌 Resumen de tu solicitud:
            • Servicio: ${selectedService}
            • Empresa: ${formData.company}
            
            ¿Hay algo más en lo que pueda ayudarte?` 
          });
          setStep(6);
        }, 2500);
        break;
        
      case 6: // Conversación adicional
        setTimeout(() => {
          addMessage({ 
            type: 'bot', 
            message: `Gracias por tu mensaje adicional. Lo he añadido a tu solicitud. Si necesitas algo más, no dudes en contactarnos directamente a través de cualquiera de nuestros canales. ¡Que tengas un excelente día!` 
          });
        }, 600);
        break;
        
      default:
        break;
    }
  };

  const TypingIndicator = () => (
    <div className="flex space-x-2 p-3 bg-blue-600/20 rounded-xl w-16">
      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
    </div>
  );

  const ChatBubble = ({ message, isUser }) => {
    const formattedMessage = message.split('\n').map((line, i) => 
      <React.Fragment key={i}>
        {line}
        {i < message.split('\n').length - 1 && <br />}
      </React.Fragment>
    );
    
    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        {!isUser && (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0 mr-2">
            <Rocket size={20} className="text-white" />
          </div>
        )}
        <div 
          className={`max-w-[80%] p-4 rounded-2xl ${
            isUser 
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' 
              : 'bg-gray-800/80 text-gray-100 border border-gray-700'
          }`}
        >
          <div className="whitespace-pre-line">{formattedMessage}</div>
        </div>
        {isUser && (
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 ml-2">
            <User size={20} className="text-gray-300" />
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-950 via-gray-900 to-blue-950 py-24">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
        <div className="absolute top-0 right-0 bg-blue-600 w-96 h-96 rounded-full filter blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-0 left-20 bg-purple-600 w-96 h-96 rounded-full filter blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
          <div className="flex justify-center mb-4">
            <div className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-blue-300 font-medium inline-flex items-center backdrop-blur-md border border-blue-500/20">
              <MessageSquare size={18} className="mr-2" />
              CONTACTO INTELIGENTE
            </div>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-4 text-white tracking-tight">
            ¿Listo para impulsar
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 pb-2">
              tu presencia digital?
            </span>
          </h2>
          
          <p className="text-xl text-gray-300 text-center mb-16 max-w-3xl mx-auto">
            Agenda una consulta gratuita y descubre cómo podemos ayudarte a alcanzar tus objetivos digitales.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            {/* Chat Interactivo */}
            <div className="bg-gradient-to-br from-gray-900/90 to-gray-950/90 backdrop-blur-lg rounded-2xl p-6 border border-gray-800 shadow-2xl shadow-blue-900/20 h-[600px] flex flex-col overflow-hidden relative" style={{ minHeight: '600px', maxHeight: '600px' }}>
              {/* Encabezado del chat */}
              <div className="flex items-center justify-between p-3 border-b border-gray-800 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                    <Zap size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Asistente Impulsa360</h3>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      <span className="text-green-400 text-xs">En línea</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                </div>
              </div>
              
              {/* Área de mensajes */}
              <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4 mb-4 custom-scrollbar" style={{ height: 'calc(100% - 120px)' }}>
                {chatHistory.map((chat, index) => (
                  <ChatBubble 
                    key={index} 
                    message={chat.message} 
                    isUser={chat.type === 'user'} 
                  />
                ))}
                {typing && <TypingIndicator />}
                <div ref={chatEndRef} />
              </div>
              
              {/* Área de entrada */}
              <form onSubmit={handleSubmit} className="p-2 border-t border-gray-800">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={currentInput}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Escribe tu respuesta..."
                  />
                  <button
                    type="submit"
                    className="p-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </form>

              {/* Decoración tech con particulas */}
              <div className="absolute bottom-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-10">
                {[...Array(15)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute bg-blue-500 w-1 h-10 animate-float"
                    style={{
                      left: `${Math.random() * 100}%`,
                      bottom: `-${Math.random() * 20}%`,
                      opacity: 0.1 + Math.random() * 0.5,
                      animationDuration: `${5 + Math.random() * 10}s`,
                      animationDelay: `${Math.random() * 5}s`
                    }}
                  ></div>
                ))}
              </div>
            </div>

            {/* Información de contacto - Panel Mejorado */}
            <div className="bg-gradient-to-br from-gray-900/90 to-gray-950/90 backdrop-blur-lg rounded-2xl p-8 border border-gray-800 shadow-xl transform hover:scale-[1.01] transition-all duration-300">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600/50 to-indigo-600/50">
                  <Mail className="h-6 w-6 text-blue-300" />
                </div>
                <h3 className="text-2xl font-bold text-white">Información de contacto</h3>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4 transform hover:translate-x-1 transition-all duration-300">
                  <div className="bg-gradient-to-br from-blue-700/30 to-blue-900/30 p-3 rounded-xl border border-blue-700/30">
                    <MapPin className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Ubicación principal</h4>
                    <p className="text-gray-300">
                      Maracaibo, Venezuela<br />
                      Edificio Millenium, Torre A, Piso 5
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 transform hover:translate-x-1 transition-all duration-300">
                  <div className="bg-gradient-to-br from-blue-700/30 to-blue-900/30 p-3 rounded-xl border border-blue-700/30">
                    <Phone className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Teléfono directo</h4>
                    <p className="text-gray-300">+58 (424) 631-2483</p>
                    <p className="text-gray-400 text-sm mt-1">Disponible para WhatsApp</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 transform hover:translate-x-1 transition-all duration-300">
                  <div className="bg-gradient-to-br from-blue-700/30 to-blue-900/30 p-3 rounded-xl border border-blue-700/30">
                    <Mail className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Correo electrónico</h4>
                    <p className="text-gray-300">impulsa360agency@gmail.com</p>
                    <p className="text-gray-400 text-sm mt-1">Respuesta en menos de 24h</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 transform hover:translate-x-1 transition-all duration-300">
                  <div className="bg-gradient-to-br from-blue-700/30 to-blue-900/30 p-3 rounded-xl border border-blue-700/30">
                    <Clock className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Horario de atención</h4>
                    <div className="flex items-center mb-1">
                      <span className="text-gray-300 w-32">Lunes - Viernes:</span>
                      <span className="text-blue-300">9:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-300 w-32">Sábado:</span>
                      <span className="text-blue-300">9:00 AM - 1:00 PM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Cobertura Global - Ancho completo */}
          <div className="bg-gradient-to-br from-gray-900/90 to-gray-950/90 backdrop-blur-lg rounded-2xl p-8 border border-gray-800 shadow-xl transform hover:scale-[1.01] transition-all duration-300">
            <div className="flex items-center space-x-4 mb-8">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600/50 to-indigo-600/50">
                <Globe className="h-6 w-6 text-purple-300" />
              </div>
              <h3 className="text-2xl font-bold text-white">Cobertura global</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-4">
                <div className="mt-2 flex-shrink-0">
                  <Star className="h-5 w-5 text-yellow-400" />
                </div>
                <p className="text-gray-300">
                  Brindamos servicios a clientes en toda Latinoamérica y España. Contáctanos para discutir cómo podemos ayudarte, sin importar tu ubicación.
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-2 gap-3 col-span-1 md:col-span-2">
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-3 rounded-xl border border-gray-800 flex items-center space-x-2 transform hover:translate-y-[-2px] transition-all duration-300">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300">España</span>
                </div>
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-3 rounded-xl border border-gray-800 flex items-center space-x-2 transform hover:translate-y-[-2px] transition-all duration-300">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300">México</span>
                </div>
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-3 rounded-xl border border-gray-800 flex items-center space-x-2 transform hover:translate-y-[-2px] transition-all duration-300">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300">Colombia</span>
                </div>
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-3 rounded-xl border border-gray-800 flex items-center space-x-2 transform hover:translate-y-[-2px] transition-all duration-300">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300">Venezuela</span>
                </div>
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-3 rounded-xl border border-gray-800 flex items-center space-x-2 transform hover:translate-y-[-2px] transition-all duration-300">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300">Argentina</span>
                </div>
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-3 rounded-xl border border-gray-800 flex items-center space-x-2 transform hover:translate-y-[-2px] transition-all duration-300">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300">Chile</span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-center">
              <button className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600/20 to-indigo-600/20 text-purple-300 border border-purple-700/30 hover:bg-gradient-to-r hover:from-purple-600/30 hover:to-indigo-600/30 transition-all transform hover:scale-105">
                Ver mapa de cobertura completa
                <ArrowUpRight size={16} className="ml-2 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Estilos para la animación de partículas */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-500px); opacity: 0; }
        }
        .animate-float {
          animation: float linear infinite;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
      `}</style>
    </section>
  );
};

export default Contact;