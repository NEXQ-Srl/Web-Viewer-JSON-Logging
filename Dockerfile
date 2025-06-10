FROM ubuntu:24.04

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    build-essential \
    xz-utils && \
    rm -rf /var/lib/apt/lists/*

# Install Node.js 22.13.1
RUN curl -fsSL https://nodejs.org/dist/v22.13.1/node-v22.13.1-linux-x64.tar.xz -o node.tar.xz && \
    tar -xJf node.tar.xz -C /usr/local --strip-components=1 && \
    rm node.tar.xz

# Set working directory
WORKDIR /app

# Install and build client
COPY client/package.json client/package-lock.json ./client/
RUN cd client && npm install --legacy-peer-deps
COPY client ./client
RUN cd client && npm run build

# Install server dependencies
COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm install --legacy-peer-deps

# Install concurrently for running both services
RUN cd server && npm install concurrently --save

COPY server ./server

# Build server (compile TypeScript)
RUN cd server && npm run build

# --- Production image ---
FROM ubuntu:24.04

RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    xz-utils \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 22.13.1
RUN curl -fsSL https://nodejs.org/dist/v22.13.1/node-v22.13.1-linux-x64.tar.xz -o node.tar.xz && \
    tar -xJf node.tar.xz -C /usr/local --strip-components=1 && \
    rm node.tar.xz

WORKDIR /app

# Copy server files and built client
COPY --from=builder /app/server /app/server
COPY --from=builder /app/client/build /app/client/build

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV CLIENT_PORT=5173
ENV AUTH_ENABLED=true
ENV AZURE_TENANT_ID="your-tenant-id"
ENV AZURE_CLIENT_ID="your-client-id"
ENV LOG_DIRECTORY=/app/server/logs

# Create logs directory
RUN mkdir -p /app/server/logs

# Expose ports for both client and server
EXPOSE 3000 5173

# Start both client and server
CMD ["npm", "run", "start:prod", "--prefix", "server"]
