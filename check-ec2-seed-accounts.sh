#!/bin/bash
# Bash script to check seed accounts on EC2 instance
# Usage: ./check-ec2-seed-accounts.sh

EC2_IP="51.44.222.179"
KEY_PATH="$HOME/Downloads/fintech-key.pem"

echo "=== Checking Seed Accounts on EC2 ==="
echo "EC2 Instance: $EC2_IP"
echo ""

# Check if key file exists
if [ ! -f "$KEY_PATH" ]; then
    echo "Error: Key file not found at $KEY_PATH"
    echo "Please update KEY_PATH in this script."
    exit 1
fi

echo "Fetching user accounts..."
echo ""

# Get all users
echo "=== USERS ==="
ssh -i "$KEY_PATH" ubuntu@$EC2_IP "sudo -u postgres psql -d fintech_db -c \"SELECT email, name, role FROM users ORDER BY role, email;\""

echo ""
echo "=== ACCOUNTS ==="
ssh -i "$KEY_PATH" ubuntu@$EC2_IP "sudo -u postgres psql -d fintech_db -c \"SELECT u.email, a.name as account_name, a.type, a.account_number, a.balance, a.status FROM accounts a JOIN users u ON a.user_id = u.id ORDER BY u.email, a.name;\""

echo ""
echo "=== SUMMARY ==="
echo "Default password for all seed users: password123"
echo ""
echo "To login:"
echo "1. Use any email from the USERS list above"
echo "2. Password: password123"
echo "3. Admin users have role='admin'"

