# Stage 1: Build Frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend

# Copy package.json and package-lock.json
COPY app/frontend/package*.json ./

# Install dependencies
RUN npm ci

# Arguments for build time (passed via --build-arg in Cloud Build)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# Set as env vars for the build
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Copy source code
COPY app/frontend ./

# Build the application
RUN npm run build

# Stage 2: Runtime
FROM python:3.12-slim

WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install system dependencies
# git is required for installing dependencies from git repositories
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application code
COPY app ./app

# Copy built frontend assets to the static directory
# The backend expects static files at app/static
COPY --from=frontend-builder /app/frontend/dist /app/app/static

# Expose the application port
EXPOSE 8000

# Run the application
# Run the application
CMD sh -c "uvicorn app.main:app --host 0.0.0.0 --port \${PORT:-8000}"
