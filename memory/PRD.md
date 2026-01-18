# CheqMart - Seller Marketplace Platform

## Original Problem Statement
A marketplace platform for sellers to list items, accept payments through multiple processors (Stripe, Square, PayPal, Authorize.net, Epic Payment Solutions), and manage their seller accounts with dashboards showing sales statistics and fee management.

## Core Requirements

### Payment Processing (Sellers Receiving Payments)
- **OAuth Processors**: Stripe, Square, PayPal
- **Manual Credential Processors**: Authorize.net, Epic Payment Solutions
- Sellers can use ANY processor they choose to receive payments from buyers

### Platform Fee Collection (From Sellers)
- Platform uses its OWN Stripe account to collect fees from sellers
- Sellers save a payment card to the platform for fee payments
- **Automatic Fee Collection**: Daily batch charges with seller consent
- **Manual Invoice Fallback**: For sellers without auto-charge or failed payments

### Fee Management System
- 5.5% platform fee on all sales
- **Auto-charge (Recommended)**: Daily charges for previous day's sales
- **Manual invoices**: Due on the 5th of each month with 15-day grace period
- Visual indicators: Orange for grace period, Red for past due
- Account suspension for past-due fees (15+ days overdue)

### Dashboard Features
- All-time sales and last 30-day sales statistics
- Fee tracking for manual processor users
- Account suspension banner and restrictions

### Fraud Prevention System
- **Phone Number Block**: Blocked phone numbers cannot register new accounts
- **Email Block**: Blocked emails cannot register new accounts
- **Payment Card Fingerprinting**: Blocked cards cannot be added to any account
- **Hard Block**: Any match prevents registration entirely
- Identifiers are blocked when user is suspended, unblocked when fees are paid

## What's Been Implemented

### January 2025 (Current Session)
- **Fraud Prevention System** (`/app/backend/fraud_prevention.py`):
  - Phone number blocking for suspended accounts
  - Email blocking for suspended accounts
  - Payment card fingerprinting and blocking
  - Hard block on registration if any identifier matches
  - Auto-block when user is suspended, auto-unblock when fees paid
- **Billing Settings Page**: New dedicated page for sellers to manage fee payments
  - Add/remove payment methods (Stripe Elements card collection)
  - Set default payment method
  - Enable/disable automatic fee charging
  - Terms agreement for auto-charge consent
  - Fee payment history view
- **Backend Billing System** (`/app/backend/billing.py`):
  - Stripe Customer creation for sellers
  - Setup Intent for secure card collection
  - Payment method management (save, delete, set default)
  - Card fingerprint check during payment method save
  - Auto-charge settings management
  - Fee charging endpoint
  - Daily batch processing endpoint
  - Failed charge retry system (2-day retry, then convert to invoice)
- **Dashboard Updates**:
  - Added "Billing Settings" button
  - Integrations card moved above sales cards
- **Hidden Listings for Suspended Sellers**: Products from suspended sellers are now filtered out

### December 2025 (Previous Session)
- Epic Payment Solutions Integration
- Authorize.net Logo Update
- Dashboard Overhaul with sales statistics
- User Suspension System

### Backend Endpoints Created
**Billing System:**
- `GET /api/billing/info/{user_id}` - Get billing info and saved payment methods
- `POST /api/billing/setup-intent` - Create Stripe Setup Intent for card collection
- `POST /api/billing/save-payment-method` - Save payment method after Setup Intent
- `POST /api/billing/set-default-payment-method` - Set default card
- `POST /api/billing/delete-payment-method` - Remove saved card
- `POST /api/billing/update-auto-charge` - Enable/disable auto-charge
- `POST /api/billing/charge-fees` - Charge fees immediately
- `GET /api/billing/charge-history/{user_id}` - Fee payment history
- `GET /api/billing/auto-charge-terms` - Terms and conditions
- `POST /api/billing/admin/process-daily-fees` - Daily batch processing (cron job)
- `POST /api/billing/admin/retry-failed-charges` - Retry failed charges

**Other:**
- Sales stats, fee status, suspension endpoints
- Suspended seller filtering endpoints

## Prioritized Backlog

### P0 - Critical
- Set up cron job to call `/api/billing/admin/process-daily-fees` daily
- Email notifications for failed charges

### P1 - High Priority
- Move from mock product data to real database
- Implement proper server-side authentication (replace localStorage)

### P2 - Medium Priority
- Admin panel for fee/invoice management
- Email reminders before fees are due
- Payment receipt emails

### P3 - Low Priority
- Demo data seeding script refactor
- Additional payment processor integrations

## Technical Architecture

### Frontend
- React with React Router
- Tailwind CSS + Shadcn/UI components
- **Stripe Elements** for secure card collection
- Client-side auth via localStorage (to be replaced)

### Backend
- FastAPI with MongoDB (motor driver)
- **Platform Stripe Account** for fee collection
- Seller payment processors for receiving buyer payments

### Key Files
- `/app/frontend/src/pages/BillingSettings.jsx` - New billing settings page
- `/app/backend/billing.py` - Fee collection and payment method management
- `/app/frontend/src/pages/Dashboard.jsx` - Main seller dashboard
- `/app/backend/server.py` - Main API endpoints

## Database Collections
- `users` - User profiles including billing_stripe_customer_id, billing_default_payment_method_id, billing_auto_charge_enabled
- `fee_charges` - Successful fee charge records
- `fee_charge_failures` - Failed charges for retry/conversion
- `fee_invoices` - Manual invoices for non-auto-charge users
- `payments` - Sales transactions

## Test Account
- Phone: `+15551234567`
- Password: `demo1234`
- User ID: `user_1768712792124`
- Status: Suspended (for demo purposes)

## Known Limitations
- Daily batch job requires external cron setup (endpoint ready)
- Email notifications not yet implemented
- Products use mock data (not fetched from database)
- Authentication is client-side localStorage based

