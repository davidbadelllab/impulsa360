import React, { useState } from 'react';

const CoverageMap = ({ isOpen, onClose }) => {
  const [activeCountry, setActiveCountry] = useState(null);

  const countries = [
    { name: 'España', coordinates: [490, 139], code: 'ES' },
    { name: 'México', coordinates: [200, 190], code: 'MX' },
    { name: 'Colombia', coordinates: [280, 280], code: 'CO' },
    { name: 'Venezuela', coordinates: [300, 260], code: 'VE' },
    { name: 'Argentina', coordinates: [320, 420], code: 'AR' },
    { name: 'Chile', coordinates: [300, 400], code: 'CL' },
    { name: 'Estados Unidos', coordinates: [220, 160], code: 'US' },
    { name: 'Emiratos Árabes Unidos', coordinates: [620, 200], code: 'AE' },
    { name: 'El Salvador', coordinates: [220, 220], code: 'SV' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
      <div className="relative w-full max-w-6xl bg-gray-900 rounded-3xl p-8 border border-purple-500/20">
        {/* Efectos de fondo */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20"></div>
          <div className="absolute -inset-0 blur-3xl bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-indigo-500/10 animate-pulse"></div>
        </div>

        {/* Contenido */}
        <div className="relative">
          {/* Botón de cerrar */}
          <button 
            onClick={onClose}
            className="absolute top-0 right-0 p-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex flex-col space-y-8">
            {/* Encabezado */}
            <div className="flex items-center space-x-4">
              <img 
                src="/img/LogoImpulsa.png"
                alt="Impulsa360 Logo"
                className="h-12 w-auto"
              />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Presencia Global
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Mapa Mundial */}
              <div className="lg:col-span-8">
                <div className="relative w-full aspect-[16/9] bg-gray-800/30 rounded-2xl overflow-hidden backdrop-blur-sm border border-gray-700/50">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-indigo-500/5"></div>
                  <svg 
                    viewBox="0 0 1000 500" 
                    className="w-full h-full"
                    style={{ background: 'transparent' }}
                  >
                    {/* Mapa base */}
                    <g className="fill-gray-700/40 stroke-purple-500/30" strokeWidth="0.5">
                      <image 
                        href="/img/world.svg"
                        width="1000"
                        height="500"
                        className="opacity-20"
                      />
                    </g>

                    {/* Puntos de ubicación */}
                    {countries.map((country) => (
                      <g key={country.code}>
                        {/* Efecto de pulso cuando está activo */}
                        {activeCountry === country.code && (
                          <>
                            <circle
                              cx={country.coordinates[0]}
                              cy={country.coordinates[1]}
                              r="20"
                              className="fill-purple-500/20 animate-ping"
                            />
                            <circle
                              cx={country.coordinates[0]}
                              cy={country.coordinates[1]}
                              r="25"
                              className="fill-green-500/10 animate-pulse"
                            />
                          </>
                        )}
                        {/* Logo como marcador */}
                        <image
                          href="/img/ImpulsaColor2.png"
                          x={country.coordinates[0] - 8}
                          y={country.coordinates[1] - 8}
                          width="16"
                          height="16"
                          className={`opacity-80 transition-all duration-300 ${
                            activeCountry === country.code ? 'scale-150' : ''
                          }`}
                        />
                        {/* Anillo exterior */}
                        <circle
                          cx={country.coordinates[0]}
                          cy={country.coordinates[1]}
                          r="12"
                          className={`fill-transparent transition-all duration-300 ${
                            activeCountry === country.code 
                              ? 'stroke-green-400 stroke-2' 
                              : 'stroke-blue-400/50 stroke-1'
                          }`}
                        />
                      </g>
                    ))}
                  </svg>
                </div>
              </div>

              {/* Lista de países */}
              <div className="lg:col-span-4">
                <div className="space-y-3">
                  {countries.map((country) => (
                    <div 
                      key={country.code}
                      className={`bg-gradient-to-r from-gray-800/50 via-gray-800/30 to-gray-800/50 p-4 rounded-xl border transition-all duration-300 flex items-center space-x-3 transform hover:translate-x-1 cursor-pointer ${
                        activeCountry === country.code 
                          ? 'border-green-500/50 shadow-lg shadow-green-500/20' 
                          : 'border-gray-700/50 hover:border-blue-500/50'
                      }`}
                      onMouseEnter={() => setActiveCountry(country.code)}
                      onMouseLeave={() => setActiveCountry(null)}
                    >
                      <div className="relative">
                        <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                          activeCountry === country.code ? 'bg-green-400' : 'bg-blue-400'
                        } animate-pulse`}></div>
                        <div className={`absolute -inset-1 rounded-full blur transition-colors duration-300 ${
                          activeCountry === country.code ? 'bg-green-400/20' : 'bg-blue-400/20'
                        } animate-pulse`}></div>
                      </div>
                      <span className={`transition-colors duration-300 ${
                        activeCountry === country.code ? 'text-white' : 'text-gray-300'
                      }`}>{country.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverageMap;