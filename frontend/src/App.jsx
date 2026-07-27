import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Prediction from "./pages/Prediction";
import ImageAI from "./pages/ImageAI";
import Donate from "./pages/Donate";
import NGOFinder from "./pages/NGOFinder";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Chatbot from "./pages/Chatbot";
import Settings from "./pages/Settings";
import About from "./pages/About";
import Landing from "./pages/Landing";

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-8 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/app/home" replace /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to="/app/home" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/app/home" replace /> : <Register />} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="home" element={<Home />} />
        <Route path="predict" element={<Prediction />} />
        <Route path="image-ai" element={<ImageAI />} />
        <Route path="donate" element={<Donate />} />
        <Route path="ngo-finder" element={<NGOFinder />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="history" element={<History />} />
        <Route path="chatbot" element={<Chatbot />} />
        <Route path="settings" element={<Settings />} />
        <Route path="about" element={<About />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
