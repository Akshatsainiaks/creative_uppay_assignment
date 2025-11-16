import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react"; // ✔ Clerk logout

import ThoughtsBox from "./ThoughtsBox";

import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function Sidebar({ open, setOpen }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { signOut } = useClerk(); // ✔ Clerk signOut

  const menuActive = (route) =>
    pathname === route
      ? "font-semibold text-gray-900"
      : "text-gray-600 hover:text-gray-800";

  const projectActive = (route) =>
    pathname === route
      ? "bg-[#F1ECFF] text-indigo-700 font-medium"
      : "hover:bg-gray-100 text-gray-700";

  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("projects"));
    if (saved) setProjects(saved);
  }, []);

  const saveProjects = (list) => {
    localStorage.setItem("projects", JSON.stringify(list));
    setProjects(list);
  };

  const addProject = () => {
    let name = prompt("Enter project name:");
    if (!name) return;

    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const newProject = { name, slug };

    const updated = [...projects, newProject];
    saveProjects(updated);
    navigate(`/${slug}`);
  };

  const renameProject = (slug) => {
    let newName = prompt("Enter new project name:");
    if (!newName) return;

    const newSlug = newName.toLowerCase().replace(/\s+/g, "-");

    const updated = projects.map((p) =>
      p.slug === slug ? { ...p, name: newName, slug: newSlug } : p
    );

    saveProjects(updated);
    navigate(`/${newSlug}`);
  };

  const deleteProject = (slug) => {
    if (!window.confirm("Delete this project?")) return;

    const updated = projects.filter((p) => p.slug !== slug);
    saveProjects(updated);
    navigate("/dashboard");
  };

  // ✔ Correct logout for Clerk
  const logout = async () => {
    await signOut();
    navigate("/", { replace: true }); // go to landing page
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 overflow-y-auto ${
        open ? "w-72" : "w-20"
      }`}
    >
      {/* HEADER */}
      <div className="h-[88px] flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-600"></div>
          {open && <h2 className="text-lg font-semibold">Project M.</h2>}
        </div>

        <button className="text-xl" onClick={() => setOpen(!open)}>
          {open ? "❮" : "❯"}
        </button>
      </div>

      <div className="border-b border-gray-200"></div>

      {/* MAIN MENU */}
      <ul className="px-6 py-6 space-y-4">
        <li key="home">
          <Link to="/home" className={`flex items-center gap-4 ${menuActive("/home")}`}>
            <HomeOutlinedIcon fontSize="small" />
            {open && "Home"}
          </Link>
        </li>

        <li key="messages">
          <Link
            to="/messages"
            className={`flex items-center gap-4 ${menuActive("/messages")}`}
          >
            <ChatBubbleOutlineOutlinedIcon fontSize="small" />
            {open && "Messages"}
          </Link>
        </li>

        <li key="tasks">
          <Link
            to="/tasks"
            className={`flex items-center gap-4 ${menuActive("/tasks")}`}
          >
            <AssignmentOutlinedIcon fontSize="small" />
            {open && "Tasks"}
          </Link>
        </li>

        <li key="members">
          <Link
            to="/members"
            className={`flex items-center gap-4 ${menuActive("/members")}`}
          >
            <GroupOutlinedIcon fontSize="small" />
            {open && "Members"}
          </Link>
        </li>

        <li key="settings">
          <Link
            to="/settings"
            className={`flex items-center gap-4 ${menuActive("/settings")}`}
          >
            <SettingsOutlinedIcon fontSize="small" />
            {open && "Settings"}
          </Link>
        </li>
      </ul>

      {/* PROJECTS */}
      {open && (
        <div className="px-6 mt-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-gray-500">MY PROJECTS</h4>
            <button onClick={addProject} className="text-gray-500 hover:text-indigo-600">
              <AddIcon fontSize="small" />
            </button>
          </div>

          <ul className="space-y-1 mt-3">
            {/* Default project */}
            <li key="mobile-app">
              <Link
                to="/dashboard"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer ${projectActive(
                  "/dashboard"
                )}`}
              >
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                Mobile App
              </Link>
            </li>

            {/* Dynamic Projects */}
            {projects.map((p) => (
              <li
                key={p.slug}
                className={`flex items-center justify-between px-3 py-2 rounded-lg ${projectActive(
                  `/${p.slug}`
                )}`}
              >
                <Link to={`/${p.slug}`} className="flex items-center gap-3 flex-1">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  {p.name}
                </Link>

                <div className="flex items-center gap-2 ml-2">
                  <EditIcon
                    fontSize="small"
                    className="text-gray-400 hover:text-indigo-600 cursor-pointer"
                    onClick={() => renameProject(p.slug)}
                  />
                  <DeleteIcon
                    fontSize="small"
                    className="text-gray-400 hover:text-red-600 cursor-pointer"
                    onClick={() => deleteProject(p.slug)}
                  />
                </div>
              </li>
            ))}

            {/* Static Figma projects */}
            <li key="website-redesign">
              <Link
                to="/website-redesign"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer ${projectActive(
                  "/website-redesign"
                )}`}
              >
                <span className="w-2 h-2 rounded-full bg-yellow-400" />
                Website Redesign
              </Link>
            </li>

            <li key="design-system">
              <Link
                to="/design-system"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer ${projectActive(
                  "/design-system"
                )}`}
              >
                <span className="w-2 h-2 rounded-full bg-pink-500" />
                Design System
              </Link>
            </li>

            <li key="wireframes">
              <Link
                to="/wireframes"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer ${projectActive(
                  "/wireframes"
                )}`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Wireframes
              </Link>
            </li>
          </ul>
        </div>
      )}

      {/* Thoughts Box */}
      {open && (
        <div className="px-6 mt-10">
          <ThoughtsBox />
        </div>
      )}

      {/* LOGOUT */}
      <li
        key="logout"
        className="list-none px-6 py-4 mt-10 cursor-pointer flex items-center gap-3 text-gray-600 hover:text-red-600"
        onClick={logout}
      >
        <LogoutIcon fontSize="small" />
        {open && "Logout"}
      </li>
    </aside>
  );
}
