import { fetchResumePDFFromGitHub } from '../../../lib/github';

export async function GET() {
  try {
    const pdfBuffer = await fetchResumePDFFromGitHub();
    
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="resume.pdf"',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to fetch PDF' }), 
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
