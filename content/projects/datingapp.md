# Dating App

## Overview

A full-stack dating application where users can like other members, view their matches, and engage in live chat. Built as a learning project to explore .NET ASP.NET Core and Angular. The backend implements the repository pattern and unit of work for clean data access, Entity Framework for ORM, and Identity Framework for JWT token-based authentication with refresh tokens (no HTTP cookies). Real-time features are powered by SignalR for live web socket notifications and user chat functionality.

## Tech Stack

- **Frontend:** Angular SPA
- **Backend:** .NET ASP.NET Core API
- **Database:** Azure SQL Server
- **Hosting:** Azure Web App - Please note there may be some initial delay from free tier

## Architecture

The backend implements the repository pattern and unit of work for clean data access, keeping the data layer decoupled from business logic. Entity Framework Core handles ORM, and Identity Framework provides JWT token-based authentication with refresh tokens — no HTTP-only cookies, keeping the auth flow explicit and stateless.

## Real-Time Features

Real-time features are powered by SignalR, enabling live web socket connections for:

- Presence notifications (see who's online)
- Live user-to-user chat

## Challenges & Learnings

Write about what you found challenging or interesting here.

## Links

- [Live App](https://lb-da-2025.azurewebsites.net/)
