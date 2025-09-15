/**
 * Server-side function to fetch markdown content from GitHub
 * @returns {Promise<string>} The markdown content
 */
export async function fetchResumeFromGitHub() {
  const url = 'https://api.github.com/repos/lbirchenough/Resume/contents/resume.md';
  
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
  };

  // Add GitHub token if available (server-side only)
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const response = await fetch(url, { 
      headers,
      // Add cache revalidation - fetch fresh data every hour
      // next: { revalidate: 3600 },
      cache: 'no-store'
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('GitHub authentication failed. Please check your token.');
      } else if (response.status === 404) {
        throw new Error('Resume file not found. Please check the repository and file path.');
      } else {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    
    // Decode base64 content with proper UTF-8 handling
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    console.log('grabbed resume from github');
    return content;
  } catch (error) {
    console.error('Error fetching resume from GitHub:', error);
    throw error;
  }
}

/**
 * Server-side function to fetch HTML content from GitHub
 * @returns {Promise<string>} The HTML content
 */
export async function fetchResumeHTMLFromGitHub() {
  const url = 'https://api.github.com/repos/lbirchenough/luke-website/contents/resume.html';
  
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
  };

  // Add GitHub token if available (server-side only)
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const response = await fetch(url, { 
      headers,
      cache: 'no-store'
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('GitHub authentication failed. Please check your token.');
      } else if (response.status === 404) {
        throw new Error('Resume HTML file not found. Please check the repository and file path.');
      } else {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    
    // Decode base64 content with proper UTF-8 handling
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    console.log('grabbed resume HTML from github');
    return content;
  } catch (error) {
    console.error('Error fetching resume HTML from GitHub:', error);
    throw error;
  }
}

/**
 * Server-side function to fetch PDF content from GitHub
 * @returns {Promise<Buffer>} The PDF content as Buffer
 */
export async function fetchResumePDFFromGitHub() {
  const url = 'https://api.github.com/repos/lbirchenough/luke-website/contents/resume.pdf';
  
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
  };

  // Add GitHub token if available (server-side only)
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const response = await fetch(url, { 
      headers,
      cache: 'no-store'
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('GitHub authentication failed. Please check your token.');
      } else if (response.status === 404) {
        throw new Error('Resume PDF file not found. Please check the repository and file path.');
      } else {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    
    // Decode base64 content to Buffer
    const pdfBuffer = Buffer.from(data.content, 'base64');
    console.log('grabbed resume PDF from github');
    return pdfBuffer;
  } catch (error) {
    console.error('Error fetching resume PDF from GitHub:', error);
    throw error;
  }
}