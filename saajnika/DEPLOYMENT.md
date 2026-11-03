# SAAJNIKA — Production Deployment, Security & DevOps Guide

This guide covers deployment procedures for SAAJNIKA across Docker Compose, managed cloud providers (AWS, GCP, DigitalOcean), Vercel (frontend), and Docker-compatible backend hosts (Railway, Render, AWS ECS).

---

## 1. Environment Configurations

All production deployments require a securely generated `.env` file based on `.env.example`:

```bash
DJANGO_SECRET_KEY=generate_with_python_secrets_token_urlsafe
DEBUG=False
ALLOWED_HOSTS=saajnika.com,www.saajnika.com,api.saajnika.com
DATABASE_URL=postgres://user:password@pg-host:5432/saajnika_prod
CELERY_BROKER_URL=redis://redis-host:6379/0
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=live_secret_...
RAZORPAY_WEBHOOK_SECRET=webhook_secret_...
```

---

## 2. All-Docker Deployment (Single Droplet / VM)

1. Provision an Ubuntu 22.04 LTS instance with minimum 2 vCPU and 4GB RAM.
2. Install Docker & Docker Compose:
   ```bash
   sudo apt-get update
   sudo apt-get install -y docker.io docker-compose
   sudo usermod -aG docker $USER
   ```
3. Clone repository and initialize environment:
   ```bash
   git clone https://github.com/client-org/saajnika.git
   cd saajnika
   cp .env.example .env
   nano .env # Configure secrets and keys
   ```
4. Build and boot the stack:
   ```bash
   docker-compose up --build -d
   ```
5. Run migrations and initial data setup:
   ```bash
   docker-compose exec backend python manage.py migrate
   docker-compose exec backend python manage.py seed_data
   ```

---

## 3. Split Cloud Deployment (Vercel Frontend + Managed Backend)

### Frontend (Vercel)
1. Import repository and set root directory to `frontend/`.
2. Framework preset: **Vite**.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Environment variable:
   `VITE_API_URL=https://api.saajnika.com/api`

### Backend (Docker / Cloud Run / Railway / ECS)
1. Build with `backend/Dockerfile`.
2. Connect managed PostgreSQL database (e.g. AWS RDS or Supabase).
3. Connect managed Redis (e.g. Upstash or AWS ElastiCache).
4. Run migrations: `python manage.py migrate`.

---

## 4. Database Backup & Restore Procedures

### Automated Daily PostgreSQL Backup
```bash
docker-compose exec postgres pg_dump -U saajnika_user -d saajnika_db -F c -b -v -f /var/lib/postgresql/data/backup_$(date +%Y%m%d_%H%M%S).dump
```

### Database Restoration
```bash
docker-compose exec postgres pg_restore -U saajnika_user -d saajnika_db -c -v /var/lib/postgresql/data/backup_filename.dump
```

---

## 5. Security & Idempotency Checklist

* **Payment Idempotency**: Webhook events are logged in `PaymentWebhookEvent` table. Duplicate events with identical `event_id` return HTTP 200 without double-crediting.
* **Server-Authoritative Pricing**: Total calculations, coupon discounts, and variant prices are derived strictly from database records; client-submitted totals are ignored.
* **Inventory Race Condition Protection**: Orders acquire database locks with `select_for_update()` inside `transaction.atomic()` blocks, guaranteeing negative stock is impossible.
* **JWT Token Rotation**: Access tokens expire in 60 minutes. Blacklisted tokens are rejected upon logout.
