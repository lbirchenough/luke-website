import fs from 'fs/promises';
import path from 'path';

export const PROJECT_META = [
  {
    id: "finagent",
    title: "Financial Research Agent",
    subtitle: "LangChain vs Azure AI Foundry, Same Corpus",
    thumbnail: "/project-previews/finance_agent_preview.png",
    thumbnailAlt: "Financial Research Agent preview",
    link: "https://agent.lbirchen.com/",
    linkIsExternal: true,
    linkNote: "Global rate limit of 6 turns/minute across all visitors - a deliberate spending cap, so a busy moment may mean a short wait",
  },
  {
    id: "teacupboutique",
    title: "TeacupBoutique",
    subtitle: "Tea Party Rental Platform",
    thumbnail: "/project-previews/teacupboutique_preview.png",
    thumbnailAlt: "TeacupBoutique preview",
    link: "https://tcb.lbirchen.com/",
    linkIsExternal: true,
    linkNote: "Allow ~30s for cold start - services scale to zero when idle",
  },
  {
    id: "iot",
    title: "IoT Experimentation",
    subtitle: "ESP8266 Sensors to AWS Cloud Pipeline",
    thumbnail: "/project-previews/iot_preview.png",
    thumbnailAlt: "IoT Experimentation preview",
    link: "https://lbirchenprojectiot.grafana.net/public-dashboards/2f08948b839840e48421469b960230a6?refresh=30s&from=now-24h&to=now&timezone=browser",
    linkIsExternal: true,
    linkWarning: "Laravel API temporarily down due to cost saving measures - Grafana dashboard and AWS pipeline still operational",
  },
  {
    id: "datingapp",
    title: "Dating App",
    subtitle: "Match & Chat Platform",
    thumbnail: "/project-previews/datingapp_preview.png",
    thumbnailAlt: "Dating app preview",
    link: "https://lb-da-2025.azurewebsites.net/",
    linkIsExternal: true,
    linkDisabled: true,
    linkWarning: "Temporarily disabled",
  },
  {
    id: "eventhub",
    title: "EventHub",
    subtitle: "Event Management Platform",
    thumbnail: "/project-previews/eventhub_preview.png",
    thumbnailAlt: "EventHub preview",
    link: "https://event-hub-svelte.vercel.app/",
    linkIsExternal: true,
    linkDisabled: true,
    linkWarning: "Backend API temporarily disabled due to cost saving measures - site not currently functional",
  },
  {
    id: "workopia",
    title: "Workopia",
    subtitle: "Job Postings Board",
    thumbnail: "/project-previews/workopia_preview.png",
    thumbnailAlt: "Workopia preview",
    link: "https://workopia_laravel-msvylpgk.on-forge.com/",
    linkIsExternal: true,
    linkDisabled: true,
    linkWarning: "Server temporarily disabled due to cost saving measures",
  },
  {
    id: "foodle",
    title: "Foodle",
    subtitle: "Wordle for Foodies",
    thumbnail: "/project-previews/foodle_preview.png",
    thumbnailAlt: "Foodle preview",
    link: "https://foodle-app-seven.vercel.app/",
    linkIsExternal: true,
    linkDisabled: true,
    linkWarning: "Temporarily disabled",
  },
  {
    id: "lbirchen",
    title: "lbirchen.com",
    subtitle: "Portfolio & Resume Platform",
    thumbnail: "/project-previews/lbirchen_preview.png",
    thumbnailAlt: "lbirchen.com preview",
    link: "/",
    linkIsExternal: false,
  },
];

function extractSection(markdown, heading) {
  const regex = new RegExp(`## ${heading}\\n([\\s\\S]*?)(?=\\n## |$)`);
  const match = markdown.match(regex);
  return match ? match[1].trim() : '';
}

function parseTechStack(stackSection) {
  const result = [];
  for (const line of stackSection.split('\n')) {
    const match = line.match(/^- \*\*(.+?):\*\* (.+)$/);
    if (match) {
      result.push({ label: match[1], value: match[2].trim() });
    }
  }
  return result;
}

export async function getProjectData(slug) {
  const filePath = path.join(process.cwd(), 'content/projects', `${slug}.md`);
  const markdown = await fs.readFile(filePath, 'utf-8');

  return {
    description: extractSection(markdown, 'Overview'),
    techStack: parseTechStack(extractSection(markdown, 'Tech Stack')),
  };
}
