# lbirchen.com

Personal portfolio and resume site built with [Next.js](https://nextjs.org) and [Tailwind CSS](https://tailwindcss.com). Deployed on [Vercel](https://vercel.com).

## Features

- **Resume**: Fetches resume markdown from GitHub and renders it with custom styling. Includes PDF download.
- **Projects**: Each project has a markdown file in `content/projects/` which is parsed and rendered into the project page. Project metadata (title, subtitle, thumbnail, live link) is defined in `lib/projects.js`.
- **Responsive Design**: Tailwind CSS with a dark theme.

## Getting Started

```bash
npm install
npm run dev
```

### Environment Variables

Create a `.env.local` file:

```bash
# GitHub API Token (optional, for higher rate limits on resume fetch)
GITHUB_TOKEN=your_github_token_here
```
