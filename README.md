This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Features

- **Resume Display**: Fetches resume content from GitHub API and displays it with beautiful styling
- **PDF Generation**: Download your resume as a PDF with preserved styling using Puppeteer
- **Responsive Design**: Built with Tailwind CSS for a modern, responsive layout
- **Markdown Support**: Renders GitHub markdown with custom styling for skills, links, and formatting

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

## PDF Generation

The resume page includes a "Download PDF" button that generates a PDF version of your resume with all styling preserved. The PDF generation uses Puppeteer to capture the rendered page.

### Environment Variables (Optional)

Create a `.env.local` file for configuration:

```bash
# GitHub API Token (optional, for higher rate limits)
GITHUB_TOKEN=your_github_token_here

# Base URL for PDF generation (set this in production)
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
