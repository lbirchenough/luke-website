import { fetchResumeHTMLFromGitHub } from '../../lib/github';

export default async function Resume2() {
  let htmlContent = '';
  let error = null;

  try {
    htmlContent = await fetchResumeHTMLFromGitHub();
  } catch (err) {
    console.error('Error fetching resume HTML:', err);
    error = err.message;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex justify-center items-center">
        <div className="text-white text-center">
          <h2 className="text-xl font-semibold mb-2">Error loading resume</h2>
          <p className="text-sm text-gray-300">{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-slate-900 flex justify-center">
      <div 
        dangerouslySetInnerHTML={{ __html: htmlContent }}
        className="max-w-6xl mx-auto px-6 pt-1 pb-12 sm:pl-20"
      />
    </div>
  );
}
