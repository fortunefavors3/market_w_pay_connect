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
BASE_URL = "https://seller-payments.preview.emergentagent.com/api"
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
    
    if response and response.status_code == 400:
        log_test("Stripe Connect Account Status Invalid", "PASS", 
                "Correctly returned 400 for invalid account ID")
        return True
    else:
        log_test("Stripe Connect Account Status Invalid", "FAIL", 
                f"Expected 400 status code, got {response.status_code if response else 'None'}")
        return False

def test_stripe_connect_create_login_link():
    """Test POST /api/stripe-connect/create-login-link/{account_id}"""
    if not created_account_id_2:
        log_test("Stripe Connect Login Link", "FAIL", "No account_id available")
        return False
    
    response = make_request("POST", f"/stripe-connect/create-login-link/{created_account_id_2}")
    
    if response and response.status_code == 200:
        data = response.json()
        if (data.get("success") is True and 
            data.get("url") and 
            "stripe.com" in data["url"]):
            log_test("Stripe Connect Login Link", "PASS", 
                    f"Created login URL: {data['url'][:50]}...")
            return True
        else:
            log_test("Stripe Connect Login Link", "FAIL", 
                    "Response missing success or invalid URL format")
            return False
    else:
        log_test("Stripe Connect Login Link", "FAIL", 
                f"Request failed or unexpected status code")
        return False

def test_stripe_connect_create_login_link_invalid():
    """Test POST /api/stripe-connect/create-login-link/{account_id} with invalid account"""
    fake_account_id = "acct_invalid123456789"
    response = make_request("POST", f"/stripe-connect/create-login-link/{fake_account_id}")
    
    if response and response.status_code == 400:
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

def run_all_tests():
    """Run all tests in sequence"""
    print("=" * 80)
    print("STRIPE CONNECT INTEGRATION TEST SUITE")
    print("=" * 80)
    print(f"Base URL: {BASE_URL}")
    print(f"Test User ID 1: {TEST_USER_ID}")
    print(f"Test User ID 2: {TEST_USER_ID_2}")
    print(f"Test Email 1: {TEST_EMAIL}")
    print(f"Test Email 2: {TEST_EMAIL_2}")
    print("=" * 80)
    print()
    
    # Test sequence as specified in requirements
    tests = [
        # 1. Create Stripe Connect accounts
        test_stripe_connect_create_account,
        test_stripe_connect_create_account_second,
        
        # 2. Save account_id to test user
        test_user_stripe_account_save,
        test_user_stripe_account_update,
        
        # 3. Get user's Stripe status
        test_user_stripe_status_get,
        test_user_stripe_status_nonexistent,
        
        # 4. Create account link for onboarding
        test_stripe_connect_create_account_link,
        
        # 5. Check account status
        test_stripe_connect_account_status,
        test_stripe_connect_account_status_invalid,
        
        # 6. Create login link
        test_stripe_connect_create_login_link,
        test_stripe_connect_create_login_link_invalid,
        
        # 7. Test status update
        test_user_stripe_status_update,
        test_user_stripe_status_update_no_account,
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
        print(f"\nCreated Test Account 1: {created_account_id}")
    if created_account_id_2:
        print(f"Created Test Account 2: {created_account_id_2}")
    
    print("=" * 80)
    
    return passed, failed

if __name__ == "__main__":
    run_all_tests()