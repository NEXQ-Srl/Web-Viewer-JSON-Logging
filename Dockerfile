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
COPY . .

# Install dependencies for client and server
RUN npm run install:all

# Build client and server
RUN npm run build

# Expose ports for server (5000)
EXPOSE 5000

# Start the server
CMD ["node", "server/dist/index.js"]
