export default function About() {
  return (
    <div className="fixed inset-0 bg-slate-900 text-white overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-12 sm:pl-20">
        <div className="mb-2 pb-2 border-b border-gray-700 flex items-center justify-between">
          <h1 className="text-4xl font-bold text-blue-400">About</h1>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-[220px,1fr] gap-8 items-start">
          <div className="flex md:block justify-center">
            <div className="relative h-48 w-48 md:h-56 md:w-56 rounded-full ring-2 ring-blue-700/50 border border-gray-700 overflow-hidden bg-slate-800 flex items-center justify-center text-gray-400">
              <span className="text-sm">Your photo here</span>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400 pb-2 border-b border-gray-700">Hi, I&apos;m Luke</h2>
            <p className="mb-4 text-gray-200 leading-relaxed">
              I’m a software engineer focused on building reliable, user-centric web applications.
              I enjoy designing clean architectures, optimizing performance, and turning complex
              requirements into elegant solutions. I’m comfortable across the stack and love
              collaborating with teams to deliver high-impact features.
            </p>

            <h3 className="text-xl font-medium mb-3 text-blue-300 mt-3">What I do</h3>
            <ul className="mb-4 list-disc list-outside pl-6 text-gray-200 space-y-1">
              <li>Full‑stack development with modern frameworks and tooling</li>
              <li>API design, integration, and data modeling</li>
              <li>UI engineering with attention to accessibility and UX</li>
              <li>Performance tuning, observability, and developer experience</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 text-blue-300 mt-3">Highlights</h3>
            <ul className="mb-4 list-disc list-outside pl-6 text-gray-200 space-y-1">
              <li>Delivered features end‑to‑end across frontend and backend services</li>
              <li>Automated workflows and improved reliability with testing and CI/CD</li>
              <li>Collaborated closely with stakeholders to scope, iterate, and ship</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 text-blue-300 mt-3">Outside of work</h3>
            <p className="mb-4 text-gray-200 leading-relaxed">
              I enjoy learning new technologies, contributing to side projects, and exploring
              tools that improve both product quality and developer productivity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}