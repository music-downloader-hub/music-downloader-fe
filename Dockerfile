# Frontend Dockerfile for Apple Music Downloader
# Multi-stage build for production optimization

# Stage 1: Build the application
FROM node:18-alpine AS builder

# Accept build arguments
ARG VITE_API_BASE_URL
ARG VITE_ITUNES_API_BASE
ARG VITE_ITUNES_LOOKUP_BASE
ARG VITE_APPLE_MUSIC_BASE

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Set environment variables for build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_ITUNES_API_BASE=$VITE_ITUNES_API_BASE
ENV VITE_ITUNES_LOOKUP_BASE=$VITE_ITUNES_LOOKUP_BASE
ENV VITE_APPLE_MUSIC_BASE=$VITE_APPLE_MUSIC_BASE

# Build the application
RUN npm run build

# Stage 2: Serve the application with nginx
FROM nginx:alpine AS production

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
