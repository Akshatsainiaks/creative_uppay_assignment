import React, { useState } from "react";
import { useUser } from "@clerk/clerk-react";

export default function LocationEditor() {
  const { user } = useUser();

  const [state, setState] = useState(user?.unsafeMetadata?.state || "Rajasthan");
  const [country, setCountry] = useState(user?.unsafeMetadata?.country || "India");
  const [saving, setSaving] = useState(false);

  const saveLocation = async () => {
    setSaving(true);
    await user.update({
      unsafeMetadata: { state, country }
    });
    setSaving(false);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow w-full max-w-md">
      <h3 className="text-lg font-semibold mb-4">Update Location</h3>

      <div className="mb-3">
        <label className="text-sm text-gray-600">State</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded mt-1"
          value={state}
          onChange={(e) => setState(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="text-sm text-gray-600">Country</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded mt-1"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />
      </div>

      <button
        onClick={saveLocation}
        disabled={saving}
        className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
      >
        {saving ? "Saving..." : "Save Location"}
      </button>
    </div>
  );
}
