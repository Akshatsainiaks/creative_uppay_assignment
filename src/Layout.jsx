import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  const [open, setOpen] = useState(true);

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar open={open} setOpen={setOpen} />

      <div className="flex-1">
        <Topbar open={open} />
        
        <main
          className={`pt-32 pr-10 transition-all duration-300 ${
            open ? "pl-80" : "pl-28"
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
