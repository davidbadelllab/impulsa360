import React, { useState, useEffect } from "react"
import { NavLink } from "react-router-dom"
import {
  ChevronDown,
  Clock,
  LayoutDashboard,
  MessageSquare,
  User2,
  Users,
  Zap,
  ArrowLeft,
  ArrowRight,
  Plus,
  Sparkles,
  Building,
  HardDrive,
  CheckSquare,
  Video,
  BookOpen,
  FileText,
  Eye,
  Edit3,
  Settings
} from "lucide-react"
import { Button } from "../ui/button"
import { motion, AnimatePresence } from "framer-motion"
import AdminSubmenu from "./AdminSubmenu"
import RRHHSubmenu from "./RRHHSubmenu"

interface DashboardSidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export default function DashboardSidebar({ isOpen, onToggle }: DashboardSidebarProps) {
  const [activeLink, setActiveLink] = useState("/dashboard")
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)
  const [expandedAdmin, setExpandedAdmin] = useState(false)
  const [expandedRRHH, setExpandedRRHH] = useState(false)
  
  // Handle route change to update active link
  useEffect(() => {
    const path = window.location.pathname
    setActiveLink(path)
    
    // Auto-expand admin submenu when on admin routes
    if (path.includes('/dashboard/') && path !== '/dashboard' && !path.includes('/dashboard/rrhh/')) {
      setExpandedAdmin(true)
      setExpandedRRHH(false)
    } else if (path.includes('/dashboard/rrhh/')) {
      setExpandedRRHH(true)
      setExpandedAdmin(false)
    } else if (path === '/dashboard') {
      setExpandedAdmin(false)
      setExpandedRRHH(false)
    }
  }, [activeLink])

  // Check if current route is an admin route
  const isAdminRoute = activeLink.includes('/dashboard/') && activeLink !== '/dashboard' && !activeLink.includes('/dashboard/rrhh/')
  
  // Check if current route is an RRHH route
  const isRRHHRoute = activeLink.includes('/dashboard/rrhh/')

  const navItems = [
    { path: "/dashboard", icon: <LayoutDashboard />, label: "Dashboard" },
  ]



  return (
    <>
      <motion.div
        initial={{ width: isOpen ? "220px" : "80px" }}
        animate={{ width: isOpen ? "220px" : "80px" }}
        transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
        style={{ maxHeight: "calc(100vh - 40px)" }}
        className="h-auto bg-gradient-to-br from-indigo-800 via-purple-700 to-purple-600 text-white flex flex-col rounded-[30px] shadow-2xl relative overflow-hidden my-5 border border-indigo-500/30 backdrop-blur-sm"
      >
      {/* Logo or app brand section */}
      <div className="mt-6 mb-4 px-5 flex items-center justify-center">
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          className="bg-white/10 backdrop-blur-md rounded-full p-2 shadow-inner border border-white/10"
        >
          <Sparkles className="h-6 w-6 text-purple-100" />
        </motion.div>
        {isOpen && (
          <motion.h2
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="ml-3 font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-100 to-indigo-200"
          >
            IMPULSA 360
          </motion.h2>
        )}
      </div>

      {/* Toggle button with advanced styling */}
      <motion.button 
        onClick={onToggle}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="absolute -right-3 top-24 bg-gradient-to-r from-indigo-400 to-purple-400 text-white rounded-full p-1.5 shadow-lg z-10 border border-white/20"
      >
        {isOpen ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
      </motion.button>

      {/* Navigation with improved styling */}
      <nav className="flex-1 px-4 py-5 space-y-2 overflow-y-auto custom-scrollbar">
        {/* Dashboard Principal */}
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              group relative flex items-center px-3 py-2.5 rounded-xl transition-all duration-300
              ${isActive 
                ? "bg-gradient-to-r from-white/90 to-white/80 text-purple-800 font-medium shadow-xl border border-white/40" 
                : "text-white hover:bg-white/10 border border-transparent"
              }
            `}
            onMouseEnter={() => setHoveredLink(item.path)}
            onMouseLeave={() => setHoveredLink(null)}
            onClick={() => setActiveLink(item.path)}
          >
            {/* Animated background for hover effect */}
            {hoveredLink === item.path && !activeLink.includes(item.path) && (
              <motion.div 
                layoutId="hoverBg"
                className="absolute inset-0 bg-white/10 rounded-xl border border-white/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}

            {/* Icon with improved animation */}
            <motion.div 
              whileHover={{ scale: 1.15, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className={`w-5 h-5 flex items-center justify-center ${activeLink.includes(item.path) ? "text-purple-700" : "text-purple-100"}`}
            >
              {item.icon}
            </motion.div>

            {/* Label with conditional rendering based on sidebar state */}
            <AnimatePresence>
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={`ml-3 text-xs font-medium tracking-wide ${activeLink.includes(item.path) ? "text-purple-800" : "text-purple-100"}`}
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}

        {/* Sección de Administración */}
        <div className="mt-8 mb-2 text-xs font-bold text-indigo-200 uppercase tracking-wider pl-2">Admin</div>
        
        {/* Administración Principal */}
        <div
          className={`
            group relative flex items-center px-3 py-2.5 rounded-xl transition-all duration-300 cursor-pointer
            ${expandedAdmin || isAdminRoute
              ? "bg-gradient-to-r from-white/90 to-white/80 text-purple-800 font-medium shadow-xl border border-white/40" 
              : "text-white hover:bg-white/10 border border-transparent"
            }
          `}
          onClick={() => setExpandedAdmin(!expandedAdmin)}
        >
          <motion.div 
            whileHover={{ scale: 1.15, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className={`w-5 h-5 flex items-center justify-center ${expandedAdmin || isAdminRoute ? "text-purple-700" : "text-purple-100"}`}
          >
            <Settings />
          </motion.div>
          <AnimatePresence>
            {isOpen && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`ml-3 text-xs font-medium tracking-wide flex-1 ${expandedAdmin || isAdminRoute ? "text-purple-800" : "text-purple-100"}`}
              >
                Administración
              </motion.span>
            )}
          </AnimatePresence>
          
          {/* Botón expandir/colapsar */}
          {isOpen && (
            <motion.div
              animate={{ rotate: expandedAdmin ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-3 w-3 text-purple-100" />
            </motion.div>
          )}
        </div>

        {/* Sección de RRHH */}
        <div className="mt-4 mb-2 text-xs font-bold text-indigo-200 uppercase tracking-wider pl-2">RRHH</div>
        
        {/* RRHH Principal */}
        <div
          className={`
            group relative flex items-center px-3 py-2.5 rounded-xl transition-all duration-300 cursor-pointer
            ${expandedRRHH || isRRHHRoute
              ? "bg-gradient-to-r from-white/90 to-white/80 text-blue-800 font-medium shadow-xl border border-white/40" 
              : "text-white hover:bg-white/10 border border-transparent"
            }
          `}
          onClick={() => setExpandedRRHH(!expandedRRHH)}
        >
          <motion.div 
            whileHover={{ scale: 1.15, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className={`w-5 h-5 flex items-center justify-center ${expandedRRHH || isRRHHRoute ? "text-blue-700" : "text-blue-100"}`}
          >
            <Users />
          </motion.div>
          <AnimatePresence>
            {isOpen && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`ml-3 text-xs font-medium tracking-wide flex-1 ${expandedRRHH || isRRHHRoute ? "text-blue-800" : "text-blue-100"}`}
              >
                RRHH
              </motion.span>
            )}
          </AnimatePresence>
          
          {/* Botón expandir/colapsar */}
          {isOpen && (
            <motion.div
              animate={{ rotate: expandedRRHH ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-3 w-3 text-blue-100" />
            </motion.div>
          )}
        </div>
      </nav>
    </motion.div>

    {/* Componente de Submenú de Administración */}
    <AdminSubmenu 
      isVisible={expandedAdmin} 
      onClose={() => setExpandedAdmin(false)}
      isSidebarOpen={isOpen}
    />

    {/* Componente de Submenú de RRHH */}
    <RRHHSubmenu 
      isVisible={expandedRRHH} 
      onClose={() => setExpandedRRHH(false)}
      isSidebarOpen={isOpen}
    />
  </>
  )
}