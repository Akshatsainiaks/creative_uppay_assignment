import React, { useState, useRef, useEffect } from "react";
import { useUser, UserButton } from "@clerk/clerk-react";
import SearchIcon from "@mui/icons-material/Search";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

export default function Topbar({ open }) {
  const { user } = useUser();
  const state = user?.unsafeMetadata?.state || "Rajasthan";
  const country = user?.unsafeMetadata?.country || "India";

  const [clock, setClock] = useState("");
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, "0");
      const m = now.getMinutes().toString().padStart(2, "0");
      const s = now.getSeconds().toString().padStart(2, "0");
      setClock(`${h}:${m}:${s}`);
    };
    updateClock();
    const t = setInterval(updateClock, 1000);
    return () => clearInterval(t);
  }, []);

  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
  const weeks = [];
  let day = 1;
  for (let i = 0; i < 6; i++) {
    let row = [];
    for (let j = 0; j < 7; j++) {
      row.push((i === 0 && j < firstDay) || day > daysInMonth ? "" : day++);
    }
    weeks.push(row);
  }

  const [showCalendar, setShowCalendar] = useState(false);
  const [showNoti, setShowNoti] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const calendarRef = useRef(null);
  const toggleRef = useRef(null);
  const notiRef = useRef(null);
  const helpRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (
        calendarRef.current?.contains(e.target) ||
        toggleRef.current?.contains(e.target) ||
        notiRef.current?.contains(e.target) ||
        helpRef.current?.contains(e.target)
      ) return;
      setShowCalendar(false);
      setShowNoti(false);
      setShowHelp(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const prevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((y) => y - 1);
    } else setSelectedMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((y) => y + 1);
    } else setSelectedMonth((m) => m + 1);
  };

  const [notifications, setNotifications] = useState([
    { id: 1, text: "Welcome back! Check your tasks.", time: "Just now" },
    { id: 2, text: "Daily standup at 10:00 AM", time: "1 hr ago" }
  ]);

  useEffect(() => {
    const demoInterval = setInterval(() => {
      const rnd = Math.floor(Math.random() * 1000);
      const samples = [
        `New comment on task #${rnd}`,
        `Project updated: Mobile App`,
        `You were mentioned by Alex`,
        `New file uploaded to Design System`
      ];
      const pick = samples[Math.floor(Math.random() * samples.length)];
      setNotifications((s) => [{ id: Date.now(), text: pick, time: "Just now" }, ...s].slice(0, 10));
    }, 12000);
    return () => clearInterval(demoInterval);
  }, []);

  return (
    <header
      className={`fixed top-0 right-0 h-[88px] bg-white flex items-center justify-between border-b border-gray-200 z-40 transition-all duration-300 ${
        open ? "left-72" : "left-20"
      } px-10`}
    >
      <div className="relative w-[520px]">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          placeholder="Search for anything..."
          className="w-full pl-12 pr-4 h-12 rounded-xl bg-gray-50 border border-gray-300"
        />
      </div>

      <div className="flex items-center gap-6 relative">
        <div ref={helpRef} className="relative">
          <HelpOutlineIcon
            onClick={(e) => {
              e.stopPropagation();
              setShowHelp((s) => !s);
              setShowNoti(false);
              setShowCalendar(false);
            }}
            className="cursor-pointer text-gray-700 hover:text-black"
            fontSize="medium"
          />
          {showHelp && (
            <div className="absolute right-0 top-12 bg-white shadow-xl border rounded-xl w-56 p-3 z-50">
              <h4 className="font-semibold text-gray-800 mb-2">Help & Support</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="hover:text-indigo-600 cursor-pointer">How to use Dashboard</li>
                <li className="hover:text-indigo-600 cursor-pointer">Report a bug</li>
                <li className="hover:text-indigo-600 cursor-pointer">Contact Support</li>
              </ul>
            </div>
          )}
        </div>

        <div ref={notiRef} className="relative">
          <NotificationsNoneIcon
            onClick={(e) => {
              e.stopPropagation();
              setShowNoti((s) => !s);
              setShowHelp(false);
              setShowCalendar(false);
            }}
            className="cursor-pointer text-gray-700 hover:text-black"
            fontSize="medium"
          />
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1 rounded-full">
            {notifications.length}
          </span>
          {showNoti && (
            <div className="absolute right-0 top-12 bg-white shadow-xl border rounded-xl w-80 p-3 z-50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800">Notifications</h4>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setNotifications([]);
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              </div>
              <div className="max-h-56 overflow-auto">
                {notifications.length === 0 ? (
                  <div className="text-sm text-gray-500">No notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="p-2 rounded-lg hover:bg-gray-100">
                      <div className="text-sm text-gray-800">{n.text}</div>
                      <div className="text-xs text-gray-500">{n.time}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div ref={toggleRef} className="relative">
          <CalendarMonthOutlinedIcon
            onClick={(e) => {
              e.stopPropagation();
              if (!showCalendar) {
                setSelectedYear(today.getFullYear());
                setSelectedMonth(today.getMonth());
              }
              setShowCalendar((s) => !s);
              setShowNoti(false);
              setShowHelp(false);
            }}
            className="cursor-pointer text-gray-700 hover:text-black"
            fontSize="medium"
          />
          {showCalendar && (
            <div ref={calendarRef} className="absolute right-0 top-12 bg-white shadow-xl border rounded-xl p-4 w-80 z-50">
              <div className="flex flex-col items-center mb-3">
                <div className="text-lg font-semibold">
                  {months[selectedMonth]} {selectedYear}
                </div>
                <div className="text-sm text-purple-600 font-bold">{clock}</div>
              </div>

              <div className="flex items-center justify-between mb-2 px-2">
                <button onClick={(e) => { e.stopPropagation(); prevMonth(); }} className="text-xl">❮</button>
                <button onClick={(e) => { e.stopPropagation(); nextMonth(); }} className="text-xl">❯</button>
              </div>

              <div className="grid grid-cols-7 text-xs font-semibold text-gray-500 mb-2 text-center">
                <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div>
                <div>Thu</div><div>Fri</div><div>Sat</div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-sm">
                {weeks.flat().map((d, i) => (
                  <div
                    key={i}
                    className={`h-8 flex items-center justify-center rounded-lg ${
                      d === today.getDate() &&
                      selectedMonth === today.getMonth() &&
                      selectedYear === today.getFullYear()
                        ? "bg-purple-600 text-white"
                        : "text-gray-700"
                    }`}
                  >
                    {d}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right leading-tight">
              <div className="text-sm font-medium">{user.fullName}</div>
              <div className="text-xs text-gray-500">{state}, {country}</div>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        )}
      </div>
    </header>
  );
}
