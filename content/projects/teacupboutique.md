# TeacupBoutique

## Overview

A full-stack boutique high tea rental platform built on a microservices architecture. Customers can browse rental products, check availability by date, place orders, and pay online. An admin side handles physical inventory, bookings, and returns. Built in C# (.NET 10) and React (TypeScript). 

## Showcase
See the [Live App](https://tcb.lbirchen.com/) — **please allow up to 30 seconds for a cold start as services scale to zero when idle (see Scaling & Cost Considerations below)**

Admin Login (To view the product / booking management side): admin@teacupboutique.com.au / Admin@Password1
Test Payment (Stripe test card): 4242 4242 4242 4242 , [any valid date] , [any 3 digits ]

Whilst the project is in a good enough state to showcase, the end goal would be to use this for a business. There is definitely work to be done before getting to that stage. Namely, adding actual products and linking stripe payments to real domain/business plus some more iterations on the business logic. 

## Tech Stack

- **Frontend:** React 19, TypeScript, TanStack Router, TanStack React Query, Tailwind CSS 4, Vite
- **Backend:** ASP.NET Core 10 (5 microservices + 1 API Gateway)
- **Database:** PostgreSQL 16 (per-service databases, Entity Framework Core 10)
- **Hosting:** Azure Container Apps (6x, scale-to-zero), Azure Static Web App, Azure Database for PostgreSQL Flexible Server, Azure Key Vault, Azure Blob Storage, Cloudflare proxy/CDN, GitHub Actions CI/CD (OIDC federated identity), Azure Container Registry, Terraform
- **Message Queue:** Azure Service Bus (Basic tier queues, KEDA scale rules)
- **Payments:** Stripe (payment intents, webhooks, refunds)
- **Email:** Mailgun
- **Image Storage:** Cloudinary
- **CAPTCHA:** Cloudflare Turnstile
- **Reverse Proxy:** YARP (gateway) + Nginx (edge)

## Architecture

Five microservices (Auth, Inventory, Orders, Payments, and Notifications) each owning its own PostgreSQL database. A YARP-based API Gateway acts as the single entry point for all client traffic, handling JWT validation, CORS, rate limiting, and injecting user context headers into downstream requests.

**V1 - Single VM Architecture**

![TeacupBoutique v1 system architecture](https://res.cloudinary.com/duevte0ku/image/upload/v1775614866/Teacup-systemarch_l46nu8.png)

**V2 - Azure Managed Services Architecture**

![TeacupBoutique v2 system architecture](https://res.cloudinary.com/duevte0ku/image/upload/v1777797892/Luke-teacupboutique-v2-arch_uv1d06.png)

Services never call each other directly. Instead they communicate via an async message exchange. A service publishes an event describing what happened and has no knowledge of what consumes it, keeping services fully decoupled and making the system resilient to individual service restarts. In v2 this is backed by Azure Service Bus queues (Basic tier) rather than RabbitMQ. The full event contract is documented in the Event Reference section below.

## Deployment

### V1 - Single VM

The current deployment runs on a single Azure VM (B2als v2). All services are containerised with Docker and orchestrated via Docker Compose. Nginx sits at the edge handling SSL termination via a Cloudflare Origin Certificate and routing traffic to the appropriate container. A GitHub Actions pipeline builds and pushes all images to GHCR on every push to main, then SSHes into the VM to pull the latest images, run any pending EF Core migrations, and restart the stack. A self-hosted message broker (RabbitMQ) handles inter-service events, running as a container alongside the services.



### V2 - Azure Managed Services (Live)

V2 replaces the single-VM Docker Compose stack with a fully managed Azure infrastructure, provisioned entirely with Terraform.

The six services (gateway, auth, inventory, orders, payments, notifications) each run as an Azure Container App. The frontend is hosted on Azure Static Web App. All databases migrate to Azure Database for PostgreSQL Flexible Server, with each service retaining its own isolated database. Azure Service Bus replaces RabbitMQ for async messaging, and Azure Key Vault holds all secrets. Auth service Data Protection keys are persisted to Azure Blob Storage so they survive redeployments and container restarts without invalidating existing sessions.

The GitHub Actions CI/CD pipeline uses OIDC federated identity — no stored credentials. On push to main it builds and pushes images to Azure Container Registry, optionally runs EF Core migration jobs via Container App Jobs, then updates each Container App to the new image tag. Infrastructure changes are applied separately via Terraform.

KEDA scale rules are configured on the Service Bus queues so services wake in response to queue depth in addition to HTTP traffic.

## Scaling & Cost Considerations

This is a showcase and learning project, not a production system with paying customers. That context justifies some deliberate tradeoffs in favour of cost over responsiveness.

**Scale-to-zero:** Every Container App except the gateway scales down to zero replicas after 5 minutes of inactivity. The gateway stays warm to handle the initial HTTP request and fan out wake pings to all downstream services. On first visit the frontend calls a dedicated wake endpoint on the gateway, which fires parallel health checks to each service, prompting their cold starts before any real user requests arrive. Expect up to ~30 seconds on a cold start; acceptable for a demo, not for a real product.

**Service Bus - queues over topics:** Azure Service Bus Basic tier only supports queues; topics and subscriptions require Standard tier, which carries a per-namespace per-day base cost regardless of usage. Each queue in this system has exactly one consumer - but for events with multiple consumers (order cancelled, payment succeeded), the publisher writes directly to multiple queues rather than relying on topic subscriptions. This publisher-side fan-out achieves the same result without the standing charge. Basic tier is billed purely on message operations, so a quiet showcase site costs close to nothing.

**Cost comparison:** The v1 B2als v2 VM ran ~$30-35 AUD/month regardless of traffic. With v2, the primary standing cost is the PostgreSQL Flexible Server (Burstable B1ms, always-on). The Container Apps environment, Service Bus Basic, Static Web App free tier, and supporting resources add relatively little on top, landing at roughly $10-15 AUD/month under normal showcase traffic - and closer to $5 during idle stretches where the container apps scale to zero. The tradeoff is cold-start latency; the saving is real money on a project generating zero revenue.

**Notifications cold start:** The notifications service scales to zero along with everything else, woken by a KEDA rule that watches its Service Bus queues. When a message arrives (email verification, order confirmation, etc.) the container cold-starts before processing it. For a showcase this delay is acceptable; for real transactional email it would not be.

For a production deployment the right answer would be minimum replica counts of 1 on critical services, Standard tier Service Bus with topic/subscription fan-out if multiple consumers ever appear, and a larger PostgreSQL SKU with compute always on. The current setup is intentionally optimised for cost on a project where the goal was learning the Azure services, not operating them at scale.

## Event Reference 

### Auth Service

| Direction | Event | Trigger |
|-----------|-------|---------|
| Publishes | `auth.EmailVerificationRequested` | User registers |
| Publishes | `auth.PasswordResetRequested` | User requests password reset |
| Publishes | `auth.EmailChanged` | User changes email |
| Publishes | `auth.EmailChangeVerificationRequested` | Email change requires verification |
| Publishes | `auth.PasswordChanged` | User changes password |

### Inventory Service

| Direction | Event | Trigger |
|-----------|-------|---------|
| Publishes | `inventory.StockReserved` | Stock successfully held for order |
| Publishes | `inventory.StockUnavailable` | Items not available for requested dates |
| Publishes | `inventory.BookingCancelled` | Admin cancels booking |
| Publishes | `inventory.BookingCompleted` | Admin marks booking as returned |
| Publishes | `inventory.ReturnAssessedWithMissingItems` | Return assessment flags missing items |
| Subscribes | `orders.OrderPlaced` | Check and reserve stock |
| Subscribes | `orders.OrderCancelled` | Release reserved stock |
| Subscribes | `payments.PaymentSucceeded` | Confirm booking is active |

### Orders Service

| Direction | Event | Trigger |
|-----------|-------|---------|
| Publishes | `orders.OrderPlaced` | Customer submits order |
| Publishes | `orders.ReadyForPayment` | Stock confirmed reserved |
| Publishes | `orders.OrderConfirmed` | Payment succeeded |
| Publishes | `orders.OrderCancelled` | Order cancelled |
| Publishes | `orders.OrderCompleted` | Booking marked as completed |
| Publishes | `orders.PaymentFailed` | Payment failed, notify customer |
| Publishes | `orders.RefundRequested` | Cancellation/return triggers refund |
| Subscribes | `inventory.StockReserved` | Lock price, move to AwaitingPayment |
| Subscribes | `inventory.StockUnavailable` | Mark order as OutOfStock |
| Subscribes | `inventory.BookingCancelled` | Update order on booking cancellation |
| Subscribes | `inventory.BookingCompleted` | Trigger deposit refund after return |
| Subscribes | `inventory.ReturnAssessedWithMissingItems` | Update order for missing items |
| Subscribes | `payments.PaymentSucceeded` | Confirm order |
| Subscribes | `payments.PaymentFailed` | Mark payment failed |
| Subscribes | `payments.RefundSucceeded` | Update order refund status |
| Subscribes | `payments.RefundFailed` | Flag refund failure |

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
| Subscribes | `orders.OrderCompleted` | Send order completed email |
| Subscribes | `orders.OrderCancelled` | Send cancellation email |
| Subscribes | `orders.PaymentFailed` | Send payment failure email |
| Subscribes | `auth.EmailVerificationRequested` | Send email verification link |
| Subscribes | `auth.PasswordResetRequested` | Send password reset link |
| Subscribes | `auth.EmailChanged` | Send email changed notification |
| Subscribes | `auth.EmailChangeVerificationRequested` | Send email change verification link |
| Subscribes | `auth.PasswordChanged` | Send password changed notification |

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

The v2 migration introduced its own set of challenges. Replacing RabbitMQ with Azure Service Bus required abstracting the messaging layer cleanly enough that the service code stayed unchanged — only the infrastructure wiring differed. Persisting ASP.NET Data Protection keys to Blob Storage was a small but critical fix; without it, every Container App revision invalidated all existing auth cookies. Switching from topic/subscription to plain queues meant rethinking event routing slightly, but since every event in this system has exactly one consumer the semantics are identical and the cost savings justified the change.

Separating Orders and Inventory into distinct services means each owns its data with no shared database and no referential integrity between them. To handle this, the Orders service snapshots pricing and customer details at the time of purchase so that updating a product contents or pricing later never corrupts a historical order. The Orders schema also went through some rethinking along the way. Fields that seemed useful upfront, like event type, guest count, and special requests, ended up unused once the actual flow took shape.

## Links

- [GitHub - V1 Release Tag](https://github.com/lbirchenough/TeacupBoutique/tree/v1.0.0)
- [GitHub - V2 Branch](https://github.com/lbirchenough/TeacupBoutique/tree/feature/v2-azure-managed-services)
