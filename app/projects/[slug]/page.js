import fs from 'fs/promises';
import path from 'path';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ArrowLeft } from 'lucide-react';
import { PROJECT_META } from '../../../lib/projects';

export async function generateStaticParams() {
  const dir = path.join(process.cwd(), 'content/projects');
  const files = await fs.readdir(dir);
  return files
    .filter((f) => f.endsWith('.md'))
    .map((f) => ({ slug: f.replace(/\.md$/, '') }));
}

export default async function ProjectDetail({ params }) {
  const { slug } = await params;
  const filePath = path.join(process.cwd(), 'content/projects', `${slug}.md`);

  let markdown;
  try {
    markdown = await fs.readFile(filePath, 'utf-8');
  } catch {
    notFound();
  }

  const meta = PROJECT_META.find((p) => p.id === slug);

  return (
    <div className="fixed inset-0 bg-slate-900 text-white overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-12 sm:pl-20">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors mb-8 text-sm"
        >
          <ArrowLeft size={16} />
          Back to Projects
        </Link>

        {meta?.thumbnail && (
          <a
            href={meta.link}
            target={meta.linkIsExternal ? "_blank" : undefined}
            rel={meta.linkIsExternal ? "noopener noreferrer" : undefined}
            className="block mb-8"
          >
            <Image
              src={meta.thumbnail}
              alt={meta.thumbnailAlt ?? meta.title}
              width={2500}
              height={1260}
              className="w-full h-auto rounded-lg border border-gray-700 hover:border-blue-400 transition-colors"
            />
          </a>
        )}

        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            h1: ({ children }) => (
              <div className="mb-6 pb-2 border-b border-gray-700">
                <h1 className="text-4xl font-bold text-blue-400">{children}</h1>
              </div>
            ),
            h2: ({ children }) => (
              <h2 className="text-2xl font-semibold mb-4 text-blue-400 mt-8 pb-2 border-b border-gray-700">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-xl font-medium mb-2 text-blue-300 mt-4">{children}</h3>
            ),
            p: ({ children }) => (
              <p className="mb-4 text-gray-200 leading-relaxed">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="mb-4 list-disc list-outside pl-6 text-gray-200 space-y-1">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="mb-4 list-decimal list-outside pl-6 text-gray-200 space-y-1">
                {children}
              </ol>
            ),
            li: ({ children }) => <li className="mb-1">{children}</li>,
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-blue-400 pl-4 my-4 text-gray-400 italic">
                {children}
              </blockquote>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-white">{children}</strong>
            ),
            em: ({ children }) => <em className="italic text-gray-300">{children}</em>,
            code: ({ children }) => (
              <code className="bg-gray-800 text-green-400 px-2 py-1 rounded text-sm font-mono">
                {children}
              </code>
            ),
            pre: ({ children }) => (
              <pre className="bg-gray-800 text-green-400 p-4 rounded-lg overflow-x-auto mb-4">
                {children}
              </pre>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline decoration-blue-400 hover:decoration-blue-300 transition-colors duration-200"
              >
                {children}
              </a>
            ),
            hr: () => <hr className="border-gray-700 my-6" />,
            img: ({ src, alt }) => (
              <img src={src} alt={alt} className="max-w-full h-auto rounded-lg border border-gray-700 my-4" />
            ),
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    </div>
  );
}
