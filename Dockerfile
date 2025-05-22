FROM ubuntu:24.04 as builder

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    build-essential \
    xz-utils \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 22.13.1
RUN curl -fsSL https://nodejs.org/dist/v22.13.1/node-v22.13.1-linux-x64.tar.xz -o node.tar.xz && \
    tar -xJf node.tar.xz -C /usr/local --strip-components=1 && \
    rm node.tar.xz

WORKDIR /app

# Install and build client
COPY client/package.json client/package-lock.json ./client/
RUN cd client && npm install --legacy-peer-deps
COPY client ./client
RUN cd client && npm run build

# Install and build server
COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm install --legacy-peer-deps
COPY server ./server
RUN cd server && npm run build

# Copy built client to server's public directory
RUN mkdir -p server/public && cp -r client/build/* server/public/

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

# Copy only production server files and built client
COPY --from=builder /app/server /app/server

EXPOSE 5000

CMD ["npm", "run", "start", "--prefix", "server"]
