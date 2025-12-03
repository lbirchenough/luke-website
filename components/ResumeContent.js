import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { fetchResumeFromGitHub } from '../lib/github';
import PDFDownloadButton from './PDFDownloadButton';

// Custom component for skills
function SkillsBlock({ children }) {
  const skills = children.split(',').map(skill => skill.trim());
  
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {skills.map((skill, index) => (
        <span 
          key={index}
          className="bg-blue-900/30 text-blue-300 px-3 py-1 rounded-full text-sm font-medium border border-blue-700/50"
        >
          {skill}
        </span>
      ))}
    </div>
  );
}

export default async function ResumeContent() {
  let markdown = '';
  let error = null;

  try {
    markdown = await fetchResumeFromGitHub();
  } catch (err) {
    console.error('Error fetching resume:', err);
    error = err.message;
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-slate-900 text-white flex justify-center items-center overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-12 ml-32">
          <div className="text-red-400 text-center">
            <h3 className="text-xl font-semibold mb-2">Error loading resume</h3>
            <p className="text-sm text-gray-300">{error}</p>
            <p className="text-xs mt-2 text-gray-500">
              Make sure you have set up your GitHub token in environment variables.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900 text-white overflow-y-auto">
      
      <div className="max-w-6xl mx-auto px-6 py-12 sm:pl-20">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              // Custom styling for different markdown elements
              h1: ({ children }) => (
                <div className="mb-2 pb-2 border-b border-gray-700 flex items-center justify-between">
                  <h1 className="text-4xl font-bold text-blue-400">{children}</h1>
                  <PDFDownloadButton inline className="ml-4" />
                </div>
              ),
              // Custom skills block
              div: ({ children, className }) => {
                if (className === 'skills') {
                  return <SkillsBlock>{children}</SkillsBlock>;
                }
                return <div className={className}>{children}</div>;
              },
              // h2: ({ children }) => <h2 className="text-2xl font-semibold mb-4 text-blue-400 mt-8 border-b border-gray-700 pb-2">{children}</h2>,
              h2: ({ children }) => <h2 className="text-2xl font-semibold mb-4 text-blue-400 mt-8 pb-2 border-b border-gray-700">{children}</h2>,
              h3: ({ children }) => <h3 className="text-xl font-medium mb-0 text-blue-300 mt-3">{children}</h3>,
              p: ({ children }) => <p className="mb-4 text-gray-200 leading-relaxed ">{children}</p>,
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
              strong: ({ children }) => <strong className="font-normal text-white">{children}</strong>,
              em: ({ children }) => <em className="italic text-gray-300">{children}</em>,
              code: ({ children }) => <code className="bg-gray-800 text-green-400 px-2 py-1 rounded text-sm font-mono">{children}</code>,
              pre: ({ children }) => <pre className="bg-gray-800 text-green-400 p-4 rounded-lg overflow-x-auto mb-4">{children}</pre>,
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
            }}
          >
            {markdown}
          </ReactMarkdown>
        
      </div>
    </div>
  );
}
