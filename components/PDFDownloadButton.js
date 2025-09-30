import { Download } from "lucide-react";

export default function PDFDownloadButton({ inline = false, className = "", size = 28 }) {
  if (inline) {
    return (
      <a
        href="/api/resume-pdf"
        download="resume.pdf"
        aria-label="Download PDF"
        className={`text-blue-300 hover:text-blue-200 transition-colors ${className}`}
      >
        <Download size={size} />
      </a>
    );
  }

  return (
    <div className="top-4 right-4 z-50" data-pdf-download>
      <a
        href="/api/resume-pdf"
        download="resume.pdf"
        aria-label="Download PDF"
        className={className}
      >
        <Download size={size} />
      </a>
    </div>
  );
}
