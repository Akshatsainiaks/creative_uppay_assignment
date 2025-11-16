import { useParams } from "react-router-dom";
import React from "react";
export default function ProjectPage() {
  const { project } = useParams();

  const title = project.replace(/-/g, " ");

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold capitalize">Welcome to {title}</h1>
      <p className="text-gray-600 mt-2">This is your new project page.</p>
    </div>
  );
}
