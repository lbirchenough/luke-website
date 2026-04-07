import { getProjectData, PROJECT_META } from "../../lib/projects";
import ProjectsList from "../../components/ProjectsList";

export default async function Projects() {
  const projects = await Promise.all(
    PROJECT_META.map(async (meta) => ({
      ...meta,
      detailSlug: meta.id,
      ...(await getProjectData(meta.id)),
    }))
  );

  return (
    <div className="fixed inset-0 bg-slate-900 text-white overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-12 sm:pl-20">
        <div className="mb-2 pb-2 border-b border-gray-700 flex items-center justify-between">
          <h1 className="text-4xl font-bold text-blue-400">Projects</h1>
        </div>
        <ProjectsList projects={projects} />
      </div>
    </div>
  );
}
