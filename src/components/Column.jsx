// src/components/Column.jsx
import React, { useState } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  onOpenComments
}) {
  const [openMenu, setOpenMenu] = useState(false);

  const priorityStyle = {
    High: "bg-red-50 text-red-600",
    Low: "bg-yellow-50 text-yellow-600",
    Completed: "bg-green-50 text-green-600",
  }[task.priority] || "bg-gray-100 text-gray-700";

  const members = [
    { img: 5 },
    { img: 12 },
    { img: 22 }
  ];

  return (
    <div className="relative group cursor-pointer overflow-visible">

      {/* Hover outline effect */}
      <div
        className="
          absolute inset-0 rounded-2xl border-2 border-dashed border-[#7B61FF]
          opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-0
        "
      />

      {/* Card */}
      <div
        className="
          relative z-10 bg-white rounded-2xl shadow-sm p-5 border border-gray-100
          transition-all duration-300 ease-out group-hover:-translate-y-2 group-hover:shadow-xl
        "
      >
        {/* Top Row */}
        <div className="flex justify-between items-start">
          <span className={`px-3 py-1 text-xs font-semibold rounded-lg ${priorityStyle}`}>
            {task.priority}
          </span>

          {/* 3-Dot Menu */}
          <div className="relative">
            <button
              onClick={() => setOpenMenu(!openMenu)}
              className="p-1 rounded hover:bg-gray-100"
            >
              <MoreVertIcon fontSize="small" />
            </button>

            {openMenu && (
              <div
                className="
                  absolute right-0 mt-2 bg-white border rounded-xl shadow-lg w-40 z-50
                "
              >
                {/* Edit */}
                <button
                  onClick={() => {
                    setOpenMenu(false);
                    onEdit();
                  }}
                  className="w-full px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Edit
                </button>

                {/* Delete */}
                <button
                  onClick={() => {
                    setOpenMenu(false);
                    onDelete();
                  }}
                  className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <h4 className="mt-3 font-semibold text-lg text-[#1B1B3A]">
          {task.title}
        </h4>

        {/* Description */}
        {task.description && (
          <p className="text-sm text-gray-500 mt-1">{task.description}</p>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center mt-4">
          
          {/* Members */}
          <div className="flex -space-x-2">
            {members.map((m, i) => (
              <img
                key={i}
                src={`https://i.pravatar.cc/40?img=${m.img}`}
                className="w-7 h-7 rounded-full border border-white"
              />
            ))}
          </div>

          {/* Comments + Files */}
          <div className="flex items-center gap-4 text-gray-400 text-xs">
            <button
              onClick={() => onOpenComments(task.id)}
              className="flex items-center gap-1 hover:text-gray-700"
            >
              <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 16 }} />
              <span>{task.comments?.length || 0} comments</span>
            </button>

            <div className="flex items-center gap-1">
              <AttachFileOutlinedIcon sx={{ fontSize: 16 }} />
              <span>{task.filesCount || 0} files</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
