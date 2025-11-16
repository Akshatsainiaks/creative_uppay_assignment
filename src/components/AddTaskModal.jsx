
import React, { useState } from "react";

export default function AddTaskModal({ onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Low");
  const [dueAt, setDueAt] = useState("");

  const handleCreate = () => {
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      priority,
      dueAt: dueAt || null,
      subtasks: [],
      members: []
    };

    if (onCreate) onCreate(payload);
    if (onClose) onClose();

    setTitle("");
    setDescription("");
    setPriority("Low");
    setDueAt("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl w-[520px] p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-3">Add task</h3>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full border px-3 py-2 rounded mb-3"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="w-full border px-3 py-2 rounded mb-3"
          rows={3}
        />

        <div className="flex gap-2 mb-4 items-center">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="Low">Low</option>
            <option value="High">High</option>
            <option value="Completed">Completed</option>
          </select>

          <input
            type="datetime-local"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
            className="border px-3 py-2 rounded flex-1"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
          <button onClick={handleCreate} className="px-4 py-2 bg-indigo-600 text-white rounded">Create</button>
        </div>
      </div>
    </div>
  );
}
