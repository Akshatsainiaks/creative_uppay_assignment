import React from "react";
import { Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import DashboardLayout from "./pages/Dashboard"; 
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Messages from "./pages/Messages";
import Tasks from "./pages/Tasks";
import Members from "./pages/Members";
import Settings from "./pages/Settings";

import Board from "./components/Board"; 

import WebsiteRedesign from "./pages/WebsiteRedesign";
import DesignSystem from "./pages/DesignSystem";
import Wireframes from "./pages/Wireframes";
import ProjectPage from "./pages/ProjectPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />


      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
   
        <Route path="/dashboard" element={<Board />} />


        <Route path="/home" element={<Home />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/members" element={<Members />} />
        <Route path="/settings" element={<Settings />} />

     
        <Route path="/website-redesign" element={<WebsiteRedesign />} />
        <Route path="/design-system" element={<DesignSystem />} />
        <Route path="/wireframes" element={<Wireframes />} />
         <Route path="/:project" element={<ProjectPage />} />
      </Route>
    </Routes>
  );
}
