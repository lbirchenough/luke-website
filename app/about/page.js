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
              Hi, I&apos;m Luke, a mechatronics engineer and software developer. I have five years experience building computer vision and laser-based measurement systems for the rail industry. I worked across the full stack, covering both hardware and software to ensure systems operated reliably end-to-end, from sensor triggering and data capture through measurement processing to web-based results delivery. Before engineering, I worked in education, which shaped strong communication skills and an ability to break down complex ideas for any audience.
            </p>

            <p className="mb-6 text-gray-200 leading-relaxed">
              I&apos;m an experienced software developer with a focus on full-stack web development (.NET) and systems programming (C++), and have been known to dabble in embedded engineering and robotics. I actively seek out projects that stretch across these domains, whether that&apos;s shipping an event-driven microservices platform on Azure, wiring up an ESP8266 to push sensor data through an AWS IoT pipeline, or training object detection models for integration into inspection systems.
            </p>

            <h2 className="text-2xl font-semibold mb-4 text-blue-400 pb-2 border-b border-gray-700 mt-8">My Toolkit</h2>
            <ul className="mb-4 list-disc list-outside pl-6 text-gray-200 space-y-2">
              <li><strong className="text-blue-300">Languages:</strong> C#, C++, JavaScript/TypeScript, Python, PHP</li>
              <li><strong className="text-blue-300">Web Frameworks:</strong> ASP.NET Core, React, Next.js, Angular, Express, Laravel</li>
              <li><strong className="text-blue-300">Cloud &amp; DevOps:</strong> AWS, Azure, Terraform, Docker, GitHub Actions CI/CD</li>
              <li><strong className="text-blue-300">Robotics &amp; Embedded:</strong> ROS, Arduino, ESP8266/ESP32, Raspberry Pi, MicroPython</li>
              <li><strong className="text-blue-300">CV &amp; ML:</strong> OpenCV, TensorFlow, Keras, YOLO, camera/laser measurement systems</li>
            </ul>

            <h2 className="text-2xl font-semibold mb-4 text-blue-400 pb-2 border-b border-gray-700 mt-8">What I&apos;m looking for</h2>
            <p className="mb-4 text-gray-200 leading-relaxed">
              I&apos;m seeking opportunities in web development, robotics, industrial automation and control, and embedded systems, though I&apos;m just as motivated by a purely full-stack web development role.
            </p>

            <h2 className="text-2xl font-semibold mb-4 text-blue-400 pb-2 border-b border-gray-700 mt-8">Outside of work</h2>
            <p className="mb-4 text-gray-200 leading-relaxed">
              I enjoy learning new technologies and working on side projects. I love cooking &amp; food, travelling, watching movies and playing sports.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}