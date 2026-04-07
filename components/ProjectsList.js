"use client";

import { useState } from "react";
import ProjectCard from "./ProjectCard/ProjectCard";

export default function ProjectsList({ projects }) {
  const [expanded, setExpanded] = useState({});

  const toggleExpanded = (id) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="mt-6 grid gap-6 sm:grid-cols-1">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          {...project}
          isExpanded={!!expanded[project.id]}
          onToggle={toggleExpanded}
        />
      ))}
    </div>
  );
}
