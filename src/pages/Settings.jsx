// import React from "react";
// import LocationEditor from "../components/LocationEditor";
// import Sidebar from "../components/Sidebar";
// import Topbar from "../components/Topbar";

// export default function Settings() {
//   return (
//     <div className="min-h-screen flex bg-gray-50">
//       <Sidebar />
//       <div className="flex-1">
//         <Topbar />
//         <main className="p-8">
//           <h2 className="text-2xl font-bold mb-6">Settings</h2>
//           <LocationEditor />
//         </main>
//       </div>
//     </div>
//   );



// }


import React from "react";
import LocationEditor from "../components/LocationEditor";

export default function Settings() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      <LocationEditor />
    </div>
  );
}
