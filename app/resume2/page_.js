import { fetchResumeHTMLFromGitHub } from '../../lib/github';
import PDFDownloadButton from '../../components/PDFDownloadButton';

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

  // Extract head and body content to avoid hydration issues
  const headMatch = htmlContent.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  
  const headContent = headMatch ? headMatch[1] : '';
  const bodyContent = bodyMatch ? bodyMatch[1] : htmlContent;

  // Extract and remove the first h1 from the body to render our custom header
  const h1Match = bodyContent.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const pageTitle = h1Match ? h1Match[1] : null;
  const bodyWithoutFirstH1 = h1Match ? bodyContent.replace(h1Match[0], '') : bodyContent;
  
  return (
    <>
      {/* Inject the head styles */}
      {headContent && (
        <div dangerouslySetInnerHTML={{ __html: headContent }} />
      )}
      
      <div className="min-h-screen bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-6 pt-6 pb-12 sm:pl-20">
          {pageTitle && (
            <div className="mb-2 pb-2 border-b border-gray-700 flex items-center justify-between">
              <h1 className="text-4xl font-bold text-blue-400" dangerouslySetInnerHTML={{ __html: pageTitle }} />
              <PDFDownloadButton inline className="ml-4" />
            </div>
          )}
          <div 
            dangerouslySetInnerHTML={{ __html: bodyWithoutFirstH1 }}
            className="resume-html"
          />
        </div>
      </div>
    </>
  );
}
