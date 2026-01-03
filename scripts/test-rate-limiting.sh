#!/bin/bash

# Test Authentication Rate Limit (5 requests per 15 minutes)
echo "Testing Authentication Rate Limit..."
echo "Expected: First 5 return 401 (wrong password), 6th returns 429 (rate limited)"
echo ""

for i in {1..7}; do
  echo "Request $i:"
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' \
    -w "\nHTTP Status: %{http_code}\n" \
    -s
  echo "---"
  sleep 1
done

echo ""
echo "Test complete. Check for 429 status on request 6+"
