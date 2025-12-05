#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: |
  Complete payment processor integration for the eBay-style marketplace application.
  Implemented Stripe Connect and Square OAuth for seller payment processing.
  Sellers can choose Stripe, Square, or both to receive payments from buyers.
  Full onboarding flows with status tracking and enforcement before listing items.

backend:
  - task: "User Management Endpoints"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Added User model with Stripe account fields (stripe_account_id, onboarding_complete, charges_enabled, payouts_enabled). Created endpoints: POST /api/users/stripe-account (save Stripe account ID), GET /api/users/{user_id}/stripe-status (get user's Stripe status), POST /api/users/{user_id}/stripe-status-update (sync status from Stripe API)"
      - working: true
        agent: "testing"
        comment: "TESTED: All user management endpoints working correctly. POST /api/users/stripe-account successfully saves and updates Stripe account IDs (returns modified: false for new, modified: true for updates). GET /api/users/{user_id}/stripe-status returns proper status object with all required fields. POST /api/users/{user_id}/stripe-status-update syncs status from Stripe API. Handles non-existent users correctly with default values."

  - task: "Stripe Connect Account Creation"
    implemented: true
    working: true
    file: "/app/backend/stripe_connect.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Updated create-account endpoint to accept user_id and return it with account_id. Creates Express Connected Accounts with card_payments and transfers capabilities. Uses Stripe API key from environment variables."
      - working: true
        agent: "testing"
        comment: "TESTED: POST /api/stripe-connect/create-account working perfectly. Successfully creates Express Connected Accounts with valid account IDs (format: acct_*). Returns user_id, account_id, and success: true. Stripe API integration confirmed working with test keys."

  - task: "Stripe Account Onboarding Flow"
    implemented: true
    working: true
    file: "/app/backend/stripe_connect.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "create-account-link endpoint creates onboarding URLs for sellers. Includes refresh_url and return_url parameters. Supports both new onboarding and continuing incomplete onboarding."
      - working: true
        agent: "testing"
        comment: "TESTED: POST /api/stripe-connect/create-account-link working correctly. Creates valid onboarding URLs starting with https://connect.stripe.com/setup/. Accepts refresh_url and return_url parameters. Returns success: true and valid URL for account onboarding."

  - task: "Stripe Account Status Checking"
    implemented: true
    working: true
    file: "/app/backend/stripe_connect.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "account-status endpoint retrieves account details from Stripe API. Returns charges_enabled, payouts_enabled, details_submitted, and requirements (currently_due, eventually_due, past_due)"
      - working: true
        agent: "testing"
        comment: "TESTED: GET /api/stripe-connect/account-status/{account_id} working correctly. Returns all required fields: account_id, charges_enabled, payouts_enabled, details_submitted, and requirements object with currently_due, eventually_due, past_due arrays. Properly handles invalid account IDs with 400 status code and appropriate error messages."

  - task: "Stripe Dashboard Login Links"
    implemented: true
    working: true
    file: "/app/backend/stripe_connect.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "create-login-link endpoint generates temporary login URLs for sellers to access their Stripe Express dashboard"
      - working: true
        agent: "testing"
        comment: "TESTED: POST /api/stripe-connect/create-login-link/{account_id} working correctly. Properly returns 400 error for accounts that haven't completed onboarding (expected Stripe behavior). Error handling works correctly for invalid account IDs. Implementation is correct - login links can only be created after onboarding completion."

  - task: "Square OAuth Endpoints"
    implemented: true
    working: true
    file: "/app/backend/square_oauth.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Implemented Square OAuth integration with 6 endpoints: POST /api/square-connect/initiate-oauth (generate OAuth URL), POST /api/square-connect/exchange-token (exchange code for tokens), GET /api/square-connect/merchant-status/{merchant_id} (get merchant info), POST /api/square-connect/refresh-token (refresh expired token), POST /api/square-connect/revoke-token (disconnect merchant), GET /api/square-connect/test-connection (test API connection)"
      - working: true
        agent: "testing"
        comment: "TESTED: All Square OAuth endpoints working correctly. Fixed minor implementation issues: updated refresh-token and revoke-token endpoints to accept request body instead of query parameters, fixed merchant status endpoint to use list_merchants API. All 6 endpoints tested: POST /api/square-connect/initiate-oauth generates valid OAuth URLs with correct sandbox domain and state format, POST /api/square-connect/exchange-token properly handles invalid codes with 400 error, GET /api/square-connect/merchant-status correctly validates access tokens, POST /api/square-connect/refresh-token and revoke-token handle invalid tokens appropriately, GET /api/square-connect/test-connection successfully connects to Square sandbox API and returns location data."

  - task: "Square User Management Endpoints"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Added User model with Square fields (square_merchant_id, square_access_token, square_refresh_token, square_connected). Created endpoints: POST /api/users/square-account (save Square merchant details), GET /api/users/{user_id}/square-status (get user's Square connection status)"
      - working: true
        agent: "testing"
        comment: "TESTED: Square user management endpoints working perfectly. POST /api/users/square-account successfully saves and updates Square merchant details (returns modified: false for new users, modified: true for updates). GET /api/users/{user_id}/square-status returns proper status object with connected, merchant_id, and has_access_token fields. Handles non-existent users correctly with default values (connected: false, merchant_id: null, has_access_token: false). MongoDB integration confirmed working."

  - task: "PayPal OAuth Endpoints"
    implemented: true
    working: true
    file: "/app/backend/paypal_oauth.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Implemented PayPal OAuth integration with 5 endpoints: POST /api/paypal-connect/initiate-oauth (generate OAuth URL), POST /api/paypal-connect/exchange-token (exchange code for tokens and get user info), GET /api/paypal-connect/merchant-status/{payer_id} (get merchant info), POST /api/paypal-connect/refresh-token (refresh expired token), GET /api/paypal-connect/test-connection (test API connection)"
      - working: true
        agent: "testing"
        comment: "TESTED: All PayPal OAuth endpoints working correctly. Fixed refresh-token endpoint to accept request body instead of query parameters. All 5 endpoints tested: POST /api/paypal-connect/initiate-oauth generates valid OAuth URLs with correct sandbox domain and state format, POST /api/paypal-connect/exchange-token properly handles invalid codes and redirect URLs with 400 error, GET /api/paypal-connect/merchant-status correctly validates access tokens, POST /api/paypal-connect/refresh-token handles invalid tokens appropriately, GET /api/paypal-connect/test-connection successfully connects to PayPal sandbox API."

  - task: "PayPal User Management Endpoints"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Added User model with PayPal fields (paypal_payer_id, paypal_email, paypal_access_token, paypal_refresh_token, paypal_connected). Created endpoints: POST /api/users/paypal-account (save PayPal account details), GET /api/users/{user_id}/paypal-status (get user's PayPal connection status)"
      - working: true
        agent: "testing"
        comment: "TESTED: PayPal user management endpoints working perfectly. POST /api/users/paypal-account successfully saves and updates PayPal account details including payer_id, email, access_token, and refresh_token (returns modified: false for new users, modified: true for updates). GET /api/users/{user_id}/paypal-status returns proper status object with connected, payer_id, email, and has_access_token fields. Handles non-existent users correctly with default values (connected: false, all fields null/false). MongoDB integration confirmed working."

  - task: "Combined Payment Status Endpoint"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Created GET /api/users/{user_id}/payment-status endpoint that returns overall payment processor status across all three processors (Stripe, Square, PayPal). Returns has_any_processor flag and individual processor statuses with account IDs."
      - working: true
        agent: "testing"
        comment: "TESTED: Combined payment status endpoint working correctly. GET /api/users/{user_id}/payment-status returns comprehensive status across all three processors. For users with no processors: has_any_processor: false, all processor flags false. For users with connected processors: correctly shows individual processor statuses (stripe_connected, square_connected, paypal_connected) and includes account IDs (stripe_account_id, square_merchant_id, paypal_payer_id). Logic correctly determines has_any_processor based on actual processor readiness states."

frontend:
  - task: "Stripe Connect Page"
    implemented: true
    working: true
    file: "/app/frontend/src/pages/StripeConnect.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Created comprehensive StripeConnect page with: Connect button, onboarding flow, status display (4 badges: Account Status, Onboarding, Accept Payments, Receive Payouts), continue onboarding button for incomplete setup, refresh status button, view Stripe dashboard button, handles return from Stripe onboarding with URL params"
      - working: "NA"
        agent: "main"
        comment: "Ready for frontend testing - need to verify UI loads, buttons work, API calls succeed, status displays correctly"
      - working: true
        agent: "testing"
        comment: "TESTED: Stripe Connect page working correctly after fixing authentication redirect issue. Fixed hardcoded '/payment-processors' URLs to '/stripe-connect'. All UI elements present: Back to Dashboard button, Payment Setup heading, status alert, Stripe Connect card with gradient logo, 4 status badges (Account Status: Not Connected, Onboarding: Pending, Accept Payments: Disabled, Receive Payouts: Disabled), How Stripe Connect Works info section with 5 bullet points, Connect with Stripe button with gradient styling. Connect button triggers API calls to create-account endpoint. Authentication flow works correctly."

  - task: "Dashboard Stripe Integration"
    implemented: true
    working: true
    file: "/app/frontend/src/pages/Dashboard.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Updated Dashboard to check user.stripeConnected instead of paymentProcessors. Shows amber alert card if Stripe not connected. Payment Setup button (was Payment Processors) now links to /stripe-connect with Required badge if not connected"
      - working: "NA"
        agent: "main"
        comment: "Ready for frontend testing - need to verify alert displays, button links correctly, badge shows when required"
      - working: true
        agent: "testing"
        comment: "TESTED: Dashboard Stripe integration working correctly. Shows amber alert card with 'Action Required: Connect Stripe Account' title and message about connecting Stripe before listing items. 'Connect Now' button present and functional. Payment Setup button in settings section has amber border styling and 'Required' badge when Stripe not connected. Payment Setup button correctly redirects to /stripe-connect page."

  - task: "Sell Item Stripe Enforcement"
    implemented: true
    working: true
    file: "/app/frontend/src/pages/EnhancedSellItem.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Updated EnhancedSellItem to check user.stripeConnected before allowing item listing. Shows toast notification and redirects to /stripe-connect if not connected"
      - working: "NA"
        agent: "main"
        comment: "Ready for frontend testing - need to verify redirect happens, toast shows, access blocked without Stripe"
      - working: true
        agent: "testing"
        comment: "TESTED: Sell Item Stripe enforcement working correctly. When user without Stripe connection attempts to access /sell page, they are automatically redirected to /stripe-connect page. Toast notification appears with title 'Stripe account required' and message about connecting Stripe before listing items. Redirect happens after 2-second delay as designed. Access is properly blocked without Stripe connection."

  - task: "App Routing"
    implemented: true
    working: true
    file: "/app/frontend/src/App.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Added /stripe-connect route with StripeConnect component"
      - working: "NA"
        agent: "main"
        comment: "Ready for frontend testing - need to verify route works and page loads"
      - working: true
        agent: "testing"
        comment: "TESTED: App routing working correctly. /stripe-connect route properly configured and loads StripeConnect component. Route handles authentication redirects correctly - unauthenticated users are redirected to /auth with proper state preservation for return navigation. All navigation flows working as expected."

metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 1
  run_ui: false

test_plan:
  current_focus:
    - "Square Connect Page"
    - "PayPal Connect Page"
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
  - agent: "main"
    message: |
      Implemented complete Stripe Connect integration for marketplace:
      
      BACKEND:
      - Added User model with Stripe fields (account_id, onboarding_complete, charges/payouts enabled)
      - Created 3 user endpoints: save account ID, get status, sync status from Stripe
      - Updated Stripe Connect endpoints to work with user management
      - All endpoints use /api prefix for proper routing
      
      FRONTEND:
      - New StripeConnect page (/stripe-connect) with full onboarding flow
      - Status display shows 4 key metrics (Account, Onboarding, Charges, Payouts)
      - Handles return from Stripe with URL params (?stripe_return=success)
      - Refresh button to update status from Stripe API
      - View dashboard button for sellers
      - Continue onboarding for incomplete setup
      - Dashboard updated to show Stripe status and alert
      - Sell item page enforces Stripe connection before listing
      
      FLOW:
      1. User clicks "Connect with Stripe" button
      2. Backend creates Express Connected Account
      3. Backend saves account_id to user in MongoDB
      4. Backend creates Account Link (onboarding URL)
      5. Frontend redirects to Stripe's hosted onboarding
      6. User completes identity verification and bank setup
      7. Stripe redirects back to /stripe-connect?stripe_return=success
      8. Frontend fetches and displays account status
      9. User can now list items if charges_enabled && payouts_enabled
      
      TEST REQUIREMENTS:
      - Test user registration/login flow
      - Test Stripe Connect button creates account
      - Test onboarding redirect (will go to Stripe test mode)
      - Test status display after "returning" from Stripe
      - Test Dashboard shows alert when not connected
      - Test Sell Item blocks access without Stripe connected
      - Test all API endpoints return proper data
      - Verify MongoDB users collection stores Stripe data
      
      NOTES:
      - Using Stripe test keys from .env
      - Express Connected Accounts (easiest for sellers)
      - Platform fee: 5.5% (displayed to users)
      - Stripe fee: 2.9% + $0.30 (displayed to users)
      - All Stripe account IDs stored in MongoDB users collection

  - agent: "testing"
    message: |
      BACKEND TESTING COMPLETED - ALL CRITICAL FUNCTIONALITY WORKING ✅
      
      COMPREHENSIVE TEST RESULTS:
      ✅ User Management Endpoints (3/3 working)
        - POST /api/users/stripe-account: Saves/updates Stripe account IDs correctly
        - GET /api/users/{user_id}/stripe-status: Returns proper status objects
        - POST /api/users/{user_id}/stripe-status-update: Syncs from Stripe API successfully
      
      ✅ Stripe Connect Account Creation: Creates valid Express Connected Accounts
      ✅ Stripe Account Onboarding Flow: Generates valid onboarding URLs
      ✅ Stripe Account Status Checking: Returns complete account status with requirements
      ✅ Error Handling: Proper 400 responses for invalid accounts/users
      
      STRIPE API INTEGRATION CONFIRMED:
      - Test keys working correctly with Stripe API
      - Account creation returns valid account IDs (acct_* format)
      - Onboarding URLs generated successfully (connect.stripe.com format)
      - Status sync from Stripe API working
      - MongoDB integration working (users collection updated)
      
      EXPECTED BEHAVIORS CONFIRMED:
      - Login links correctly fail for non-onboarded accounts (Stripe requirement)
      - Invalid account IDs properly return 400 errors
      - Non-existent users return default status values
      
      ALL BACKEND APIS READY FOR PRODUCTION USE

  - agent: "testing"
    message: |
      FRONTEND TESTING COMPLETED - ALL STRIPE CONNECT FUNCTIONALITY WORKING ✅
      
      COMPREHENSIVE TEST RESULTS:
      ✅ Stripe Connect Page (/stripe-connect)
        - All UI elements present and functional
        - Back to Dashboard button, Payment Setup heading, status alert
        - Stripe Connect card with gradient logo and description
        - 4 status badges: Account Status (Not Connected), Onboarding (Pending), Accept Payments (Disabled), Receive Payouts (Disabled)
        - "How Stripe Connect Works" info section with 5 bullet points
        - Connect with Stripe button with gradient purple-to-blue styling
        - Connect button triggers API calls to create-account endpoint
        - Loading state shows "Connecting..." during API calls
        - Authentication flow works correctly
      
      ✅ Dashboard Integration (/dashboard)
        - Amber alert card displays when Stripe not connected
        - "Action Required: Connect Stripe Account" title and message
        - "Connect Now" button functional and redirects to /stripe-connect
        - Payment Setup button in settings has amber border and "Required" badge
        - Payment Setup button correctly redirects to /stripe-connect
      
      ✅ Sell Item Enforcement (/sell)
        - Users without Stripe connection automatically redirected to /stripe-connect
        - Toast notification appears: "Stripe account required"
        - 2-second delay before redirect as designed
        - Access properly blocked without Stripe connection
      
      ✅ Authentication Flow
        - Unauthenticated users redirected to /auth when accessing /stripe-connect
        - State preservation works for return navigation
        - All protected routes properly secured
      
      ✅ App Routing
        - /stripe-connect route properly configured
        - StripeConnect component loads correctly
        - All navigation flows working as expected
      
      CRITICAL FIX APPLIED:
      - Fixed hardcoded '/payment-processors' URLs to '/stripe-connect' in StripeConnect.jsx
      - Fixed authentication redirect path from '/payment-processors' to '/stripe-connect'
      - Fixed Stripe onboarding return URLs to use correct '/stripe-connect' path
      
      STRIPE INTEGRATION STATUS:
      - Frontend UI: ✅ Complete and functional
      - Backend APIs: ✅ Complete and functional (previously tested)
      - Authentication: ✅ Working correctly
      - Enforcement: ✅ Working correctly
      - User Experience: ✅ Smooth and intuitive
      
      ALL STRIPE CONNECT FEATURES READY FOR PRODUCTION USE

  - agent: "main"
    message: |
      PREPARING FOR SQUARE AND PAYPAL BACKEND TESTING
      
      IMPLEMENTED SQUARE INTEGRATION:
      Backend Endpoints (6 total):
      1. POST /api/square-connect/initiate-oauth - Generate OAuth authorization URL
      2. POST /api/square-connect/exchange-token - Exchange authorization code for access/refresh tokens
      3. GET /api/square-connect/merchant-status/{merchant_id} - Get merchant information
      4. POST /api/square-connect/refresh-token - Refresh expired access token
      5. POST /api/square-connect/revoke-token - Revoke/disconnect merchant access
      6. GET /api/square-connect/test-connection - Test Square API connection
      
      User Management Endpoints (2 total):
      1. POST /api/users/square-account - Save Square merchant details (merchant_id, access_token, refresh_token)
      2. GET /api/users/{user_id}/square-status - Get user's Square connection status
      
      IMPLEMENTED PAYPAL INTEGRATION:
      Backend Endpoints (5 total):
      1. POST /api/paypal-connect/initiate-oauth - Generate OAuth authorization URL
      2. POST /api/paypal-connect/exchange-token - Exchange code for tokens + get user info
      3. GET /api/paypal-connect/merchant-status/{payer_id} - Get merchant information
      4. POST /api/paypal-connect/refresh-token - Refresh expired access token
      5. GET /api/paypal-connect/test-connection - Test PayPal API connection
      
      User Management Endpoints (2 total):
      1. POST /api/users/paypal-account - Save PayPal account details (payer_id, email, tokens)
      2. GET /api/users/{user_id}/paypal-status - Get user's PayPal connection status
      
      COMBINED ENDPOINT:
      1. GET /api/users/{user_id}/payment-status - Get overall status across all 3 processors
      
      DATABASE SCHEMA:
      Square Fields: square_merchant_id, square_access_token, square_refresh_token, square_connected
      PayPal Fields: paypal_payer_id, paypal_email, paypal_access_token, paypal_refresh_token, paypal_connected
      
      TESTING REQUIREMENTS:
      - Test all Square OAuth endpoints with sandbox credentials
      - Test all PayPal OAuth endpoints with sandbox credentials  
      - Test user management endpoints for both processors
      - Test combined payment status endpoint
      - Verify MongoDB data persistence
      - Test error handling for invalid inputs
      - Test token refresh mechanisms
      - Test connection test endpoints
      
      ENVIRONMENT:
      - Square: Using sandbox environment with test credentials from .env
      - PayPal: Using sandbox mode with test credentials from .env
      - Both SDKs installed: squareup==43.2.0.20251016, paypalrestsdk==1.13.1