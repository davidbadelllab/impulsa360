import React, { useState, useEffect } from "react"
import { NavLink } from "react-router-dom"
import {
  ChevronDown,
  Clock,
  LayoutDashboard,
  MessageSquare,
  User2,
  Zap,
  ArrowLeft,
  ArrowRight,
  Plus,
  Sparkles,
  Building,
  HardDrive,
  CheckSquare,
  Video,
  BookOpen
} from "lucide-react"
import { Button } from "../ui/button"
import { motion, AnimatePresence } from "framer-motion"

interface DashboardSidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export default function DashboardSidebar({ isOpen, onToggle }: DashboardSidebarProps) {
  const [activeLink, setActiveLink] = useState("/dashboard")
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)
  
  // Handle route change to update active link
  useEffect(() => {
    const path = window.location.pathname
    setActiveLink(path)
  }, [])

  const navItems = [
    { path: "/dashboard", icon: <LayoutDashboard />, label: "Dashboard" },
    { path: "/dashboard/User", icon: <User2 />, label: "Users" },
    { path: "/dashboard/Company", icon: <Building />, label: "Company" },
    { path: "/dashboard/utilities", icon: <Zap />, label: "Booking" },
    { path: "/dashboard/tasks", icon: <CheckSquare />, label: "Tasks" },
    { path: "/dashboard/messages", icon: <MessageSquare />, label: "Messages" },
    { path: "/dashboard/media", icon: <HardDrive />, label: "Media" },
    { path: "/dashboard/blog", icon: <BookOpen />, label: "Blog" },
    { path: "/dashboard/videoconference", icon: <Video />, label: "Videoconferencias" },
  ]

  return (
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

            {/* Badge with improved styling */}
          </NavLink>
        ))}

        {/* Sección de administración */}
        <div className="mt-8 mb-2 text-xs font-bold text-indigo-200 uppercase tracking-wider pl-2">Administración</div>
        <NavLink
          to="/dashboard/plans"
          className={({ isActive }) => `
            group relative flex items-center px-3 py-2.5 rounded-xl transition-all duration-300
            ${isActive 
              ? "bg-gradient-to-r from-white/90 to-white/80 text-purple-800 font-medium shadow-xl border border-white/40" 
              : "text-white hover:bg-white/10 border border-transparent"
            }
          `}
        >
          <motion.div 
            whileHover={{ scale: 1.15, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="w-5 h-5 flex items-center justify-center text-purple-100"
          >
            <HardDrive />
          </motion.div>
          <AnimatePresence>
            {isOpen && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="ml-3 text-xs font-medium tracking-wide text-purple-100"
              >
                Planes
              </motion.span>
            )}
          </AnimatePresence>
        </NavLink>
      </nav>

      {/* Quick Action Button */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-4 my-3"
        >
          <Button 
            className="w-full bg-gradient-to-r from-indigo-400 to-purple-500 hover:from-indigo-500 hover:to-purple-600 text-white rounded-xl border border-white/10 shadow-lg py-1 transition-all duration-300 group"
          >
            <Plus size={16} className="mr-1 group-hover:rotate-90 transition-transform duration-300" /> 
            <span className="text-xs">Create New</span>
          </Button>
        </motion.div>
      )}

      {/* History Section with improved design */}
      <div className="mt-auto mx-4 mb-6">
        <motion.div 
          className="bg-white/5 backdrop-blur-sm rounded-xl p-3 shadow-inner border border-white/10 overflow-hidden"
          whileHover={{ y: -2, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-indigo-200" />
              <AnimatePresence>
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-xs font-medium text-indigo-100"
                  >
                    Recent Activity
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            {isOpen && (
              <Button variant="ghost" size="icon" className="h-5 w-5 text-indigo-100 hover:bg-white/10 rounded-full">
                <ChevronDown className="h-3 w-3" />
              </Button>
            )}
          </div>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2"
              >
                <div className="text-xs text-indigo-200 flex items-center py-1 px-2 rounded-lg hover:bg-white/5 transition-colors duration-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 mr-2"></div>
                  Last transaction completed
                </div>
                <div className="text-xs text-indigo-200 flex items-center py-1 px-2 rounded-lg hover:bg-white/5 transition-colors duration-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 mr-2"></div>
                  Report generated
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  )
}