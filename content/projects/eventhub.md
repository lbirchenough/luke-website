# EventHub

## Overview

A full-stack event management application built with a Go backend using Gin framework and a Svelte SPA frontend built with Vite. Features a RESTful API architecture with minimal CRUD functionality and CORS configuration to securely connect the frontend and backend across different hosting platforms. This was a relatively quick project to learn the basics of Go/Gin and Svelte. Currently using raw SQL (go-sql-driver/mysql) queries without an ORM — will look to explore a Go-based ORM in the future.

## Tech Stack

- **Frontend:** Svelte SPA, svelte5-router, Vite
- **Backend:** Gin/Go
- **Database:** MySQL (no ORM)
- **Hosting:** Backend: Digital Ocean Droplet through Laravel Forge with some tweaks, Frontend: Vercel

## Architecture

Features a RESTful API architecture with CORS configuration to securely connect the frontend and backend across different hosting platforms. Currently using raw SQL via `go-sql-driver/mysql` without an ORM — something I'd like to revisit with a Go-based ORM in the future.

## Challenges & Learnings

Write about what you found challenging or interesting here.

## Links

- [Live App](https://event-hub-svelte.vercel.app/)
