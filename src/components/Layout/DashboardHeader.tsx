import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Bell, 
  ChevronDown, 
  Menu, 
  Search, 
  LogOut, 
  User, 
  Settings, 
  HelpCircle,
  X,
  ExternalLink,
  Sparkles,
  BadgeCheck,
  Mail
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip"

interface DashboardHeaderProps {
  user: {
    username: string
    role: string
    avatarUrl?: string
  }
  onToggleSidebar: () => void
  notifications?: number
  logoUrl?: string
}

export default function DashboardHeader({ 
  user, 
  onToggleSidebar,
  notifications = 0,
  logoUrl = "/img/ImpulsaColor2.png" // URL para el logo, se puede pasar como prop
}: DashboardHeaderProps) {
  const navigate = useNavigate()
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchActive, setSearchActive] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  
  // Detectar cuando el usuario hace scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Efecto para mostrar/ocultar resultados de búsqueda
  useEffect(() => {
    if (searchQuery.length > 0) {
      setShowSearchResults(true)
    } else {
      setShowSearchResults(false)
    }
  }, [searchQuery])

  const { logout } = useAuth()

  const handleLogout = () => {
    localStorage.removeItem("token")
    logout()
    navigate('/login')
  }

  // Simular resultados de búsqueda
  const mockSearchResults = [
    { title: "Dashboard Analytics", path: "/dashboard/analytics", type: "Page" },
    { title: "User Settings", path: "/dashboard/settings", type: "Setting" },
    { title: "Monthly Report", path: "/dashboard/reports/monthly", type: "Report" },
  ]

  return (
    <motion.header 
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`
        bg-white/90 backdrop-blur-md
        ${isScrolled ? 'shadow-lg' : 'shadow-sm'} 
        h-16 flex items-center px-6 
        sticky top-0 z-50
        transition-all duration-300 ease-in-out
        border-b border-slate-200/70
      `}
      style={{
        borderRadius: "28px", // Bordes más refinados
      }}
    >
      {/* Logo con animación sutil */}
      <div className="flex items-center">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative overflow-hidden"
        >
          <motion.img 
            src={logoUrl} 
            alt="Logo" 
            initial={{ filter: "brightness(1)" }}
            whileHover={{ filter: "brightness(1.2)" }}
            className="h-8 w-auto mr-4 object-contain"
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          />
          <motion.div 
            className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-30 rounded-full blur-lg"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 0.3 }}
          />
        </motion.div>
      </div>

      {/* Botón de menú para móvil con animación */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="md:hidden"
      >
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-indigo-50 transition-colors rounded-full"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5 text-indigo-700" />
        </Button>
      </motion.div>

      {/* Barra de búsqueda mejorada con resultados */}
      <div className={`
        relative flex-1 max-w-md mx-auto
        transition-all duration-300 ease-in-out
        ${searchActive ? 'scale-105' : 'scale-100'}
      `}>
        <div className="relative">
          <Search className={`
            absolute left-3 top-1/2 transform -translate-y-1/2 
            h-4 w-4
            transition-all duration-300
            ${searchActive ? 'text-indigo-500' : 'text-slate-400'}
          `} />
          <Input 
            placeholder="Buscar..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 bg-slate-50/80 border-0 h-10
                      focus-visible:ring-2 focus-visible:ring-indigo-500/50
                      transition-all duration-300
                      hover:bg-slate-100/80 shadow-sm"
            style={{ borderRadius: "12px" }}
            onFocus={() => setSearchActive(true)}
            onBlur={() => {
              // Pequeño retraso para permitir clic en resultados
              setTimeout(() => setSearchActive(false), 200)
            }}
          />
          {searchActive && searchQuery && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 hover:bg-slate-200/50 rounded-full"
              onClick={() => {
                setSearchQuery('')
              }}
            >
              <X className="h-3.5 w-3.5 text-slate-500" />
            </Button>
          )}
        </div>

        {/* Resultados de búsqueda con animación */}
        <AnimatePresence>
          {showSearchResults && searchActive && (
            <motion.div 
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 10, height: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute mt-2 w-full bg-white rounded-xl shadow-xl border border-slate-200/50 overflow-hidden z-50"
            >
              <div className="p-2">
                <div className="text-xs font-medium text-slate-500 px-2 py-1.5">
                  Resultados
                </div>
                {mockSearchResults.map((result, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ backgroundColor: 'rgba(238, 242, 255, 0.5)' }}
                    className="flex items-center px-2 py-1.5 rounded-lg cursor-pointer"
                    onClick={() => {
                      navigate(result.path)
                      setSearchQuery('')
                      setShowSearchResults(false)
                    }}
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                      {result.type === 'Page' && <Sparkles size={14} className="text-indigo-600" />}
                      {result.type === 'Setting' && <Settings size={14} className="text-indigo-600" />}
                      {result.type === 'Report' && <BadgeCheck size={14} className="text-indigo-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800">{result.title}</p>
                      <p className="text-xs text-slate-500">{result.type}</p>
                    </div>
                    <ExternalLink size={14} className="text-slate-400" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Área de notificaciones y perfil */}
      <div className="ml-auto flex items-center space-x-1 md:space-x-3">
        {/* Botones de acción rápida */}
        <div className="hidden md:flex space-x-1">
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative hover:bg-indigo-50 transition-colors rounded-full h-9 w-9"
                >
                  <Mail className="h-4.5 w-4.5 text-slate-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">Mensajes</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative hover:bg-indigo-50 transition-colors rounded-full h-9 w-9 group"
              >
                <Bell className="h-4.5 w-4.5 text-slate-600 group-hover:text-indigo-600 transition-colors" />
                {notifications > 0 && (
                  <motion.span 
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1.5 right-1.5 h-4 w-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-[10px] text-white font-medium"
                  >
                    {notifications > 9 ? '9+' : notifications}
                  </motion.span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">Notificaciones</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {/* Perfil de usuario mejorado */}
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  variant="ghost" 
                  className="flex items-center space-x-2 px-2 hover:bg-indigo-50/70 transition-colors rounded-full"
                >
                  <div className="relative">
                    <Avatar className="h-8 w-8 ring-2 ring-offset-2 ring-indigo-500/70 transition-all hover:ring-indigo-500 shadow-md">
                      <AvatarImage src={user?.avatarUrl || "/placeholder.svg?height=32&width=32"} />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-medium">
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 rounded-full border-2 border-white"></span>
                  </div>
                  <div className="ml-1 hidden md:block text-left">
                    <p className="text-sm font-medium line-clamp-1 text-slate-800">{user?.username}</p>
                    <div className="flex items-center">
                      <p className="text-[11px] text-slate-500 font-medium">{user?.role}</p>
                      {user?.role === 'Admin' && (
                        <span className="ml-1 inline-flex items-center rounded-full bg-indigo-100 px-1.5 py-0.5 text-[9px] font-medium text-indigo-700">PRO</span>
                      )}
                    </div>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-0.5" />
                </Button>
              </motion.div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 mt-1 animate-in fade-in-50 zoom-in-95 bg-white/90 backdrop-blur-md border border-slate-200/70 rounded-xl overflow-hidden shadow-xl">
              <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50">
                <p className="text-sm font-medium text-slate-800">{user?.username}</p>
                <p className="text-xs text-slate-500">{user?.role}</p>
              </div>
              <DropdownMenuSeparator className="bg-slate-200/50" />
              <DropdownMenuItem 
                className="cursor-pointer flex items-center px-4 py-2.5 text-sm hover:bg-indigo-50 transition-colors" 
                onClick={() => navigate('/dashboard/profile')}
              >
                <User className="mr-2 h-4 w-4 text-indigo-500" />
                <span className="text-slate-700">Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer flex items-center px-4 py-2.5 text-sm hover:bg-indigo-50 transition-colors" 
                onClick={() => navigate('/dashboard/settings')}
              >
                <Settings className="mr-2 h-4 w-4 text-indigo-500" />
                <span className="text-slate-700">Configuración</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer flex items-center px-4 py-2.5 text-sm hover:bg-indigo-50 transition-colors" 
                onClick={() => navigate('/dashboard/help')}
              >
                <HelpCircle className="mr-2 h-4 w-4 text-indigo-500" />
                <span className="text-slate-700">Ayuda</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-200/50" />
              <DropdownMenuItem 
                className="cursor-pointer flex items-center px-4 py-2.5 text-sm hover:bg-red-50 transition-colors group"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4 text-red-500 group-hover:text-red-600" />
                <span className="text-red-500 group-hover:text-red-600">Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  )
}