#!/usr/bin/env python3
"""
Comprehensive Backend Test Suite for Payment Processor Integration
Tests Stripe Connect, Square OAuth, and PayPal OAuth endpoints and user management functionality
"""

import requests
import json
import uuid
from datetime import datetime

# Configuration
BASE_URL = "https://processor-connect.preview.emergentagent.com/api"
TEST_USER_ID = f"test_user_{uuid.uuid4().hex[:8]}"
TEST_USER_ID_2 = f"test_user_{uuid.uuid4().hex[:8]}"
TEST_USER_ID_3 = f"test_user_{uuid.uuid4().hex[:8]}"
TEST_EMAIL = f"seller_{uuid.uuid4().hex[:8]}@testmarketplace.com"
TEST_EMAIL_2 = f"seller_{uuid.uuid4().hex[:8]}@testmarketplace.com"
TEST_EMAIL_3 = f"seller_{uuid.uuid4().hex[:8]}@testmarketplace.com"

# Global variables to store test data
created_account_id = None
created_account_id_2 = None
square_oauth_state = None
paypal_oauth_state = None

def log_test(test_name, status, details=""):
    """Log test results with timestamp"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    status_symbol = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️"
    print(f"[{timestamp}] {status_symbol} {test_name}")
    if details:
        print(f"    Details: {details}")
    print()

def make_request(method, endpoint, data=None, expected_status=200):
    """Make HTTP request and return response"""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method == "GET":
            response = requests.get(url, timeout=30)
        elif method == "POST":
            response = requests.post(url, json=data, timeout=30)
        elif method == "PUT":
            response = requests.put(url, json=data, timeout=30)
        elif method == "DELETE":
            response = requests.delete(url, timeout=30)
        
        print(f"    Request: {method} {url}")
        if data:
            print(f"    Body: {json.dumps(data, indent=2)}")
        print(f"    Response Status: {response.status_code}")
        
        try:
            response_json = response.json()
            print(f"    Response Body: {json.dumps(response_json, indent=2)}")
        except:
            print(f"    Response Body: {response.text}")
        
        return response
        
    except requests.exceptions.RequestException as e:
        print(f"    Request failed: {str(e)}")
        return None

def test_stripe_connect_create_account():
    """Test POST /api/stripe-connect/create-account"""
    global created_account_id
    
    test_data = {
        "user_id": TEST_USER_ID,
        "email": TEST_EMAIL,
        "business_type": "individual",
        "country": "US"
    }
    
    response = make_request("POST", "/stripe-connect/create-account", test_data)
    
    if response and response.status_code == 200:
        data = response.json()
        if data.get("success") and data.get("account_id") and data["account_id"].startswith("acct_"):
            created_account_id = data["account_id"]
            log_test("Stripe Connect Account Creation", "PASS", 
                    f"Created account: {created_account_id}")
            return True
        else:
            log_test("Stripe Connect Account Creation", "FAIL", 
                    "Response missing required fields or invalid account_id format")
            return False
    else:
        log_test("Stripe Connect Account Creation", "FAIL", 
                f"Request failed or unexpected status code")
        return False

def test_stripe_connect_create_account_second():
    """Test creating a second Stripe Connect account for additional testing"""
    global created_account_id_2
    
    test_data = {
        "user_id": TEST_USER_ID_2,
        "email": TEST_EMAIL_2,
        "business_type": "individual",
        "country": "US"
    }
    
    response = make_request("POST", "/stripe-connect/create-account", test_data)
    
    if response and response.status_code == 200:
        data = response.json()
        if data.get("success") and data.get("account_id") and data["account_id"].startswith("acct_"):
            created_account_id_2 = data["account_id"]
            log_test("Second Stripe Connect Account Creation", "PASS", 
                    f"Created second account: {created_account_id_2}")
            return True
        else:
            log_test("Second Stripe Connect Account Creation", "FAIL", 
                    "Response missing required fields or invalid account_id format")
            return False
    else:
        log_test("Second Stripe Connect Account Creation", "FAIL", 
                f"Request failed or unexpected status code")
        return False

def test_user_stripe_account_save():
    """Test POST /api/users/stripe-account"""
    if not created_account_id:
        log_test("User Stripe Account Save", "FAIL", "No account_id available from previous test")
        return False
    
    test_data = {
        "user_id": TEST_USER_ID,
        "stripe_account_id": created_account_id
    }
    
    response = make_request("POST", "/users/stripe-account", test_data)
    
    if response and response.status_code == 200:
        data = response.json()
        if data.get("success") is True:
            log_test("User Stripe Account Save", "PASS", 
                    f"Saved account {created_account_id} to user {TEST_USER_ID}")
            return True
        else:
            log_test("User Stripe Account Save", "FAIL", 
                    "Response success field is not True")
            return False
    else:
        log_test("User Stripe Account Save", "FAIL", 
                f"Request failed or unexpected status code")
        return False

def test_user_stripe_account_update():
    """Test updating existing user's Stripe account (should show modified: true)"""
    if not created_account_id_2:
        log_test("User Stripe Account Update", "FAIL", "No second account_id available")
        return False
    
    test_data = {
        "user_id": TEST_USER_ID,
        "stripe_account_id": created_account_id_2
    }
    
    response = make_request("POST", "/users/stripe-account", test_data)
    
    if response and response.status_code == 200:
        data = response.json()
        if data.get("success") is True and data.get("modified") is True:
            log_test("User Stripe Account Update", "PASS", 
                    f"Updated user {TEST_USER_ID} with new account {created_account_id_2}")
            return True
        else:
            log_test("User Stripe Account Update", "FAIL", 
                    f"Expected modified: true, got: {data}")
            return False
    else:
        log_test("User Stripe Account Update", "FAIL", 
                f"Request failed or unexpected status code")
        return False

def test_user_stripe_status_get():
    """Test GET /api/users/{user_id}/stripe-status"""
    response = make_request("GET", f"/users/{TEST_USER_ID}/stripe-status")
    
    if response and response.status_code == 200:
        data = response.json()
        required_fields = ["has_account", "stripe_account_id", "onboarding_complete", 
                          "charges_enabled", "payouts_enabled"]
        
        if all(field in data for field in required_fields):
            if data["has_account"] and data["stripe_account_id"]:
                log_test("User Stripe Status Get", "PASS", 
                        f"Retrieved status for user {TEST_USER_ID}")
                return True
            else:
                log_test("User Stripe Status Get", "FAIL", 
                        "User should have account but has_account is False")
                return False
        else:
            missing_fields = [f for f in required_fields if f not in data]
            log_test("User Stripe Status Get", "FAIL", 
                    f"Missing required fields: {missing_fields}")
            return False
    else:
        log_test("User Stripe Status Get", "FAIL", 
                f"Request failed or unexpected status code")
        return False

def test_user_stripe_status_nonexistent():
    """Test GET /api/users/{user_id}/stripe-status for non-existent user"""
    fake_user_id = f"nonexistent_user_{uuid.uuid4().hex[:8]}"
    response = make_request("GET", f"/users/{fake_user_id}/stripe-status")
    
    if response and response.status_code == 200:
        data = response.json()
        if (data.get("has_account") is False and 
            data.get("stripe_account_id") is None and
            data.get("onboarding_complete") is False):
            log_test("User Stripe Status Non-existent", "PASS", 
                    "Correctly returned default status for non-existent user")
            return True
        else:
            log_test("User Stripe Status Non-existent", "FAIL", 
                    f"Unexpected response for non-existent user: {data}")
            return False
    else:
        log_test("User Stripe Status Non-existent", "FAIL", 
                f"Request failed or unexpected status code")
        return False

def test_stripe_connect_create_account_link():
    """Test POST /api/stripe-connect/create-account-link"""
    if not created_account_id_2:
        log_test("Stripe Connect Account Link", "FAIL", "No account_id available")
        return False
    
    test_data = {
        "account_id": created_account_id_2,
        "refresh_url": "https://example.com/refresh",
        "return_url": "https://example.com/return"
    }
    
    response = make_request("POST", "/stripe-connect/create-account-link", test_data)
    
    if response and response.status_code == 200:
        data = response.json()
        if (data.get("success") is True and 
            data.get("url") and 
            data["url"].startswith("https://connect.stripe.com/")):
            log_test("Stripe Connect Account Link", "PASS", 
                    f"Created onboarding URL: {data['url'][:50]}...")
            return True
        else:
            log_test("Stripe Connect Account Link", "FAIL", 
                    "Response missing success or invalid URL format")
            return False
    else:
        log_test("Stripe Connect Account Link", "FAIL", 
                f"Request failed or unexpected status code")
        return False

def test_stripe_connect_account_status():
    """Test GET /api/stripe-connect/account-status/{account_id}"""
    if not created_account_id_2:
        log_test("Stripe Connect Account Status", "FAIL", "No account_id available")
        return False
    
    response = make_request("GET", f"/stripe-connect/account-status/{created_account_id_2}")
    
    if response and response.status_code == 200:
        data = response.json()
        required_fields = ["account_id", "charges_enabled", "payouts_enabled", 
                          "details_submitted", "requirements"]
        
        if all(field in data for field in required_fields):
            if data["account_id"] == created_account_id_2:
                log_test("Stripe Connect Account Status", "PASS", 
                        f"Retrieved status for account {created_account_id_2}")
                return True
            else:
                log_test("Stripe Connect Account Status", "FAIL", 
                        f"Account ID mismatch: expected {created_account_id_2}, got {data.get('account_id')}")
                return False
        else:
            missing_fields = [f for f in required_fields if f not in data]
            log_test("Stripe Connect Account Status", "FAIL", 
                    f"Missing required fields: {missing_fields}")
            return False
    else:
        log_test("Stripe Connect Account Status", "FAIL", 
                f"Request failed or unexpected status code")
        return False

def test_stripe_connect_account_status_invalid():
    """Test GET /api/stripe-connect/account-status/{account_id} with invalid account"""
    fake_account_id = "acct_invalid123456789"
    response = make_request("GET", f"/stripe-connect/account-status/{fake_account_id}")
    
    if response is not None and response.status_code == 400:
        log_test("Stripe Connect Account Status Invalid", "PASS", 
                "Correctly returned 400 for invalid account ID")
        return True
    else:
        log_test("Stripe Connect Account Status Invalid", "FAIL", 
                f"Expected 400 status code, got {response.status_code if response else 'None'}")
        return False

def test_stripe_connect_create_login_link():
    """Test POST /api/stripe-connect/create-login-link/{account_id} (will fail for non-onboarded accounts)"""
    if not created_account_id_2:
        log_test("Stripe Connect Login Link", "FAIL", "No account_id available")
        return False
    
    response = make_request("POST", f"/stripe-connect/create-login-link/{created_account_id_2}")
    
    # This should fail with 400 since the account hasn't completed onboarding
    if response is not None and response.status_code == 400:
        log_test("Stripe Connect Login Link", "PASS", 
                "Correctly returned 400 for account that hasn't completed onboarding (expected)")
        return True
    else:
        log_test("Stripe Connect Login Link", "FAIL", 
                f"Expected 400 status code, got {response.status_code if response else 'None'}")
        return False

def test_stripe_connect_create_login_link_invalid():
    """Test POST /api/stripe-connect/create-login-link/{account_id} with invalid account"""
    fake_account_id = "acct_invalid123456789"
    response = make_request("POST", f"/stripe-connect/create-login-link/{fake_account_id}")
    
    if response is not None and response.status_code == 400:
        log_test("Stripe Connect Login Link Invalid", "PASS", 
                "Correctly returned 400 for invalid account ID")
        return True
    else:
        log_test("Stripe Connect Login Link Invalid", "FAIL", 
                f"Expected 400 status code, got {response.status_code if response else 'None'}")
        return False

def test_user_stripe_status_update():
    """Test POST /api/users/{user_id}/stripe-status-update"""
    response = make_request("POST", f"/users/{TEST_USER_ID}/stripe-status-update")
    
    if response and response.status_code == 200:
        data = response.json()
        if data.get("success") is True:
            log_test("User Stripe Status Update", "PASS", 
                    f"Successfully synced status from Stripe API for user {TEST_USER_ID}")
            return True
        else:
            log_test("User Stripe Status Update", "FAIL", 
                    f"Response success field is not True: {data}")
            return False
    else:
        log_test("User Stripe Status Update", "FAIL", 
                f"Request failed or unexpected status code")
        return False

def test_user_stripe_status_update_no_account():
    """Test POST /api/users/{user_id}/stripe-status-update for user without Stripe account"""
    fake_user_id = f"no_stripe_user_{uuid.uuid4().hex[:8]}"
    response = make_request("POST", f"/users/{fake_user_id}/stripe-status-update")
    
    if response and response.status_code == 200:
        data = response.json()
        if data.get("success") is False and "No Stripe account found" in data.get("error", ""):
            log_test("User Stripe Status Update No Account", "PASS", 
                    "Correctly returned error for user without Stripe account")
            return True
        else:
            log_test("User Stripe Status Update No Account", "FAIL", 
                    f"Unexpected response: {data}")
            return False
    else:
        log_test("User Stripe Status Update No Account", "FAIL", 
                f"Request failed or unexpected status code")
        return False

# ============================================================================
# SQUARE OAUTH TESTS
# ============================================================================

def test_square_initiate_oauth():
    """Test POST /api/square-connect/initiate-oauth"""
    global square_oauth_state
    
    test_data = {
        "user_id": TEST_USER_ID,
        "redirect_url": "https://example.com/square-callback"
    }
    
    response = make_request("POST", "/square-connect/initiate-oauth", test_data)
    
    if response and response.status_code == 200:
        data = response.json()
        if (data.get("success") is True and 
            data.get("authorization_url") and 
            data.get("state") and
            "connect.squareupsandbox.com" in data["authorization_url"] and
            data["state"].startswith(TEST_USER_ID)):
            square_oauth_state = data["state"]
            log_test("Square Initiate OAuth", "PASS", 
                    f"Generated OAuth URL with state: {data['state']}")
            return True
        else:
            log_test("Square Initiate OAuth", "FAIL", 
                    "Response missing required fields or invalid URL format")
            return False
    else:
        log_test("Square Initiate OAuth", "FAIL", 
                f"Request failed or unexpected status code")
        return False

def test_square_exchange_token():
    """Test POST /api/square-connect/exchange-token (will fail without real OAuth code)"""
    test_data = {
        "code": "fake_authorization_code_12345",
        "state": square_oauth_state or f"{TEST_USER_ID}_fake_state"
    }
    
    response = make_request("POST", "/square-connect/exchange-token", test_data)
    
    # This should fail with 400 since we're using a fake code
    if response is not None and response.status_code == 400:
        log_test("Square Exchange Token", "PASS", 
                "Correctly returned 400 for invalid authorization code (expected)")
        return True
    else:
        log_test("Square Exchange Token", "FAIL", 
                f"Expected 400 status code, got {response.status_code if response else 'None'}")
        return False

def test_square_merchant_status():
    """Test GET /api/square-connect/merchant-status/{merchant_id}"""
    fake_merchant_id = "fake_merchant_123"
    fake_access_token = "fake_access_token_456"
    
    response = make_request("GET", f"/square-connect/merchant-status/{fake_merchant_id}?access_token={fake_access_token}")
    
    # This should fail with 400 since we're using fake credentials
    if response is not None and response.status_code == 400:
        log_test("Square Merchant Status", "PASS", 
                "Correctly returned 400 for invalid merchant credentials (expected)")
        return True
    else:
        log_test("Square Merchant Status", "FAIL", 
                f"Expected 400 status code, got {response.status_code if response else 'None'}")
        return False

def test_square_refresh_token():
    """Test POST /api/square-connect/refresh-token"""
    test_data = {
        "refresh_token": "fake_refresh_token_123"
    }
    
    response = make_request("POST", "/square-connect/refresh-token", test_data)
    
    # This should fail with 400 since we're using a fake token
    if response is not None and response.status_code == 400:
        log_test("Square Refresh Token", "PASS", 
                "Correctly returned 400 for invalid refresh token (expected)")
        return True
    else:
        log_test("Square Refresh Token", "FAIL", 
                f"Expected 400 status code, got {response.status_code if response else 'None'}")
        return False

def test_square_revoke_token():
    """Test POST /api/square-connect/revoke-token"""
    test_data = {
        "access_token": "fake_access_token_123"
    }
    
    response = make_request("POST", "/square-connect/revoke-token", test_data)
    
    # This should fail with 400 since we're using a fake token
    if response is not None and response.status_code == 400:
        log_test("Square Revoke Token", "PASS", 
                "Correctly returned 400 for invalid access token (expected)")
        return True
    else:
        log_test("Square Revoke Token", "FAIL", 
                f"Expected 400 status code, got {response.status_code if response else 'None'}")
        return False

def test_square_test_connection():
    """Test GET /api/square-connect/test-connection"""
    response = make_request("GET", "/square-connect/test-connection")
    
    if response and response.status_code == 200:
        data = response.json()
        if (data.get("success") is True and 
            data.get("environment") == "sandbox" and
            data.get("message") and
            "locations" in data):
            log_test("Square Test Connection", "PASS", 
                    f"Square API connection successful in {data['environment']} mode")
            return True
        else:
            log_test("Square Test Connection", "FAIL", 
                    "Response missing required fields")
            return False
    else:
        log_test("Square Test Connection", "FAIL", 
                f"Request failed or unexpected status code")
        return False

# ============================================================================
# SQUARE USER MANAGEMENT TESTS
# ============================================================================

def test_square_user_account_save():
    """Test POST /api/users/square-account"""
    test_data = {
        "user_id": TEST_USER_ID,
        "merchant_id": "fake_merchant_123",
        "access_token": "fake_access_token_456",
        "refresh_token": "fake_refresh_token_789"
    }
    
    response = make_request("POST", "/users/square-account", test_data)
    
    if response and response.status_code == 200:
        data = response.json()
        if data.get("success") is True:
            log_test("Square User Account Save", "PASS", 
                    f"Saved Square account for user {TEST_USER_ID}")
            return True
        else:
            log_test("Square User Account Save", "FAIL", 
                    "Response success field is not True")
            return False
    else:
        log_test("Square User Account Save", "FAIL", 
                f"Request failed or unexpected status code")
        return False

def test_square_user_account_update():
    """Test updating existing user's Square account (should show modified: true)"""
    test_data = {
        "user_id": TEST_USER_ID,
        "merchant_id": "updated_merchant_456",
        "access_token": "updated_access_token_789",
        "refresh_token": "updated_refresh_token_012"
    }
    
    response = make_request("POST", "/users/square-account", test_data)
    
    if response and response.status_code == 200:
        data = response.json()
        if data.get("success") is True and data.get("modified") is True:
            log_test("Square User Account Update", "PASS", 
                    f"Updated Square account for user {TEST_USER_ID}")
            return True
        else:
            log_test("Square User Account Update", "FAIL", 
                    f"Expected modified: true, got: {data}")
            return False
    else:
        log_test("Square User Account Update", "FAIL", 
                f"Request failed or unexpected status code")
        return False

def test_square_user_status_get():
    """Test GET /api/users/{user_id}/square-status"""
    response = make_request("GET", f"/users/{TEST_USER_ID}/square-status")
    
    if response and response.status_code == 200:
        data = response.json()
        required_fields = ["connected", "merchant_id", "has_access_token"]
        
        if all(field in data for field in required_fields):
            if data["connected"] and data["merchant_id"] and data["has_access_token"]:
                log_test("Square User Status Get", "PASS", 
                        f"Retrieved Square status for user {TEST_USER_ID}")
                return True
            else:
                log_test("Square User Status Get", "FAIL", 
                        "User should have Square account but status shows disconnected")
                return False
        else:
            missing_fields = [f for f in required_fields if f not in data]
            log_test("Square User Status Get", "FAIL", 
                    f"Missing required fields: {missing_fields}")
            return False
    else:
        log_test("Square User Status Get", "FAIL", 
                f"Request failed or unexpected status code")
        return False

def test_square_user_status_nonexistent():
    """Test GET /api/users/{user_id}/square-status for non-existent user"""
    fake_user_id = f"nonexistent_user_{uuid.uuid4().hex[:8]}"
    response = make_request("GET", f"/users/{fake_user_id}/square-status")
    
    if response and response.status_code == 200:
        data = response.json()
        if (data.get("connected") is False and 
            data.get("merchant_id") is None and
            data.get("has_access_token") is False):
            log_test("Square User Status Non-existent", "PASS", 
                    "Correctly returned default status for non-existent user")
            return True
        else:
            log_test("Square User Status Non-existent", "FAIL", 
                    f"Unexpected response for non-existent user: {data}")
            return False
    else:
        log_test("Square User Status Non-existent", "FAIL", 
                f"Request failed or unexpected status code")
        return False

# ============================================================================
# PAYPAL OAUTH TESTS
# ============================================================================

def test_paypal_initiate_oauth():
    """Test POST /api/paypal-connect/initiate-oauth"""
    global paypal_oauth_state
    
    test_data = {
        "user_id": TEST_USER_ID_2,
        "redirect_url": "https://example.com/paypal-callback"
    }
    
    response = make_request("POST", "/paypal-connect/initiate-oauth", test_data)
    
    if response and response.status_code == 200:
        data = response.json()
        if (data.get("success") is True and 
            data.get("authorization_url") and 
            data.get("state") and
            "sandbox.paypal.com" in data["authorization_url"] and
            data["state"].startswith(TEST_USER_ID_2)):
            paypal_oauth_state = data["state"]
            log_test("PayPal Initiate OAuth", "PASS", 
                    f"Generated OAuth URL with state: {data['state']}")
            return True
        else:
            log_test("PayPal Initiate OAuth", "FAIL", 
                    "Response missing required fields or invalid URL format")
            return False
    else:
        log_test("PayPal Initiate OAuth", "FAIL", 
                f"Request failed or unexpected status code")
        return False

def test_paypal_exchange_token():
    """Test POST /api/paypal-connect/exchange-token (will fail without real OAuth code)"""
    test_data = {
        "code": "fake_authorization_code_12345",
        "state": paypal_oauth_state or f"{TEST_USER_ID_2}_fake_state"
    }
    
    response = make_request("POST", "/paypal-connect/exchange-token?redirect_url=https://example.com/paypal-callback", test_data)
    
    # This should fail with 400 since we're using a fake code
    if response is not None and response.status_code == 400:
        log_test("PayPal Exchange Token", "PASS", 
                "Correctly returned 400 for invalid authorization code (expected)")
        return True
    else:
        log_test("PayPal Exchange Token", "FAIL", 
                f"Expected 400 status code, got {response.status_code if response else 'None'}")
        return False

def test_paypal_merchant_status():
    """Test GET /api/paypal-connect/merchant-status/{payer_id}"""
    fake_payer_id = "fake_payer_123"
    fake_access_token = "fake_access_token_456"
    
    response = make_request("GET", f"/paypal-connect/merchant-status/{fake_payer_id}?access_token={fake_access_token}")
    
    # This should fail with 400 since we're using fake credentials
    if response is not None and response.status_code == 400:
        log_test("PayPal Merchant Status", "PASS", 
                "Correctly returned 400 for invalid merchant credentials (expected)")
        return True
    else:
        log_test("PayPal Merchant Status", "FAIL", 
                f"Expected 400 status code, got {response.status_code if response else 'None'}")
        return False

def test_paypal_refresh_token():
    """Test POST /api/paypal-connect/refresh-token"""
    test_data = {
        "refresh_token": "fake_refresh_token_123"
    }
    
    response = make_request("POST", "/paypal-connect/refresh-token", test_data)
    
    # This should fail with 400 since we're using a fake token
    if response is not None and response.status_code == 400:
        log_test("PayPal Refresh Token", "PASS", 
                "Correctly returned 400 for invalid refresh token (expected)")
        return True
    else:
        log_test("PayPal Refresh Token", "FAIL", 
                f"Expected 400 status code, got {response.status_code if response else 'None'}")
        return False

def test_paypal_test_connection():
    """Test GET /api/paypal-connect/test-connection"""
    response = make_request("GET", "/paypal-connect/test-connection")
    
    if response and response.status_code == 200:
        data = response.json()
        if (data.get("success") is True and 
            data.get("mode") == "sandbox" and
            data.get("message")):
            log_test("PayPal Test Connection", "PASS", 
                    f"PayPal API connection successful in {data['mode']} mode")
            return True
        else:
            log_test("PayPal Test Connection", "FAIL", 
                    "Response missing required fields")
            return False
    else:
        log_test("PayPal Test Connection", "FAIL", 
                f"Request failed or unexpected status code")
        return False

# ============================================================================
# PAYPAL USER MANAGEMENT TESTS
# ============================================================================

def test_paypal_user_account_save():
    """Test POST /api/users/paypal-account"""
    test_data = {
        "user_id": TEST_USER_ID_2,
        "payer_id": "fake_payer_123",
        "email": TEST_EMAIL_2,
        "access_token": "fake_access_token_456",
        "refresh_token": "fake_refresh_token_789"
    }
    
    response = make_request("POST", "/users/paypal-account", test_data)
    
    if response and response.status_code == 200:
        data = response.json()
        if data.get("success") is True:
            log_test("PayPal User Account Save", "PASS", 
                    f"Saved PayPal account for user {TEST_USER_ID_2}")
            return True
        else:
            log_test("PayPal User Account Save", "FAIL", 
                    "Response success field is not True")
            return False
    else:
        log_test("PayPal User Account Save", "FAIL", 
                f"Request failed or unexpected status code")
        return False

def test_paypal_user_account_update():
    """Test updating existing user's PayPal account (should show modified: true)"""
    test_data = {
        "user_id": TEST_USER_ID_2,
        "payer_id": "updated_payer_456",
        "email": f"updated_{TEST_EMAIL_2}",
        "access_token": "updated_access_token_789",
        "refresh_token": "updated_refresh_token_012"
    }
    
    response = make_request("POST", "/users/paypal-account", test_data)
    
    if response and response.status_code == 200:
        data = response.json()
        if data.get("success") is True and data.get("modified") is True:
            log_test("PayPal User Account Update", "PASS", 
                    f"Updated PayPal account for user {TEST_USER_ID_2}")
            return True
        else:
            log_test("PayPal User Account Update", "FAIL", 
                    f"Expected modified: true, got: {data}")
            return False
    else:
        log_test("PayPal User Account Update", "FAIL", 
                f"Request failed or unexpected status code")
        return False

def test_paypal_user_status_get():
    """Test GET /api/users/{user_id}/paypal-status"""
    response = make_request("GET", f"/users/{TEST_USER_ID_2}/paypal-status")
    
    if response and response.status_code == 200:
        data = response.json()
        required_fields = ["connected", "payer_id", "email", "has_access_token"]
        
        if all(field in data for field in required_fields):
            if data["connected"] and data["payer_id"] and data["email"] and data["has_access_token"]:
                log_test("PayPal User Status Get", "PASS", 
                        f"Retrieved PayPal status for user {TEST_USER_ID_2}")
                return True
            else:
                log_test("PayPal User Status Get", "FAIL", 
                        "User should have PayPal account but status shows disconnected")
                return False
        else:
            missing_fields = [f for f in required_fields if f not in data]
            log_test("PayPal User Status Get", "FAIL", 
                    f"Missing required fields: {missing_fields}")
            return False
    else:
        log_test("PayPal User Status Get", "FAIL", 
                f"Request failed or unexpected status code")
        return False

def test_paypal_user_status_nonexistent():
    """Test GET /api/users/{user_id}/paypal-status for non-existent user"""
    fake_user_id = f"nonexistent_user_{uuid.uuid4().hex[:8]}"
    response = make_request("GET", f"/users/{fake_user_id}/paypal-status")
    
    if response and response.status_code == 200:
        data = response.json()
        if (data.get("connected") is False and 
            data.get("payer_id") is None and
            data.get("email") is None and
            data.get("has_access_token") is False):
            log_test("PayPal User Status Non-existent", "PASS", 
                    "Correctly returned default status for non-existent user")
            return True
        else:
            log_test("PayPal User Status Non-existent", "FAIL", 
                    f"Unexpected response for non-existent user: {data}")
            return False
    else:
        log_test("PayPal User Status Non-existent", "FAIL", 
                f"Request failed or unexpected status code")
        return False

# ============================================================================
# COMBINED PAYMENT STATUS TESTS
# ============================================================================

def test_payment_status_no_processors():
    """Test GET /api/users/{user_id}/payment-status for user with no processors"""
    fake_user_id = f"no_processors_user_{uuid.uuid4().hex[:8]}"
    response = make_request("GET", f"/users/{fake_user_id}/payment-status")
    
    if response and response.status_code == 200:
        data = response.json()
        required_fields = ["has_any_processor", "stripe_connected", "square_connected", "paypal_connected"]
        
        if all(field in data for field in required_fields):
            if (data["has_any_processor"] is False and 
                data["stripe_connected"] is False and
                data["square_connected"] is False and
                data["paypal_connected"] is False):
                log_test("Payment Status No Processors", "PASS", 
                        "Correctly returned no processors connected for new user")
                return True
            else:
                log_test("Payment Status No Processors", "FAIL", 
                        f"Expected all processors false, got: {data}")
                return False
        else:
            missing_fields = [f for f in required_fields if f not in data]
            log_test("Payment Status No Processors", "FAIL", 
                    f"Missing required fields: {missing_fields}")
            return False
    else:
        log_test("Payment Status No Processors", "FAIL", 
                f"Request failed or unexpected status code")
        return False

def test_payment_status_with_processors():
    """Test GET /api/users/{user_id}/payment-status for user with processors connected"""
    response = make_request("GET", f"/users/{TEST_USER_ID}/payment-status")
    
    if response and response.status_code == 200:
        data = response.json()
        required_fields = ["has_any_processor", "stripe_connected", "square_connected", "paypal_connected"]
        
        if all(field in data for field in required_fields):
            # Should show square_connected as true since we saved Square account for TEST_USER_ID
            if data["square_connected"] is True:
                log_test("Payment Status With Processors", "PASS", 
                        f"Correctly shows Square connected for user {TEST_USER_ID}")
                return True
            else:
                log_test("Payment Status With Processors", "FAIL", 
                        f"Expected square_connected: true, got: {data}")
                return False
        else:
            missing_fields = [f for f in required_fields if f not in data]
            log_test("Payment Status With Processors", "FAIL", 
                    f"Missing required fields: {missing_fields}")
            return False
    else:
        log_test("Payment Status With Processors", "FAIL", 
                f"Request failed or unexpected status code")
        return False

# ============================================================================
# PLATFORM FEE COLLECTION PAYMENT TESTS
# ============================================================================

def test_fee_calculation_endpoint():
    """Test POST /api/payments/calculate-fees for different amounts"""
    test_amounts = [100, 50, 200, 99.99]
    expected_results = [
        {"total": 100, "platform_fee": 5.5, "seller_amount": 94.5, "fee_rate": 0.055},
        {"total": 50, "platform_fee": 2.75, "seller_amount": 47.25, "fee_rate": 0.055},
        {"total": 200, "platform_fee": 11.0, "seller_amount": 189.0, "fee_rate": 0.055},
        {"total": 99.99, "platform_fee": 5.5, "seller_amount": 94.49, "fee_rate": 0.055}
    ]
    
    all_passed = True
    for i, amount in enumerate(test_amounts):
        response = make_request("POST", f"/payments/calculate-fees?amount={amount}")
        
        if response and response.status_code == 200:
            data = response.json()
            expected = expected_results[i]
            
            # Check all required fields exist
            required_fields = ["total", "platform_fee", "seller_amount", "fee_rate"]
            if not all(field in data for field in required_fields):
                log_test(f"Fee Calculation ${amount}", "FAIL", 
                        f"Missing required fields: {[f for f in required_fields if f not in data]}")
                all_passed = False
                continue
            
            # Check fee rate is correct (5.5%)
            if data["fee_rate"] != 0.055:
                log_test(f"Fee Calculation ${amount}", "FAIL", 
                        f"Expected fee_rate: 0.055, got: {data['fee_rate']}")
                all_passed = False
                continue
            
            # Check total amount matches
            if data["total"] != amount:
                log_test(f"Fee Calculation ${amount}", "FAIL", 
                        f"Expected total: {amount}, got: {data['total']}")
                all_passed = False
                continue
            
            # Check platform fee calculation (5.5% of amount)
            expected_fee = round(amount * 0.055, 2)
            if abs(data["platform_fee"] - expected_fee) > 0.01:
                log_test(f"Fee Calculation ${amount}", "FAIL", 
                        f"Expected platform_fee: {expected_fee}, got: {data['platform_fee']}")
                all_passed = False
                continue
            
            # Check seller amount calculation
            expected_seller = round(amount - expected_fee, 2)
            if abs(data["seller_amount"] - expected_seller) > 0.01:
                log_test(f"Fee Calculation ${amount}", "FAIL", 
                        f"Expected seller_amount: {expected_seller}, got: {data['seller_amount']}")
                all_passed = False
                continue
            
            log_test(f"Fee Calculation ${amount}", "PASS", 
                    f"Correct calculation: ${amount} -> fee: ${data['platform_fee']}, seller: ${data['seller_amount']}")
        else:
            log_test(f"Fee Calculation ${amount}", "FAIL", 
                    f"Request failed or unexpected status code")
            all_passed = False
    
    return all_passed

def test_stripe_payment_intent_creation():
    """Test POST /api/payments/stripe/create-payment-intent"""
    test_data = {
        "seller_id": "test_seller_123",
        "amount": 100,
        "currency": "USD"
    }
    
    response = make_request("POST", "/payments/stripe/create-payment-intent", test_data)
    
    # This will likely fail without a real seller with Stripe account, but test the endpoint exists
    if response is not None:
        if response.status_code in [400, 520]:  # Accept both 400 and 520 (proxy error wrapping 400)
            data = response.json()
            error_detail = data.get("detail", "")
            if "does not have a connected Stripe account" in error_detail or "400: Seller does not have a connected Stripe account" in error_detail:
                log_test("Stripe Payment Intent Creation", "PASS", 
                        "Endpoint exists and returns appropriate error for missing seller (expected)")
                return True
            else:
                log_test("Stripe Payment Intent Creation", "FAIL", 
                        f"Unexpected error message: {error_detail}")
                return False
        elif response.status_code == 200:
            # If it somehow succeeds, check the response structure
            data = response.json()
            required_fields = ["success", "amount", "platform_fee", "seller_amount", "processor"]
            if all(field in data for field in required_fields):
                log_test("Stripe Payment Intent Creation", "PASS", 
                        "Endpoint working and returns proper response structure")
                return True
            else:
                log_test("Stripe Payment Intent Creation", "FAIL", 
                        f"Missing required fields in response")
                return False
        else:
            log_test("Stripe Payment Intent Creation", "FAIL", 
                    f"Unexpected status code: {response.status_code}")
            return False
    else:
        log_test("Stripe Payment Intent Creation", "FAIL", 
                "Request failed completely")
        return False

def test_square_payment_creation():
    """Test POST /api/payments/square/create-payment"""
    test_data = {
        "seller_id": "test_seller_123",
        "buyer_id": "test_buyer_456",
        "amount": 100,
        "processor": "square"
    }
    
    response = make_request("POST", "/payments/square/create-payment", test_data)
    
    # This will likely fail without a real seller with Square account, but test the endpoint exists
    if response is not None:
        if response.status_code == 400:
            data = response.json()
            if "does not have a connected Square account" in data.get("detail", ""):
                log_test("Square Payment Creation", "PASS", 
                        "Endpoint exists and returns appropriate error for missing seller (expected)")
                return True
            else:
                log_test("Square Payment Creation", "FAIL", 
                        f"Unexpected error message: {data.get('detail')}")
                return False
        elif response.status_code == 200:
            # If it somehow succeeds, check the response structure
            data = response.json()
            required_fields = ["success", "amount", "platform_fee", "seller_amount", "processor"]
            if all(field in data for field in required_fields):
                log_test("Square Payment Creation", "PASS", 
                        "Endpoint working and returns proper response structure")
                return True
            else:
                log_test("Square Payment Creation", "FAIL", 
                        f"Missing required fields in response")
                return False
        else:
            log_test("Square Payment Creation", "FAIL", 
                    f"Unexpected status code: {response.status_code}")
            return False
    else:
        log_test("Square Payment Creation", "FAIL", 
                "Request failed completely")
        return False

def test_paypal_order_creation():
    """Test POST /api/payments/paypal/create-order"""
    test_data = {
        "seller_id": "test_seller_123",
        "buyer_id": "test_buyer_456",
        "amount": 100,
        "processor": "paypal"
    }
    
    response = make_request("POST", "/payments/paypal/create-order", test_data)
    
    # This will likely fail without a real seller with PayPal account, but test the endpoint exists
    if response is not None:
        if response.status_code == 400:
            data = response.json()
            if "does not have a connected PayPal account" in data.get("detail", ""):
                log_test("PayPal Order Creation", "PASS", 
                        "Endpoint exists and returns appropriate error for missing seller (expected)")
                return True
            else:
                log_test("PayPal Order Creation", "FAIL", 
                        f"Unexpected error message: {data.get('detail')}")
                return False
        elif response.status_code == 200:
            # If it somehow succeeds, check the response structure
            data = response.json()
            required_fields = ["success", "amount", "platform_fee", "seller_amount", "processor"]
            if all(field in data for field in required_fields):
                log_test("PayPal Order Creation", "PASS", 
                        "Endpoint working and returns proper response structure")
                return True
            else:
                log_test("PayPal Order Creation", "FAIL", 
                        f"Missing required fields in response")
                return False
        else:
            log_test("PayPal Order Creation", "FAIL", 
                    f"Unexpected status code: {response.status_code}")
            return False
    else:
        log_test("PayPal Order Creation", "FAIL", 
                "Request failed completely")
        return False

def test_unified_payment_process_endpoint():
    """Test POST /api/payments/process with different processors"""
    processors = ["stripe", "square", "paypal"]
    
    all_passed = True
    for processor in processors:
        test_data = {
            "seller_id": "test_seller_123",
            "buyer_id": "test_buyer_456",
            "amount": 100,
            "processor": processor,
            "currency": "USD"
        }
        
        response = make_request("POST", "/payments/process", test_data)
        
        if response is not None:
            if response.status_code == 400:
                data = response.json()
                if "does not have a connected" in data.get("detail", ""):
                    log_test(f"Unified Payment Process ({processor})", "PASS", 
                            f"Endpoint routes to {processor} and returns appropriate error for missing seller (expected)")
                else:
                    log_test(f"Unified Payment Process ({processor})", "FAIL", 
                            f"Unexpected error message: {data.get('detail')}")
                    all_passed = False
            elif response.status_code == 200:
                # If it somehow succeeds, check the response structure
                data = response.json()
                if data.get("processor") == processor:
                    log_test(f"Unified Payment Process ({processor})", "PASS", 
                            f"Endpoint correctly routes to {processor} processor")
                else:
                    log_test(f"Unified Payment Process ({processor})", "FAIL", 
                            f"Expected processor: {processor}, got: {data.get('processor')}")
                    all_passed = False
            else:
                log_test(f"Unified Payment Process ({processor})", "FAIL", 
                        f"Unexpected status code: {response.status_code}")
                all_passed = False
        else:
            log_test(f"Unified Payment Process ({processor})", "FAIL", 
                    "Request failed completely")
            all_passed = False
    
    return all_passed

def test_payment_history_endpoint():
    """Test GET /api/payments/history/test_user?role=buyer"""
    test_user_id = "test_user_history_123"
    
    # Test as buyer
    response = make_request("GET", f"/payments/history/{test_user_id}?role=buyer")
    
    if response and response.status_code == 200:
        data = response.json()
        required_fields = ["payments", "count"]
        
        if all(field in data for field in required_fields):
            if isinstance(data["payments"], list) and isinstance(data["count"], int):
                log_test("Payment History Endpoint (buyer)", "PASS", 
                        f"Returns proper structure: {data['count']} payments found")
                
                # Test as seller
                response_seller = make_request("GET", f"/payments/history/{test_user_id}?role=seller")
                
                if response_seller and response_seller.status_code == 200:
                    data_seller = response_seller.json()
                    if all(field in data_seller for field in required_fields):
                        log_test("Payment History Endpoint (seller)", "PASS", 
                                f"Returns proper structure: {data_seller['count']} payments found")
                        return True
                    else:
                        log_test("Payment History Endpoint (seller)", "FAIL", 
                                f"Missing required fields in seller response")
                        return False
                else:
                    log_test("Payment History Endpoint (seller)", "FAIL", 
                            "Seller role request failed")
                    return False
            else:
                log_test("Payment History Endpoint (buyer)", "FAIL", 
                        "Invalid data types in response")
                return False
        else:
            missing_fields = [f for f in required_fields if f not in data]
            log_test("Payment History Endpoint (buyer)", "FAIL", 
                    f"Missing required fields: {missing_fields}")
            return False
    else:
        log_test("Payment History Endpoint (buyer)", "FAIL", 
                f"Request failed or unexpected status code")
        return False

def run_all_tests():
    """Run all tests in sequence"""
    print("=" * 80)
    print("COMPREHENSIVE PAYMENT PROCESSOR INTEGRATION TEST SUITE")
    print("=" * 80)
    print(f"Base URL: {BASE_URL}")
    print(f"Test User ID 1 (Stripe + Square): {TEST_USER_ID}")
    print(f"Test User ID 2 (PayPal): {TEST_USER_ID_2}")
    print(f"Test User ID 3 (Combined): {TEST_USER_ID_3}")
    print(f"Test Email 1: {TEST_EMAIL}")
    print(f"Test Email 2: {TEST_EMAIL_2}")
    print(f"Test Email 3: {TEST_EMAIL_3}")
    print("=" * 80)
    print()
    
    # Test sequence as specified in requirements
    tests = [
        # PLATFORM FEE COLLECTION PAYMENT TESTS (NEW - HIGH PRIORITY)
        test_fee_calculation_endpoint,
        test_stripe_payment_intent_creation,
        test_square_payment_creation,
        test_paypal_order_creation,
        test_unified_payment_process_endpoint,
        test_payment_history_endpoint,
        
        # STRIPE CONNECT TESTS (existing)
        test_stripe_connect_create_account,
        test_stripe_connect_create_account_second,
        test_user_stripe_account_save,
        test_user_stripe_account_update,
        test_user_stripe_status_get,
        test_user_stripe_status_nonexistent,
        test_stripe_connect_create_account_link,
        test_stripe_connect_account_status,
        test_stripe_connect_account_status_invalid,
        test_stripe_connect_create_login_link,
        test_stripe_connect_create_login_link_invalid,
        test_user_stripe_status_update,
        test_user_stripe_status_update_no_account,
        
        # SQUARE OAUTH TESTS
        test_square_initiate_oauth,
        test_square_exchange_token,
        test_square_merchant_status,
        test_square_refresh_token,
        test_square_revoke_token,
        test_square_test_connection,
        
        # SQUARE USER MANAGEMENT TESTS
        test_square_user_account_save,
        test_square_user_account_update,
        test_square_user_status_get,
        test_square_user_status_nonexistent,
        
        # PAYPAL OAUTH TESTS
        test_paypal_initiate_oauth,
        test_paypal_exchange_token,
        test_paypal_merchant_status,
        test_paypal_refresh_token,
        test_paypal_test_connection,
        
        # PAYPAL USER MANAGEMENT TESTS
        test_paypal_user_account_save,
        test_paypal_user_account_update,
        test_paypal_user_status_get,
        test_paypal_user_status_nonexistent,
        
        # COMBINED PAYMENT STATUS TESTS
        test_payment_status_no_processors,
        test_payment_status_with_processors,
    ]
    
    passed = 0
    failed = 0
    
    for test_func in tests:
        try:
            if test_func():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            log_test(test_func.__name__, "FAIL", f"Exception: {str(e)}")
            failed += 1
    
    print("=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    print(f"Total Tests: {passed + failed}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    print(f"Success Rate: {(passed / (passed + failed) * 100):.1f}%" if (passed + failed) > 0 else "0%")
    
    if created_account_id:
        print(f"\nCreated Stripe Test Account 1: {created_account_id}")
    if created_account_id_2:
        print(f"Created Stripe Test Account 2: {created_account_id_2}")
    if square_oauth_state:
        print(f"Generated Square OAuth State: {square_oauth_state}")
    if paypal_oauth_state:
        print(f"Generated PayPal OAuth State: {paypal_oauth_state}")
    
    print("=" * 80)
    
    return passed, failed

if __name__ == "__main__":
    run_all_tests()