#!/bin/bash

# Get local IP
IP=$(ipconfig getifaddr en0)

echo "================================================================"
echo "Starting ChefLens for Mobile Testing"
echo "================================================================"
echo "Your Local IP Address is: $IP"
echo ""
echo "Backend will run on: http://$IP:8000"
echo "Frontend will run on: http://$IP:5173"
echo "================================================================"

# Function to kill background processes on exit
cleanup() {
    echo "Stopping servers..."
    kill $(jobs -p)
}
trap cleanup EXIT

# Start Backend
echo "Starting Backend..."
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &

# Wait a bit
sleep 3

# Start Frontend
echo "Starting Frontend..."
cd app/frontend
npm run dev:host

# Wait
wait
