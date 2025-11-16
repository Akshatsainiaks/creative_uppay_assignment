// src/components/ActivityLog.jsx
import React from "react";
import { useSelector } from "react-redux";

export default function ActivityLog({ taskId }) {
  const activities = useSelector((s) => s.tasks.activities || []);
  const list = taskId ? activities.filter((a) => a.taskId === taskId) : activities;
  const sorted = [...list].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  return (
    <aside className="w-full bg-white border-t border-gray-200 p-4 mt-6 rounded-lg">
      <h4 className="font-semibold mb-3">Activity</h4>
      <div className="space-y-3 max-h-[40vh] overflow-y-auto">
        {sorted.length === 0 ? (
          <div className="text-sm text-gray-500">No activity yet.</div>
        ) : (
          sorted.map((a) => (
            <div key={a.id} className="text-sm">
              <div className="text-gray-700">{a.text}</div>
              <div className="text-xs text-gray-400">{new Date(a.time).toLocaleString()}</div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
