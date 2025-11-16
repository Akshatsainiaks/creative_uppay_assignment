import React, { useState, useEffect } from "react";
import LightbulbIcon from "@mui/icons-material/Lightbulb";

export default function ThoughtsBox() {
  const [thought, setThought] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("thought-message");
    if (saved) setThought(saved);
  }, []);

  const saveThought = () => {
    localStorage.setItem("thought-message", thought);
    setEditing(false);
  };

  return (
    <div className="bg-[#F7F7F7] rounded-xl shadow p-4 flex flex-col items-center text-center relative">

      {/* Smaller glowing bulb */}
      <div className="absolute -top-5 flex justify-center w-full">
        <div className="w-12 h-12 rounded-full flex items-center justify-center 
                        bg-yellow-200/40 shadow-[0_0_20px_rgba(255,200,0,0.5)]">
          <LightbulbIcon className="text-yellow-500" fontSize="medium" />
        </div>
      </div>

      <h5 className="font-semibold text-gray-900 mt-8 text-sm">
        Thoughts Time
      </h5>

      {!editing ? (
        <>
          <p className="text-xs text-gray-600 mt-2 leading-relaxed px-1">
            {thought ||
              "We don’t have any notice for you yet. Share your thoughts with your peers."}
          </p>

          <button
            onClick={() => setEditing(true)}
            className="mt-3 w-full bg-white border border-gray-300 rounded-md py-1.5 
                       text-xs font-medium hover:bg-gray-50"
          >
            {thought ? "Edit message" : "Write a message"}
          </button>
        </>
      ) : (
        <>
          <textarea
            className="w-full border border-gray-300 rounded-md p-2 text-xs focus:outline-none mt-2"
            rows={3}
            value={thought}
            onChange={(e) => setThought(e.target.value)}
          />

          <button
            onClick={saveThought}
            className="mt-3 w-full bg-indigo-600 text-white rounded-md py-1.5 text-xs font-medium hover:bg-indigo-700"
          >
            Save
          </button>
        </>
      )}
    </div>
  );
}
