# Web Viewer JSON Logging

Application for visualizing and analyzing JSON logs.

## Project Structure

- `/client`: Contains the frontend application code (React)
- `/server`: Contains the backend application code (Node.js/Fastify)

## Getting Started

1. Install dependencies:
   ```
   npm run install:all
   ```

2. Start the development environment (both frontend and backend):
   ```
   npm run dev
   ```

3. Start only frontend:
   ```
   npm run start:client
   ```

4. Start only backend:
   ```
   npm run start:server
   ```

## Building for Production

```
npm run build
```

## ⚙️ How it Works
- The software read a file log in JSON format. The file name can be: app-2025-04-23.log
- Show log in Web interface.
  
Read JSON Log like:
```
{"@timestamp":"2025-04-22T14:11:38.372Z","appName":"ApplicationName","correlationId":"7c086686-45d2-4fc1-b2da-0153fef6b839","ecs.version":"8.10.0","environment":"PROD","level":"info","log.level":"info","message":"Incoming request: GET /api/v1/info, appName: AppName","service":"app-service","timestamp":"2025-04-22T14:11:38.372Z","version":"1.64.0"}
{"@timestamp":"2025-04-22T14:11:38.374Z","appName":"ApplicationName","correlationId":"a0cee6f9-ce72-4053-aa4f-205747906859","ecs.version":"8.10.0","environment":"PROD","level":"error","log.level":"error","message":"Response: 401, message: {\"message\":\"Token has expired\"}, appName: AppName","service":"app-service","statusCode":401,"timestamp":"2025-04-22T14:11:38.374Z","version":"1.64.0"}
{"@timestamp":"2025-04-22T14:11:38.374Z","appName":"ApplicationName","correlationId":"a0cee6f9-ce72-4053-aa4f-205747906859","ecs.version":"8.10.0","environment":"PROD","level":"info","log.level":"info","message":"Processed request in 5 ms","service":"app-service","timestamp":"2025-04-22T14:11:38.374Z","version":"1.64.0"}

```

## 🚀 Installation
Download from Git:
```sh
git clone https://github.com/NEXQ-Srl/Web-Viewer-JSON-Logging.git
```

```sh
cd Web-Viewer-JSON-Logging
```

```sh
docker build -t nexqlogviewer .
```

