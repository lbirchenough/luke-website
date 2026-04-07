# Foodle

## Overview

A React-based daily word game where players guess food-themed words across three rounds (4, 5, and 6 letter words). The app seeds a new deterministic puzzle set each day, validates guesses against an allowed words list, tracks scores, and visualizes player stats and streaks. Built with React Context API for state management and TanStack React Query for efficient data fetching.

## Tech Stack

- **Frontend:** React 19, Vite, React Router 7, Tailwind CSS 4, Shadcn UI, Lucide Icons
- **Backend:** Supabase (Auth + Postgres)
- **Database:** PostgreSQL (via Supabase)
- **Hosting:** Vercel

## How It Works

The app seeds a new deterministic puzzle set each day, ensuring all players get the same words without any server-side daily job. Guesses are validated against an allowed words list, and the game tracks scores, streaks, and player stats.

## Architecture

- React Context API for game state management
- TanStack React Query for efficient data fetching and caching
- Supabase for auth and persistent score storage

## Challenges & Learnings

Write about what you found challenging or interesting here.

## Links

- [Live App](https://foodle-app-seven.vercel.app/)
