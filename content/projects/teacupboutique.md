# TeacupBoutique

## Overview

A full-stack boutique high tea rental platform built on a microservices architecture. Customers can browse rental products, check availability by date, place orders, and pay online. An admin side handles physical inventory, bookings, and returns. Built in C# (.NET 10) and React (TypeScript). 

## Showcase
See the [Live App](https://teacupboutique.lbirchen.com/)
Admin Login (To view the product / booking management side): admin@teacupboutique.com.au / Admin@Password1
Test Payment (Stripe test card): 4242 4242 4242 4242 , [any valid date] , [any 3 digits ] 

Whilst the project is in a good enough state to showcase, the end goal would be to use this for a business. There is definitely work to be done before getting to that stage. Namely, adding actual products and linking stripe payments to real domain/business plus some more iterations on the business logic. 

## Tech Stack

- **Frontend:** React 19, TypeScript, TanStack Router, TanStack React Query, Tailwind CSS 4, Vite
- **Backend:** ASP.NET Core 10 (5 microservices + 1 API Gateway)
- **Database:** PostgreSQL 16 (per-service databases, Entity Framework Core 10)
- **Hosting:** Single Azure VM (B2als v2), Cloudflare proxy/CDN, GitHub Actions CI/CD, GHCR
- **Message Queue:** RabbitMQ (topic exchange, async inter-service events)
- **Payments:** Stripe (payment intents, webhooks, refunds)
- **Email:** Mailgun
- **Image Storage:** Cloudinary
- **CAPTCHA:** Cloudflare Turnstile
- **Reverse Proxy:** YARP (gateway) + Nginx (edge)

## Architecture

Five microservices (Auth, Inventory, Orders, Payments, and Notifications) each owning its own PostgreSQL database. A YARP-based API Gateway acts as the single entry point for all client traffic, handling JWT validation, CORS, rate limiting, and injecting user context headers into downstream requests.

![TeacupBoutique system architecture](https://res.cloudinary.com/duevte0ku/image/upload/v1775614866/Teacup-systemarch_l46nu8.png)

Services never call each other directly. Instead they communicate via an async message exchange. A service publishes an event describing what happened and has no knowledge of what consumes it, keeping services fully decoupled and making the system resilient to individual service restarts. The full event contract is documented in the Event Reference section below.

## Deployment

### V1 - Single VM

The current deployment runs on a single Azure VM (B2als v2). All services are containerised with Docker and orchestrated via Docker Compose. Nginx sits at the edge handling SSL termination via a Cloudflare Origin Certificate and routing traffic to the appropriate container. A GitHub Actions pipeline builds and pushes all images to GHCR on every push to main, then SSHes into the VM to pull the latest images, run any pending EF Core migrations, and restart the stack. A self-hosted message broker (RabbitMQ) handles inter-service events, running as a container alongside the services.

### V2 - Azure Native (Planned)

The goal for V2 is to move towards a fully Azure-native infrastructure. This means replacing the self-hosted message broker with Azure Service Bus, moving container orchestration to Azure Container Apps or AKS, and managing all infrastructure as code with Terraform. The intent is to eliminate manual VM management, get proper auto-scaling, and make deployments fully repeatable and environment-agnostic.

## Event Reference 

### Auth Service

| Direction | Event | Trigger |
|-----------|-------|---------|
| Publishes | `auth.EmailVerificationRequested` | User registers |
| Publishes | `auth.PasswordResetRequested` | User requests password reset |

### Orders Service

| Direction | Event | Trigger |
|-----------|-------|---------|
| Publishes | `orders.OrderPlaced` | Customer submits order |
| Publishes | `orders.ReadyForPayment` | Stock confirmed reserved |
| Publishes | `orders.OrderConfirmed` | Payment succeeded |
| Publishes | `orders.OrderCancelled` | Order cancelled |
| Publishes | `orders.RefundRequested` | Cancellation/return triggers refund |
| Subscribes | `inventory.StockReserved` | Lock price, move to AwaitingPayment |
| Subscribes | `inventory.StockUnavailable` | Mark order as OutOfStock |
| Subscribes | `payments.PaymentSucceeded` | Confirm order |
| Subscribes | `payments.PaymentFailed` | Mark payment failed |
| Subscribes | `payments.RefundSucceeded` | Update order refund status |
| Subscribes | `payments.RefundFailed` | Flag refund failure |
| Subscribes | `inventory.BookingCompleted` | Trigger deposit refund after return |
| Subscribes | `inventory.ReturnAssessedWithMissingItems` | Update order for missing items |

### Inventory Service

| Direction | Event | Trigger |
|-----------|-------|---------|
| Publishes | `inventory.StockReserved` | Stock successfully held for order |
| Publishes | `inventory.StockUnavailable` | Items not available for requested dates |
| Publishes | `inventory.BookingCompleted` | Admin marks booking as returned |
| Publishes | `inventory.ReturnAssessedWithMissingItems` | Return assessment flags missing items |
| Subscribes | `orders.OrderPlaced` | Check and reserve stock |
| Subscribes | `orders.OrderCancelled` | Release reserved stock |
| Subscribes | `payments.PaymentSucceeded` | Confirm booking is active |

### Payments Service

| Direction | Event | Trigger |
|-----------|-------|---------|
| Publishes | `payments.PaymentSucceeded` | Stripe webhook: payment_intent.succeeded |
| Publishes | `payments.PaymentFailed` | Stripe webhook: payment_intent.payment_failed |
| Publishes | `payments.RefundSucceeded` | Refund processed via Stripe |
| Publishes | `payments.RefundFailed` | Stripe refund failed |
| Subscribes | `orders.ReadyForPayment` | Create Stripe payment intent |
| Subscribes | `orders.RefundRequested` | Process refund via Stripe API |

### Notifications Service

| Direction | Event | Trigger |
|-----------|-------|---------|
| Subscribes | `orders.OrderConfirmed` | Send order confirmation email |
| Subscribes | `orders.OrderCancelled` | Send cancellation email |
| Subscribes | `payments.PaymentFailed` | Send payment failure email |
| Subscribes | `auth.EmailVerificationRequested` | Send email verification link |
| Subscribes | `auth.PasswordResetRequested` | Send password reset link |

## Features

- Product catalog with photo galleries (Cloudinary), pricing, deposit amounts, servings, and rental duration rules
- Date-based stock availability checking with serializable transaction isolation to prevent double-bookings
- Full checkout flow: cart -> date selection -> Stripe payment -> order confirmation
- Guest checkout with token-based order access (no account required)
- JWT authentication with HttpOnly refresh token cookies, account lockout, and email verification
- Admin booking management: marking items as returned, logging return condition photos, assessing missing items
- Automated refund policies (full refund >30 days notice, deposit-only <30 days)
- Cloudflare Turnstile CAPTCHA on sensitive endpoints (register, login, password reset, payment)
- Stripe webhook deduplication to handle duplicate event delivery safely

## Challenges & Learnings

Getting the event choreography right across five services was the most demanding part. Ensuring messages are idempotent, handling service startup ordering with retry loops, and keeping order status consistent when events are replayed or arrive late.

On the infrastructure side, configuring Nginx to handle SSL termination via Cloudflare Origin Certificates and ensuring it restarted after the upstream containers (to avoid stale IP resolution) were small but fiddly details. The GitHub Actions CI/CD pipeline builds and pushes all service images in parallel before SSHing into the VM to run EF Core migrations and restart the stack.

Separating Orders and Inventory into distinct services means each owns its data with no shared database and no referential integrity between them. To handle this, the Orders service snapshots pricing and customer details at the time of purchase so that updating a product contents or pricing later never corrupts a historical order. The Orders schema also went through some rethinking along the way. Fields that seemed useful upfront, like event type, guest count, and special requests, ended up unused once the actual flow took shape.

## Links


- [GitHub](https://github.com/lbirchenough/TeacupBoutique)
