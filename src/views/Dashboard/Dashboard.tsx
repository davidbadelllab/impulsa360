import DashboardLayout from "../../components/Layout/DashboardLayout"
import { Outlet } from "react-router-dom"
import DashboardPage from "./DashboardPage"
import UserPage from "./UserPage"
import CompanyPage from "./CompanyPage"
import UtilitiesPage from "./UtilitiesPage"
import SettingsPage from "./SettingsPage"
import MessagesPage from "./MessagesPage"
import AnalyticsPage from "./AnalyticsPage"
import IntegrationsPage from "./IntegrationsPage"
import ProfilePage from "./ProfilePage"
import HelpPage from "./HelpPage"
import { useAuth } from "../../context/AuthContext"

export default function Dashboard() {
  const { currentUser } = useAuth();
  
  // Definir un objeto de usuario con estructura adecuada para el layout
  const user = {
    username: currentUser?.username || "Usuario",
    role: currentUser?.role || "Usuario"
  }

  return (
    <DashboardLayout user={user}>
      <Outlet />
    </DashboardLayout>
  )
}

export const dashboardRoutes = [
  {
    path: "",
    element: <DashboardPage />
  },
  {
    path: "User",
    element: <UserPage />
  },
  {
    path: "Company",
    element: <CompanyPage />
  },
  {
    path: "utilities",
    element: <UtilitiesPage />
  },
  {
    path: "settings",
    element: <SettingsPage />
  },
  {
    path: "messages",
    element: <MessagesPage />
  },
  {
    path: "analytics",
    element: <AnalyticsPage />
  },
  {
    path: "integrations",
    element: <IntegrationsPage />
  },
  {
    path: "profile",
    element: <ProfilePage />
  },
  {
    path: "help",
    element: <HelpPage />
  }
]
