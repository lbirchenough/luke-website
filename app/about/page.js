import Image from 'next/image';

export default function About() {
  return (
    <div className="fixed inset-0 bg-slate-900 text-white overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-12 sm:pl-20">
        <div className="mb-2 pb-2 border-b border-gray-700 flex items-center justify-between">
          <h1 className="text-4xl font-bold text-blue-400">About</h1>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-[220px,1fr] gap-8 items-start">
          <div className="flex md:block justify-center">
            <div className="relative h-48 w-48 md:h-56 md:w-56 rounded-full ring-2 ring-blue-700/50 border border-gray-700 overflow-hidden">
              <Image
                src="/luke-birchenough.jpg"
                alt="Luke Birchenough"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          <div>
            <p className="mb-6 text-gray-200 leading-relaxed">
              Hi, I'm Luke, a mechatronics engineer focused on software development. I have several years of experience building camera and laser measurement systems for the rail industry, which has given me a strong foundation in software systems development and hands-on engineering, from hardware integration to end-to-end system testing. I'm now focused on full-stack web development, combining that practical background with modern tools to build reliable, user-friendly applications. Before engineering, I worked in education, which helped me develop strong communication skills and an ability to explain complex ideas clearly.
            </p>

            <h2 className="text-2xl font-semibold mb-4 text-blue-400 pb-2 border-b border-gray-700 mt-8">What I do</h2>
            <p className="mb-4 text-gray-200 leading-relaxed">
              I work across the stack to design and deliver robust, maintainable software. My current toolkit includes:
            </p>
            <ul className="mb-4 list-disc list-outside pl-6 text-gray-200 space-y-2">
              <li><strong className="text-blue-300">Languages:</strong> JavaScript, TypeScript, PHP, Python, C++</li>
              <li><strong className="text-blue-300">Frameworks & Libraries:</strong> React, Next.js, Express, Laravel</li>
              <li><strong className="text-blue-300">Databases:</strong> MongoDB, MySQL, SQLite, PostgreSQL</li>
              <li><strong className="text-blue-300">Cloud & DevOps:</strong> AWS and other cloud platforms, Docker, CI/CD pipelines</li>
            </ul>

            <h2 className="text-2xl font-semibold mb-4 text-blue-400 pb-2 border-b border-gray-700 mt-8">Outside of work</h2>
            <p className="mb-4 text-gray-200 leading-relaxed">
              I enjoy learning new technologies and working on side projects. I love cooking & food, travelling, watching movies and playing sports.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}