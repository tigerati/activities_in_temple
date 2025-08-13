import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import LegacyMemberCheck from "./pages/LegacyMemberCheck";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ActivityRegistrants from "./pages/ActivityRegistrants";
import RegisteredActivities from "./pages/RegisteredActivities";
import ActivitySuccess from "./pages/ActivitySuccess";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import ManageActivities from "./pages/ManageActivities";
import ActivityForm from "./pages/ActivityForm";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import RegisterLegacy from "./pages/RegisterLegacy";
import AdminLegacyLookup from "./pages/AdminLegacyLookup";
import ActivityRegister from "./pages/ActivityRegister";
import AudioLibrary from "./pages/AudioLibrary";

import { getToken, clearToken, isExpired, millisUntilExpiry } from "./auth";

function AppShell() {
  const navigate = useNavigate();

  useEffect(() => {
    const logout = () => {
      clearToken();
      navigate("/login", { replace: true });
    };

    // 1) Immediate check + schedule auto-logout at exp time
    let timeoutId = null;
    const token = getToken();
    if (token) {
      if (isExpired(token)) {
        logout();
      } else {
        timeoutId = setTimeout(logout, millisUntilExpiry(token));
      }
    }

    // 2) Attach token & preflight expiry check on each request
    const reqId = axios.interceptors.request.use(
      (config) => {
        const t = getToken();
        if (t) {
          if (isExpired(t)) {
            logout();
            return Promise.reject(new axios.Cancel("Token expired"));
          }
          config.headers.Authorization = `Bearer ${t}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 3) Auto-logout on any 401 from server
    const resId = axios.interceptors.response.use(
      (resp) => resp,
      (error) => {
        const status = error?.response?.status;
        if (status === 401) logout();
        return Promise.reject(error);
      }
    );

    // 4) Cross-tab logout sync (optional but nice)
    const onStorage = (e) => {
      if (e.key === "token" && !e.newValue) {
        // token removed in another tab
        navigate("/login", { replace: true });
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      axios.interceptors.request.eject(reqId);
      axios.interceptors.response.eject(resId);
      window.removeEventListener("storage", onStorage);
    };
  }, [navigate]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <main style={{ flex: "1 0 auto" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ActivityRegistrants/:id" element={<ActivityRegistrants />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/RegisteredActivities" element={<RegisteredActivities />} />
          <Route path="/activity/:id/success" element={<ActivitySuccess />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/manage-activities" element={<ManageActivities />} />
          <Route path="/admin/activities/new" element={<ActivityForm />} />
          <Route path="/admin/activities/:id/edit" element={<ActivityForm />} />
          <Route path="/admin/activities/:id/registrants" element={<ActivityRegistrants />} />
          <Route path="/activity/:id/register" element={<ActivityRegister />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/admin/legacy-lookup" element={<AdminLegacyLookup />} />
          <Route path="/audio-library" element={<AudioLibrary />} />
          <Route path="/register-legacy" element={<RegisterLegacy />} />
          <Route path="/legacy/check" element={<LegacyMemberCheck />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}
