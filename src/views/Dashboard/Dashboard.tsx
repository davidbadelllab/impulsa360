import React from "react"
import DashboardLayout from "../../components/Layout/DashboardLayout"
import { Outlet } from "react-router-dom"
import DashboardPage from "./DashboardPage"
import UserPage from "./UserPage"
import CompanyPage from "./CompanyPage"
import UtilitiesPage from "./UtilitiesPage"
import TaskPage from "./TaskPage"
import SettingsPage from "./SettingsPage"
import MessagesPage from "./MessagesPage"
import MediaPage from "./MediaPage"
import AnalyticsPage from "./AnalyticsPage"
import IntegrationsPage from "./IntegrationsPage"
import ProfilePage from "./ProfilePage"
import HelpPage from "./HelpPage"
import PlansPage from './PlansPage';
import CompanyPlansPage from './CompanyPlansPage';
import VideoConferencePage from './VideoConferencePage';
import BlogAdmin from './BlogAdmin';
import BlogCreateEdit from './BlogCreateEdit';
import BlogDetail from './BlogDetail';
import BriefingsIndex from '../Briefings/BriefingsIndex';
import BriefingShow from '../Briefings/BriefingShow';
import BriefingCreate from '../Briefings/BriefingCreate';
import BriefingEdit from '../Briefings/BriefingEdit';
import BriefingGenerate from '../Briefings/BriefingGenerate';
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
    path: "tasks",
    element: <TaskPage />
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
    path: "media",
    element: <MediaPage />
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
  },
  {
    path: 'plans',
    element: <PlansPage />
  },
  {
    path: 'companies/:companyId/plans',
    element: <CompanyPlansPage />
  },
  {
    path: 'blog',
    element: <BlogAdmin />
  },
  {
    path: 'blog/create',
    element: <BlogCreateEdit />
  },
  {
    path: 'blog/edit/:id',
    element: <BlogCreateEdit />
  },
  {
    path: 'blog/view/:id',
    element: <BlogDetail />
  },
  {
    path: 'videoconference',
    element: <VideoConferencePage />
  },
  {
    path: 'briefings',
    element: <BriefingsIndex />
  },
  {
    path: 'briefings/create',
    element: <BriefingCreate />
  },
  {
    path: 'briefings/:id',
    element: <BriefingShow />
  },
  {
    path: 'briefings/:id/edit',
    element: <BriefingEdit />
  },
  {
    path: 'briefings/generate',
    element: <BriefingGenerate />
  }
]
