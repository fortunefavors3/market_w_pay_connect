# CheqMart - Seller Marketplace Platform

## Original Problem Statement
A marketplace platform for sellers to list items, accept payments through multiple processors (Stripe, Square, PayPal, Authorize.net, Epic Payment Solutions), and manage their seller accounts with dashboards showing sales statistics and fee management.

## Core Requirements

### Payment Processing
- **OAuth Processors**: Stripe, Square, PayPal
- **Manual Credential Processors**: Authorize.net, Epic Payment Solutions
- Fee collection system for manual processors (5.5% platform fee)

### Fee Management System
- Fees due on the 5th of each month for previous month's transactions
- 15-day grace period after due date
- Visual indicators: Orange for grace period, Red for past due
- Account suspension for past-due fees

### Dashboard Features
- All-time sales and last 30-day sales statistics
- Fee tracking for manual processor users
- Account suspension banner and restrictions

### User Suspension System
- Suspended users cannot list new items
- Suspended users' active listings are hidden from buyers
- Clear messaging about suspension status and resolution

## What's Been Implemented

### December 2025
- **Epic Payment Solutions Integration**: Added manual payment processor
- **Authorize.net Logo Update**: Updated logo URL
- **Dashboard Overhaul**:
  - Sales statistics cards (all-time and 30-day)
  - Fee tracking section with color-coded statuses
  - Suspension banner and "Pay Now" button (placeholder)
- **User Suspension System**:
  - Backend endpoints for fee status and suspension checking
  - Frontend blocks for creating new listings when suspended
  - **NEW: Hidden listings for suspended sellers** (filters out products from suspended users on homepage, search, and product detail pages)
- **Dashboard Layout Update**: Integrations card moved above sales statistics cards

### Backend Endpoints Created
- `GET /api/users/{user_id}/sales-stats` - Sales statistics
- `GET /api/users/{user_id}/pending-fees` - Fee status and suspension
- `GET /api/users/{user_id}/suspension-status` - Quick suspension check
- `GET /api/suspended-seller-ids` - List of suspended seller IDs for frontend filtering
- `GET /api/products` - Products with suspended seller filtering
- `GET /api/products/{product_id}` - Single product with suspension check
- `GET /api/sellers/{seller_id}/products` - Seller's products with suspension check
- `POST /api/users/pay-fees` - Placeholder for fee payment

## Prioritized Backlog

### P0 - Critical
- Implement real Stripe payment for fee "Pay Now" button

### P1 - High Priority
- Move from mock data to real product database
- Implement proper server-side authentication (replace localStorage)

### P2 - Medium Priority
- Admin panel for fee management
- Email notifications for fee reminders
- Payment history view

### P3 - Low Priority
- Demo data seeding script refactor to `/scripts` directory
- Additional payment processor integrations

## Technical Architecture

### Frontend
- React with React Router
- Tailwind CSS + Shadcn/UI components
- Client-side auth via localStorage (to be replaced)

### Backend
- FastAPI with MongoDB (motor driver)
- Stripe, Square, PayPal OAuth integrations
- Authorize.net, Epic Payment Solutions credential verification

### Key Files
- `/app/frontend/src/pages/Dashboard.jsx` - Main seller dashboard
- `/app/frontend/src/pages/Home.jsx` - Homepage with product listings
- `/app/frontend/src/pages/SearchResults.jsx` - Search with filtering
- `/app/frontend/src/pages/ProductDetail.jsx` - Product detail page
- `/app/backend/server.py` - Main API endpoints

## Test Account
- Phone: `+15551234567`
- Password: `demo1234`
- User ID: `user_1768712792124`
- Status: Suspended (for demo purposes)

## Known Limitations
- "Pay Now" button is a placeholder (no actual payment processing)
- Products use mock data (not fetched from database)
- Authentication is client-side localStorage based
