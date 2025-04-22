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

# Copy all source code
COPY client/ ./client
COPY server/ ./server

# Install dependencies for client and server
RUN cd client && npm install --legacy-peer-deps
RUN cd server && npm install --legacy-peer-deps

# Expose ports for frontend (5173 or 3000) and backend (5000)
EXPOSE 5173 3000 5000

# Start both React and Express in parallel using sh
CMD sh -c "npm run server --prefix ./server & npm run dev --prefix ./client"
