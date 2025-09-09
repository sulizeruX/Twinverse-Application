#!/usr/bin/env python
"""
A simple script to test if the FastAPI server is working properly.
Run this script to check if your FastAPI server is accessible.
"""

import requests
import json
import sys

API_URL = "http://localhost:8000"

def test_api_connection():
    """Test connection to the FastAPI server."""
    print(f"Testing connection to FastAPI server at {API_URL}...")
    
    try:
        response = requests.get(f"{API_URL}/splines")
        if response.status_code == 200:
            print("✅ Connection successful!")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
            return True
        else:
            print(f"❌ Error: Received status code {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to the server. Is it running?")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_cors():
    """Test if CORS is properly configured."""
    print("\nTesting CORS configuration...")
    
    try:
        headers = {
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "Content-Type"
        }
        response = requests.options(f"{API_URL}/splines", headers=headers)
        
        if response.status_code == 200:
            cors_headers = [
                "Access-Control-Allow-Origin",
                "Access-Control-Allow-Methods",
                "Access-Control-Allow-Headers"
            ]
            
            all_headers_present = True
            for header in cors_headers:
                if header not in response.headers:
                    all_headers_present = False
                    print(f"❌ CORS header missing: {header}")
            
            if all_headers_present:
                print("✅ CORS appears to be properly configured!")
            else:
                print("❌ Some CORS headers are missing.")
            
            print("CORS Headers:")
            for key, value in response.headers.items():
                if key.startswith("Access-Control"):
                    print(f"  {key}: {value}")
        else:
            print(f"❌ CORS preflight request failed with status code {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Error during CORS test: {e}")

def test_pause_endpoint():
    """Test the pause endpoint."""
    print("\nTesting the /pause/ endpoint...")
    
    try:
        response = requests.post(f"{API_URL}/pause/?paused=true")
        if response.status_code == 200:
            print("✅ Pause endpoint working!")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        else:
            print(f"❌ Error: Pause endpoint returned status {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Error testing pause endpoint: {e}")

def test_spline_endpoint():
    """Test the pause_spline endpoint."""
    print("\nTesting the /pause_spline/ endpoint...")
    
    try:
        data = {"spline_id": "TestSpline", "paused": True}
        response = requests.post(
            f"{API_URL}/pause_spline/",
            json=data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            print("✅ Spline pause endpoint working!")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        else:
            print(f"❌ Error: Spline pause endpoint returned status {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Error testing spline pause endpoint: {e}")

def main():
    print("="*60)
    print("FastAPI Server Connection Test")
    print("="*60)
    
    connection_ok = test_api_connection()
    if connection_ok:
        test_cors()
        test_pause_endpoint()
        test_spline_endpoint()
        print("\n✅ All tests completed. If any failed, check the messages above.")
    else:
        print("\n❌ Could not connect to the server. Make sure it's running.")
    
    print("="*60)

if __name__ == "__main__":
    main()
