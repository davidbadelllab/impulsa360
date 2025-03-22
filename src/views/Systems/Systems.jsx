import React, { useState, useEffect } from 'react';
import { 
  Github, 
  GitBranch, 
  GitMerge, 
  GitPullRequest, 
  Code, 
  User, 
  Users, 
  Star, 
  Shield, 
  Database, 
  Cloud,
  Cpu,
  Settings 
} from 'lucide-react';

const GitHubStyleSystems = () => {
  const [activeTab, setActiveTab] = useState('sistemas');
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Datos de sistemas
  const sistemas = [
    {
      icon: Database,
      name: "ERP-Enterprise",
      description: "Sistema integral de gestión empresarial con IA avanzada",
      stars: 452,
      forks: 127,
      commits: 3257,
      contributors: 18,
      language: "TypeScript",
      languageColor: "#3178c6",
      tags: ["erp", "business", "finance", "inventory"],
      lastUpdate: "4 días atrás"
    },
    {
      icon: Cloud,
      name: "Cloud-Hyperscale",
      description: "Plataforma cloud con escalado automático y redundancia global",
      stars: 873,
      forks: 245,
      commits: 5829,
      contributors: 32,
      language: "Go",
      languageColor: "#00ADD8",
      tags: ["cloud", "infrastructure", "scaling", "kubernetes"],
      lastUpdate: "ayer"
    },
    {
      icon: Shield,
      name: "Quantum-Security",
      description: "Sistema de ciberseguridad con protección predictiva y ML",
      stars: 612,
      forks: 176,
      commits: 2978,
      contributors: 22,
      language: "Rust",
      languageColor: "#DEA584",
      tags: ["security", "encryption", "firewall", "zero-trust"],
      lastUpdate: "hace 2 semanas"
    },
    {
      icon: Cpu,
      name: "Hyper-Automation",
      description: "Orquestación y automatización inteligente para procesos empresariales",
      stars: 743,
      forks: 201,
      commits: 4123,
      contributors: 27,
      language: "Python",
      languageColor: "#3572A5",
      tags: ["automation", "workflow", "machine-learning", "bpm"],
      lastUpdate: "3 días atrás"
    }
  ];

  // Datos de clientes
  const clientes = [
    {
      name: "TechNova Industries",
      logo: "https://via.placeholder.com/40",
      repositorios: 17,
      integrations: 8,
      deployments: 432,
      sector: "Tecnología",
      sistemas: ["ERP-Enterprise", "Quantum-Security"],
      lastActivity: "hace 2 horas"
    },
    {
      name: "Global Finance Group",
      logo: "https://via.placeholder.com/40",
      repositorios: 24,
      integrations: 12,
      deployments: 876,
      sector: "Finanzas",
      sistemas: ["ERP-Enterprise", "Cloud-Hyperscale", "Quantum-Security"],
      lastActivity: "hace 3 días"
    },
    {
      name: "MediTech Solutions",
      logo: "https://via.placeholder.com/40",
      repositorios: 12,
      integrations: 6,
      deployments: 345,
      sector: "Salud",
      sistemas: ["Cloud-Hyperscale", "Hyper-Automation"],
      lastActivity: "hace 5 horas"
    },
    {
      name: "Logistics Pro",
      logo: "https://via.placeholder.com/40",
      repositorios: 21,
      integrations: 14,
      deployments: 728,
      sector: "Logística",
      sistemas: ["ERP-Enterprise", "Hyper-Automation", "Cloud-Hyperscale"],
      lastActivity: "ayer"
    }
  ];

  // Componente de actividad tipo GitHub
  const ActivityGrid = () => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    // Generar datos aleatorios de actividad
    const generateActivityData = () => {
      const data = [];
      const now = new Date();
      const yearStart = new Date(now.getFullYear(), 0, 1);
      
      for (let i = 0; i < 53; i++) {
        let week = [];
        for (let j = 0; j < 7; j++) {
          const date = new Date(yearStart);
          date.setDate(yearStart.getDate() + i * 7 + j);
          
          // Solo incluir fechas hasta hoy
          if (date <= now) {
            const activity = Math.floor(Math.random() * 5); // 0-4 nivel de actividad
            week.push({
              date,
              activity,
              tooltip: `${activity} commits el ${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`
            });
          } else {
            week.push(null);
          }
        }
        data.push(week);
      }
      return data;
    };
    
    const activityData = generateActivityData();
    
    // Determinar el color basado en el nivel de actividad
    const getActivityColor = (level) => {
      if (level === 0) return 'bg-gray-800';
      if (level === 1) return 'bg-blue-900';
      if (level === 2) return 'bg-blue-700';
      if (level === 3) return 'bg-blue-500';
      return 'bg-blue-300';
    };
    
    return (
      <div className="mt-8 overflow-hidden">
        <div className="flex text-xs text-gray-400 mb-1 justify-end">
          {days.map((day, i) => (
            <div key={i} className="w-4 mx-1">{day}</div>
          ))}
        </div>
        <div className="flex flex-wrap">
          {activityData.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col mr-1">
              {week.map((day, dayIndex) => (
                day ? (
                  <div 
                    key={dayIndex} 
                    className={`w-4 h-4 m-0.5 rounded-sm ${getActivityColor(day.activity)} cursor-pointer transition-transform hover:scale-150`}
                    title={day.tooltip}
                  />
                ) : (
                  <div key={dayIndex} className="w-4 h-4 m-0.5 bg-transparent" />
                )
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Componente de sistema tipo repositorio de GitHub
  const SystemItem = ({ system, index }) => {
    return (
      <div 
        className={`border ${hoveredItem === index ? 'border-blue-500/40' : 'border-gray-800'} rounded-lg p-6 transition-all duration-300 hover:bg-gray-900/50 backdrop-blur-lg`}
        onMouseEnter={() => setHoveredItem(index)}
        onMouseLeave={() => setHoveredItem(null)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gradient-to-br from-blue-800 to-purple-900 mr-4">
              <system.icon size={20} className="text-blue-300" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white flex items-center">
                {system.name}
                <span className="ml-3 px-2 py-0.5 text-xs rounded-full bg-blue-900/60 text-blue-300">{system.language}</span>
              </h3>
              <p className="text-gray-400 mt-1">{system.description}</p>
            </div>
          </div>
          
          <div className="flex space-x-3 text-gray-400">
            <div className="flex items-center">
              <Star size={16} className="mr-1" />
              <span>{system.stars}</span>
            </div>
            <div className="flex items-center">
              <GitBranch size={16} className="mr-1" />
              <span>{system.forks}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex space-x-2 flex-wrap">
          {system.tags.map((tag, i) => (
            <span key={i} className="px-2 py-1 bg-gray-800 text-gray-300 rounded-full text-xs mb-2">{tag}</span>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: system.languageColor }}></div>
            <span className="text-sm text-gray-400">{system.language}</span>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center">
              <Users size={14} className="mr-1.5" />
              <span>{system.contributors}</span>
            </div>
            <div className="flex items-center">
              <GitMerge size={14} className="mr-1.5" />
              <span>{system.commits}</span>
            </div>
            <div>Actualizado {system.lastUpdate}</div>
          </div>
        </div>
      </div>
    );
  };

  // Componente de cliente tipo perfil de GitHub
  const ClientItem = ({ client, index }) => {
    return (
      <div 
        className={`border ${hoveredItem === 'client'+index ? 'border-blue-500/40' : 'border-gray-800'} rounded-lg p-6 transition-all duration-300 hover:bg-gray-900/50 backdrop-blur-lg`}
        onMouseEnter={() => setHoveredItem('client'+index)}
        onMouseLeave={() => setHoveredItem(null)}
      >
        <div className="flex items-start">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-700 to-purple-800 rounded-full flex items-center justify-center text-lg font-bold text-white mr-4">
            {client.name.substring(0, 2)}
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-white flex items-center">
              {client.name}
              <span className="ml-3 px-2 py-0.5 text-xs rounded-full bg-gray-800 text-gray-300">{client.sector}</span>
            </h3>
            <p className="text-gray-400 mt-1">Actividad: {client.lastActivity}</p>
          </div>
        </div>
        
        <div className="mt-6 flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex space-x-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{client.repositorios}</p>
              <p className="text-xs text-gray-400">Repositorios</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{client.integrations}</p>
              <p className="text-xs text-gray-400">Integraciones</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{client.deployments}</p>
              <p className="text-xs text-gray-400">Despliegues</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">Sistemas implementados</h4>
          <div className="flex flex-wrap">
            {client.sistemas.map((sistema, i) => (
              <div key={i} className="mr-2 mb-2 px-3 py-1 bg-gradient-to-r from-blue-900 to-purple-900 rounded-md text-blue-200 text-sm flex items-center">
                <Code size={12} className="mr-1.5" />
                {sistema}
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Actividad</h4>
          <ActivityGrid />
        </div>
      </div>
    );
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-950 via-gray-900 to-blue-950 py-20">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
        <div className="absolute top-1/4 right-1/4 bg-blue-600 w-96 h-96 rounded-full filter blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-1/3 left-1/3 bg-purple-600 w-96 h-96 rounded-full filter blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
          <div className="flex justify-center mb-3">
            <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-900/40 to-purple-900/40 text-blue-300 text-sm font-medium inline-flex items-center">
              <Github size={16} className="mr-2" />
              Sistemas y Clientes
            </div>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-white">
            Repositorio de
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">
              innovación tecnológica
            </span>
          </h2>
          
          <p className="text-xl text-gray-300 text-center mb-12 max-w-3xl mx-auto">
            Explora nuestra colección de sistemas empresariales y los clientes que confían en nuestra tecnología.
          </p>

          {/* GitHub Tab Navigation */}
          <div className="flex border-b border-gray-800 mb-8">
            <button
              className={`px-6 py-3 text-sm font-medium flex items-center ${activeTab === 'sistemas' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-300'}`}
              onClick={() => setActiveTab('sistemas')}
            >
              <Code size={16} className="mr-2" />
              Sistemas
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium flex items-center ${activeTab === 'clientes' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-300'}`}
              onClick={() => setActiveTab('clientes')}
            >
              <Users size={16} className="mr-2" />
              Clientes
            </button>
          </div>

          {/* GitHub Style Content */}
          <div className="space-y-6">
            {activeTab === 'sistemas' ? (
              sistemas.map((system, index) => (
                <SystemItem key={index} system={system} index={index} />
              ))
            ) : (
              clientes.map((client, index) => (
                <ClientItem key={index} client={client} index={index} />
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GitHubStyleSystems;