"use client";

import { useState } from "react";
import ProjectCard from "../../components/ProjectCard/ProjectCard";

export default function Projects() {
  const [expanded, setExpanded] = useState({});

  const toggleExpanded = (id) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="fixed inset-0 bg-slate-900 text-white overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-12 sm:pl-20">
        <div className="mb-2 pb-2 border-b border-gray-700 flex items-center justify-between">
          <h1 className="text-4xl font-bold text-blue-400">Projects</h1>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-1">
          <ProjectCard
            id="datingapp"
            title="Dating App"
            subtitle="Match & Chat Platform"
            description="A full-stack dating application where users can like other members, view their matches, and engage in live chat. Built as a learning project to explore .NET ASP.NET Core and Angular. The backend implements the repository pattern and unit of work for clean data access, Entity Framework for ORM, and Identity Framework for JWT token-based authentication with refresh tokens (no HTTP cookies). Real-time features are powered by SignalR for live web socket notifications and user chat functionality."
            thumbnail="/project-previews/datingapp_preview.png"
            thumbnailAlt="Dating app preview"
            link="https://lb-da-2025.azurewebsites.net/"
            linkIsExternal={true}
            frontend="Angular SPA"
            backend=".NET ASP.NET Core API"
            database="Azure SQL Server"
            hosting="Azure Web App - Please note there may be some initial delay from free tier"
            isExpanded={expanded["datingapp"]}
            onToggle={toggleExpanded}
          />

          <ProjectCard
            id="eventhub"
            title="EventHub"
            subtitle="Event Management Platform"
            description="A full-stack event management application built with a Go backend using Gin framework and a Svelte SPA frontend built with Vite. Features a RESTful API architecture with minimal CRUD functionality and CORS configuration to securely connect the frontend and backend across different hosting platforms. This was a relatively quick project to learn the basics of Go/Gin and Svelte. Currently using raw SQL (go-sql-driver/mysql) queries without an ORM will look to explore a go based ORM in the future."
            thumbnail="/project-previews/eventhub_preview.png"
            thumbnailAlt="EventHub preview"
            link="https://event-hub-svelte.vercel.app/"
            linkIsExternal={true}
            frontend="Svelte SPA, svelte5-router, Vite"
            backend="Gin/Go"
            database="MySQL (no ORM)"
            hosting="Backend: Digital Ocean Droplet through Laravel Forge with some tweaks, Frontend: Vercel"
            isExpanded={expanded["eventhub"]}
            onToggle={toggleExpanded}
          />

          <ProjectCard
            id="workopia"
            title="Workopia"
            subtitle="Job Postings Board"
            description="A full-stack job board application where employers can post job listings and job seekers can search, bookmark, and apply to positions. Features user authentication, job search functionality, bookmark management, and application tracking with role-based authorization. Built following Laravel best practices including database migrations, Artisan seeders for test data generation, and Eloquent ORM for clean model relationships and queries. Built with Vite for asset compilation."
            thumbnail="/project-previews/workopia_preview.png"
            thumbnailAlt="Workopia preview"
            link="https://workopia_laravel-msvylpgk.on-forge.com/"
            linkIsExternal={true}
            frontend="Blade templates, Tailwind CSS 4.1.17, Alpine.js"
            backend="Laravel 12.0, PHP 8.2+"
            database="PostgreSQL (dev), MySQL (production), Eloquent ORM with migrations, seeders, factories"
            hosting="Digital Ocean (via Laravel Forge)"
            isExpanded={expanded["workopia"]}
            onToggle={toggleExpanded}
          />

          <ProjectCard
            id="foodle"
            title="Foodle"
            subtitle="Wordle for Foodies"
            description="A React-based daily word game where players guess food-themed words across three rounds (4, 5, and 6 letter words). The app seeds a new deterministic puzzle set each day, validates guesses against an allowed words list, tracks scores, and visualizes player stats and streaks. Built with React Context API for state management and TanStack React Query for efficient data fetching."
            thumbnail="/project-previews/foodle_preview.png"
            thumbnailAlt="Foodle preview"
            link="https://foodle-app-seven.vercel.app/"
            linkIsExternal={true}
            frontend="React 19, Vite, React Router 7, Tailwind CSS 4, Shadcn UI, Lucide Icons"
            backend="Supabase (Auth + Postgres)"
            database="PostgreSQL (via Supabase)"
            hosting="Vercel"
            isExpanded={expanded["foodle"]}
            onToggle={toggleExpanded}
          />

          <ProjectCard
            id="yelpcamp"
            title="Yelpcamp"
            subtitle="Campground Reviews"
            description="A full-stack CRUD app where users can create, view, edit, and review campgrounds with image uploads and authentication. Features include user registration, login, campground creation with image uploads via Cloudinary, and review functionality."
            thumbnail="/project-previews/yelpcamp_preview.png"
            thumbnailAlt="Yelpcamp preview"
            link="https://yelpcamp-luke.onrender.com"
            linkIsExternal={true}
            frontend="EJS templates, Bootstrap 5"
            backend="Node.js, Express, Joi (validation), Passport (authentication)"
            database="MongoDB (Atlas)"
            hosting="Render - note there may be a brief cold start delay on the free tier."
            isExpanded={expanded["yelpcamp"]}
            onToggle={toggleExpanded}
          />

          <ProjectCard
            id="lbirchen"
            title="lbirchen.com"
            subtitle="Portfolio & Resume Platform"
            description="A modern Next.js site showcasing projects and an auto-updating resume. The app renders Markdown resume content fetched from GitHub, supports rich formatting, and exposes an API route that serves the latest PDF generated by a GitHub Actions workflow in the resume repository. The resume content is stored in a GitHub repository with Actions workflows that build PDF and HTML versions, and the site fetches and displays the latest versions dynamically."
            thumbnail="/project-previews/lbirchen_preview.png"
            thumbnailAlt="lbirchen.com preview"
            link="/"
            linkIsExternal={false}
            frontend="Next.js 15 (App Router), React 19, Tailwind CSS 4, CSS modules, Lucide Icons"
            hosting="Vercel"
            isExpanded={expanded["lbirchen"]}
            onToggle={toggleExpanded}
          />

          

          

          

          
        </div>
      </div>
    </div>
  );
}


