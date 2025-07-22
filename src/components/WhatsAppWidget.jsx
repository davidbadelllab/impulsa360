import React, { useState, useEffect } from 'react';

const WhatsAppWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showWidget, setShowWidget] = useState(false);
  const phoneNumber = '584246312483';

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWidget(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const steps = [
    {
      message: "👋 ¡Hola! Bienvenido a Impulsa360",
      subMessage: "¿Nos indicas tu nombre para comenzar?",
      input: true,
      placeholder: "Escribe tu nombre...",
      action: setName,
      icon: "👤"
    },
    {
      message: `¡Excelente ${name}! 🎉`,
      subMessage: "¿Cuál es tu correo electrónico?",
      input: true,
      placeholder: "tucorreo@ejemplo.com",
      action: setEmail,
      icon: "📧"
    },
    {
      message: "¡Perfecto! Ya casi terminamos ✨",
      subMessage: "¿En qué podemos ayudarte hoy?",
      input: true,
      placeholder: "Cuéntanos tu proyecto o idea...",
      action: setMessage,
      icon: "💡"
    }
  ];

  const simulateTyping = async (callback) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsTyping(false);
    callback();
  };

  const handleSubmit = (value, currentStep) => {
    // Guardamos el valor en el estado correspondiente
    steps[currentStep].action(value);
    
    if (currentStep < steps.length - 1) {
      simulateTyping(() => setStep(currentStep + 1));
    } else {
      // Si es el último paso, guardamos el mensaje primero
      setMessage(value);
      
      // Esperamos un momento para asegurarnos que el estado se actualizó
      setTimeout(() => {
        const finalMessage = `¡Hola! Soy *${name}*%0A%0A📧 Correo: ${email}%0A%0A💬 Mensaje: ${value}%0A%0A_Enviado desde Impulsa360_`;
        window.open(`https://wa.me/${phoneNumber}?text=${finalMessage}`, '_blank');
        handleReset();
      }, 100);
    }
  };

  const handleReset = () => {
    setIsOpen(false);
    setTimeout(() => {
      setStep(0);
      setName('');
      setEmail('');
      setMessage('');
    }, 500);
  };

  if (!showWidget) return null;

  return (
    <div className={`fixed bottom-20 right-4 z-[60] transition-transform duration-500 ${showWidget ? 'translate-y-0' : 'translate-y-full'}`}>
      <div className={`absolute bottom-20 right-0 w-96 transform transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-full p-2 shadow-lg">
                <img 
                  src="/img/ImpulsaColor2.png"
                  alt="Logo"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div>
                <h3 className="font-bold text-lg">Impulsa360</h3>
                <p className="text-sm text-green-100">Respuesta inmediata 🚀</p>
              </div>
            </div>
          </div>
          
          {/* Chat Messages - Ahora con altura fija y scroll */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white p-6">
            <div className="flex flex-col space-y-6">
              {steps.slice(0, step + 1).map((s, index) => (
                <div key={index} className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0">
                      {s.icon}
                    </div>
                    <div className="space-y-2">
                      <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 max-w-[80%]">
                        <p className="font-medium text-gray-800">{s.message}</p>
                        <p className="text-sm text-gray-600 mt-1">{s.subMessage}</p>
                      </div>
                    </div>
                  </div>

                  {index < step && (
                    <div className="flex justify-end">
                      <div className="bg-green-500 text-white p-4 rounded-2xl rounded-tr-none shadow-sm max-w-[80%]">
                        {index === 0 ? name : index === 1 ? email : message}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Input Area - Ahora fijo en la parte inferior */}
          <div className="border-t border-gray-100 bg-white p-4">
            {isTyping ? (
              <div className="bg-gray-100 p-4 rounded-xl inline-block">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            ) : (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = e.target.elements.userInput;
                  handleSubmit(input.value, step);
                  input.value = '';
                }}
                className="flex gap-2"
              >
                <input
                  name="userInput"
                  type={steps[step].placeholder.includes('@') ? 'email' : 'text'}
                  placeholder={steps[step].placeholder}
                  required
                  className="flex-1 p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                />
                <button 
                  type="submit"
                  className="bg-green-500 text-white p-4 rounded-xl hover:bg-green-600 transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 p-2 bg-white">
            <p className="text-xs text-center text-gray-500">
              Powered by Impulsa360 • Respuesta inmediata
            </p>
          </div>
        </div>
      </div>

      {/* WhatsApp Button with notification dot */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 animate-bounce"
        aria-label="Contactar por WhatsApp"
      >
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full"></div>
        
        <svg 
          className="w-8 h-8"
          fill="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>

        <span className="absolute -top-12 right-0 bg-black text-white px-4 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          ¡Chatea con nosotros! 💬
        </span>
      </button>
    </div>
  );
};

export default WhatsAppWidget;
