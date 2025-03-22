import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  X, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Video, 
  PhoneCall, 
  User, 
  Calendar as CalendarIcon,
  Building,
  Mail,
  CheckCircle,
  ArrowRight,
  Loader
} from 'lucide-react';

const BookingModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: ''
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      generateAvailableDates();
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  useEffect(() => {
    if (selectedDate) {
      generateAvailableTimes();
    }
  }, [selectedDate]);
  
  const generateAvailableDates = () => {
    const today = new Date();
    const dates = [];
    
    // Generar fechas disponibles para el mes actual y el siguiente
    const daysInMonth = new Date(
      currentMonth.getFullYear(), 
      currentMonth.getMonth() + 1, 
      0
    ).getDate();
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
      
      // Solo fechas futuras y de lunes a viernes
      if (date >= today && date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(date);
      }
    }
    
    setAvailableDates(dates);
  };
  
  const generateAvailableTimes = () => {
    // Simulación de horarios disponibles
    const times = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM
    
    for (let hour = startHour; hour <= endHour; hour++) {
      // Excluir la hora de almuerzo (12-1 PM)
      if (hour !== 12) {
        times.push(`${hour}:00`);
        if (hour !== endHour) {
          times.push(`${hour}:30`);
        }
      }
    }
    
    // Filtrar aleatoriamente algunos horarios para simular disponibilidad
    const filteredTimes = times.filter(() => Math.random() > 0.3);
    setAvailableTimes(filteredTimes);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const nextMonth = () => {
    const next = new Date(currentMonth);
    next.setMonth(next.getMonth() + 1);
    setCurrentMonth(next);
    setTimeout(() => {
      generateAvailableDates();
    }, 0);
  };
  
  const prevMonth = () => {
    const prev = new Date(currentMonth);
    prev.setMonth(prev.getMonth() - 1);
    
    // No ir más atrás del mes actual
    const today = new Date();
    if (prev.getMonth() >= today.getMonth() || prev.getFullYear() > today.getFullYear()) {
      setCurrentMonth(prev);
      setTimeout(() => {
        generateAvailableDates();
      }, 0);
    }
  };
  
  const nextStep = () => {
    setStep(step + 1);
  };
  
  const prevStep = () => {
    setStep(step - 1);
  };
  
  const formatDate = (date) => {
    if (!date) return '';
    
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
  };
  
  const getMonthName = (date) => {
    const options = { month: 'long', year: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
  };
  
  const isDateSelected = (date) => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };
  
  const submitBooking = () => {
    setLoading(true);
    
    // Simulación de envío del formulario
    setTimeout(() => {
      setLoading(false);
      setStep(4); // Paso de confirmación
    }, 1500);
  };
  
  const renderCalendar = () => {
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const today = new Date();
    
    // Ajustar el primer día para que 0 sea lunes (formato español)
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    
    const days = [];
    const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    
    // Añadir días de la semana
    weekDays.forEach(day => {
      days.push(
        <div key={`header-${day}`} className="text-center font-medium text-gray-400 text-sm py-2">
          {day}
        </div>
      );
    });
    
    // Añadir espacios en blanco para los días antes del primer día del mes
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }
    
    // Añadir los días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = isDateSelected(date);
      const isAvailable = availableDates.some(d => d.toDateString() === date.toDateString());
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const isPast = date < today;
      
      days.push(
        <div 
          key={`day-${day}`} 
          className={`p-1 text-center relative ${
            isPast || isWeekend 
              ? 'text-gray-600 cursor-not-allowed' 
              : isAvailable 
                ? 'cursor-pointer' 
                : 'text-gray-600 cursor-not-allowed'
          }`}
        >
          <button
            disabled={isPast || !isAvailable || isWeekend}
            onClick={() => setSelectedDate(date)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              isSelected 
                ? 'bg-blue-600 text-white' 
                : isToday
                  ? 'bg-blue-900/30 text-blue-300 border border-blue-500/30' 
                  : isAvailable && !isWeekend && !isPast
                    ? 'hover:bg-gray-800 text-white' 
                    : 'text-gray-600 bg-transparent'
            }`}
          >
            {day}
          </button>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>
    );
  };
  
  const renderTimeSlots = () => {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
        {availableTimes.map((time, index) => (
          <button
            key={index}
            onClick={() => setSelectedTime(time)}
            className={`py-2 px-3 rounded-lg border ${
              selectedTime === time 
                ? 'bg-blue-600 text-white border-blue-500' 
                : 'bg-gray-800/50 text-gray-300 border-gray-700 hover:bg-gray-700/50'
            } transition-all flex items-center justify-center`}
          >
            <Clock size={14} className="mr-2" />
            {time}
          </button>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-800 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Decoraciones de fondo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/20 rounded-full filter blur-3xl opacity-20"></div>
        
        {/* Barra de progreso */}
        <div className="h-1 bg-gray-800 relative">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>
        
        {/* Encabezado */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Calendar className="mr-2 text-blue-400" size={20} />
            Reserva tu asesoría gratuita
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors rounded-full p-1"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Contenido del modal */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {step === 1 && (
            <div className="space-y-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">Selecciona una fecha</h3>
                <p className="text-gray-400">Elige el día que mejor te convenga para tu asesoría personalizada.</p>
              </div>
              
              <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <button 
                    onClick={prevMonth}
                    className="p-2 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <h4 className="text-white font-medium capitalize">{getMonthName(currentMonth)}</h4>
                  <button 
                    onClick={nextMonth}
                    className="p-2 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
                
                {renderCalendar()}
              </div>
              
              {selectedDate && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Selecciona una hora</h3>
                    <p className="text-gray-400">Horarios disponibles para el {formatDate(selectedDate)}:</p>
                  </div>
                  
                  {renderTimeSlots()}
                </div>
              )}
              
              <div className="mt-6 flex justify-between">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={nextStep}
                  disabled={!selectedDate || !selectedTime}
                  className={`px-6 py-2 rounded-lg flex items-center ${
                    selectedDate && selectedTime
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  } transition-all`}
                >
                  Continuar
                  <ChevronRight size={18} className="ml-1" />
                </button>
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">Elige el tipo de asesoría</h3>
                <p className="text-gray-400">Selecciona cómo prefieres que se realice tu asesoría.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setSelectedType('video')}
                  className={`p-4 rounded-xl border ${
                    selectedType === 'video'
                      ? 'bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-600/50'
                      : 'bg-gray-900/50 border-gray-800 hover:bg-gray-800/50'
                  } transition-all text-left`}
                >
                  <div className="flex items-start">
                    <div className={`p-3 rounded-full ${
                      selectedType === 'video' ? 'bg-blue-600/30 text-blue-400' : 'bg-gray-800 text-gray-400'
                    } transition-colors`}>
                      <Video size={24} />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-white font-medium">Videollamada</h4>
                      <p className="text-gray-400 text-sm mt-1">
                        Asesoría por Zoom, Teams o Google Meet para una experiencia más personal.
                      </p>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => setSelectedType('call')}
                  className={`p-4 rounded-xl border ${
                    selectedType === 'call'
                      ? 'bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-600/50'
                      : 'bg-gray-900/50 border-gray-800 hover:bg-gray-800/50'
                  } transition-all text-left`}
                >
                  <div className="flex items-start">
                    <div className={`p-3 rounded-full ${
                      selectedType === 'call' ? 'bg-blue-600/30 text-blue-400' : 'bg-gray-800 text-gray-400'
                    } transition-colors`}>
                      <PhoneCall size={24} />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-white font-medium">Llamada telefónica</h4>
                      <p className="text-gray-400 text-sm mt-1">
                        Asesoría mediante llamada telefónica a tu número de contacto.
                      </p>
                    </div>
                  </div>
                </button>
              </div>
              
              <div className="bg-blue-900/20 rounded-xl p-4 border border-blue-900/30 text-blue-300 flex items-start mt-6">
                <div className="flex-shrink-0">
                  <Users size={20} className="mt-1" />
                </div>
                <div className="ml-3">
                  <p>Tu asesoría está programada para el <span className="font-semibold">{formatDate(selectedDate)}</span> a las <span className="font-semibold">{selectedTime}</span>.</p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-between">
                <button
                  onClick={prevStep}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors flex items-center"
                >
                  <ChevronLeft size={18} className="mr-1" />
                  Atrás
                </button>
                <button
                  onClick={nextStep}
                  disabled={!selectedType}
                  className={`px-6 py-2 rounded-lg flex items-center ${
                    selectedType
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  } transition-all`}
                >
                  Continuar
                  <ChevronRight size={18} className="ml-1" />
                </button>
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div className="space-y-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">Completa tus datos</h3>
                <p className="text-gray-400">Necesitamos un poco más de información para confirmar tu asesoría.</p>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-2 text-sm">Nombre completo</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        <User size={16} />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full bg-gray-900/50 border border-gray-800 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="Tu nombre"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2 text-sm">Correo electrónico</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        <Mail size={16} />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full bg-gray-900/50 border border-gray-800 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="tucorreo@ejemplo.com"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-2 text-sm">Empresa</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        <Building size={16} />
                      </div>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full bg-gray-900/50 border border-gray-800 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="Nombre de tu empresa"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2 text-sm">Teléfono</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        <PhoneCall size={16} />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full bg-gray-900/50 border border-gray-800 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="+58 424 123 4567"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2 text-sm">¿En qué podemos ayudarte?</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full bg-gray-900/50 border border-gray-800 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Describe brevemente el motivo de tu consulta..."
                  ></textarea>
                </div>
              </div>
              
              <div className="bg-indigo-900/20 rounded-xl p-4 border border-indigo-900/30 text-indigo-300">
                <h4 className="font-medium mb-2 flex items-center">
                  <CalendarIcon size={16} className="mr-2" />
                  Resumen de tu reserva
                </h4>
                <ul className="space-y-1 text-sm">
                  <li>• Fecha: {formatDate(selectedDate)}</li>
                  <li>• Hora: {selectedTime}</li>
                  <li>• Tipo: {selectedType === 'video' ? 'Videollamada' : 'Llamada telefónica'}</li>
                </ul>
              </div>
              
              <div className="mt-6 flex justify-between">
                <button
                  onClick={prevStep}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors flex items-center"
                >
                  <ChevronLeft size={18} className="mr-1" />
                  Atrás
                </button>
                <button
                  onClick={submitBooking}
                  disabled={loading || !formData.name || !formData.email || !formData.phone}
                  className={`px-6 py-2 rounded-lg flex items-center ${
                    formData.name && formData.email && formData.phone && !loading
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  } transition-all`}
                >
                  {loading ? (
                    <>
                      <Loader size={18} className="mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      Confirmar reserva
                      <ChevronRight size={18} className="ml-1" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
          
          {step === 4 && (
            <div className="text-center py-8 space-y-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <CheckCircle size={32} className="text-white" />
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white mb-2">¡Reserva confirmada!</h3>
                <p className="text-gray-300">
                  Tu asesoría ha sido agendada con éxito para el {formatDate(selectedDate)} a las {selectedTime}.
                </p>
              </div>
              
              <div className="bg-gray-900/50 rounded-xl p-6 max-w-md mx-auto">
                <h4 className="font-semibold text-white mb-4 text-left">Detalles de tu reserva:</h4>
                <div className="space-y-3 text-left">
                  <div className="flex items-start">
                    <CalendarIcon size={18} className="text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-white font-medium">Fecha y hora</p>
                      <p className="text-gray-400">{formatDate(selectedDate)} - {selectedTime}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    {selectedType === 'video' ? (
                      <Video size={18} className="text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                    ) : (
                      <PhoneCall size={18} className="text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                    )}
                    <div>
                      <p className="text-white font-medium">Modalidad</p>
                      <p className="text-gray-400">{selectedType === 'video' ? 'Videollamada' : 'Llamada telefónica'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <User size={18} className="text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-white font-medium">Asesor asignado</p>
                      <p className="text-gray-400">Luis Rodríguez, Consultor Senior</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-400">
                Hemos enviado un correo de confirmación a <span className="text-white">{formData.email}</span> con todos los detalles.
              </p>
              
              <div className="pt-4">
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all flex items-center mx-auto"
                >
                  Cerrar
                  <ArrowRight size={18} className="ml-2" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;