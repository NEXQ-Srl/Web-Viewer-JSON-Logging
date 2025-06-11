# Web Viewer JSON Logging

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

</div>

A modern, feature-rich application for visualizing, analyzing, and monitoring JSON log files with advanced filtering capabilities and interactive data visualization.

## 🌟 Features

- **Interactive Log Visualization**: View log data through responsive, interactive charts powered by Recharts
- **Advanced Filtering**: Filter logs by date range, log level, search terms, correlation IDs, and more
- **Real-time Monitoring**: Auto-refresh capability keeps your log view up-to-date
- **Secure Authentication**: Microsoft Azure Active Directory integration for secure access
- **Responsive Design**: Modern UI that works seamlessly on desktop and mobile devices
- **Dark/Light Theme**: Choose your preferred viewing experience
- **Detailed Log Inspection**: In-depth view of log entries including all custom fields
- **Interactive Charts**: Click on chart segments to filter logs by time period and log level

## 🔍 Screenshots

<div align="center">

![Dashboard View](screenshots/web-viewer.png)

*Application dashboard showing log visualization and filtering capabilities*

</div>

## 🏗️ Architecture

The application follows a unified client-server architecture with optimized multi-stage Docker build:

- **Frontend**: React + TypeScript application with:
  - Recharts for data visualization
  - ShadCN UI components
  - Context-based state management
  - Responsive design with Tailwind CSS
  - Microsoft Authentication Library (MSAL) integration

- **Backend**: Node.js + Fastify application with:
  - RESTful API endpoints for log data retrieval
  - Authentication middleware for Azure AD token validation
  - Efficient log parsing and processing
  - Static file serving for the React frontend
  - Comprehensive audit and analytics capabilities

- **Deployment**: Multi-stage Docker build that compiles both client and server components into a single production-ready container

## 🚀 Getting Started

### Prerequisites
- [Docker](https://www.docker.com/)

### 1. Build and Start the Application

From the project root, run:

```bash
# Build the Docker image
docker build -t web-viewer-json-logging .

# Run the container
docker run -p 3000:3000 -p 5173:5173 \
  -e AUTH_ENABLED=true \
  -e VITE_AZURE_TENANT_ID=your-tenant-id \
  -e VITE_AZURE_CLIENT_ID=your-client-id \
  -e AZURE_TENANT_ID=your-tenant-id \
  -v ./logs:/app/server/logs \
  web-viewer-json-logging
```

The application will be available at: 
- **Client (Frontend)**: [http://localhost:5173](http://localhost:5173)
- **Server (API)**: [http://localhost:3000](http://localhost:3000)

### 2. Environment Variables

You can customize the application behavior using these environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server API port | `3000` |
| `CLIENT_PORT` | Client frontend port | `5173` |
| `AUTH_ENABLED` | Enable/disable authentication | `true` |
| `VITE_AZURE_TENANT_ID` | Azure AD tenant ID for client | `""` |
| `VITE_AZURE_CLIENT_ID` | Azure AD client ID for client | `""` |
| `AZURE_TENANT_ID` | Azure AD tenant ID for server | `""` |
| `LOG_DIRECTORY` | Path to log files | `/app/server/logs` |

**Note**: Client-side Azure variables use the `VITE_` prefix to be exposed to the frontend build process.

### 3. Custom Logs Directory

To use your own log files, mount a volume when running the container:

```bash
docker run -p 3000:3000 -p 5173:5173 \
  -e AUTH_ENABLED=true \
  -e VITE_AZURE_TENANT_ID=your-tenant-id \
  -e VITE_AZURE_CLIENT_ID=your-client-id \
  -e AZURE_TENANT_ID=your-tenant-id \
  -v /path/to/your/logs:/app/server/logs \
  web-viewer-json-logging
```

### 4. Stopping the Application

To stop the container, press `Ctrl+C` or use:

```bash
docker stop <container-id>
```

## 📊 Log Format

The application expects JSON log files with the following format:

```json
{
  "@timestamp": "2025-04-22T14:11:38.372Z",
  "level": "info",
  "message": "Incoming request: GET /api/v1/info",
  "correlationId": "7c086686-45d2-4fc1-b2da-0153fef6b839",
  "service": "app-service",
  "environment": "PROD"
  // ...any additional fields are supported
}
```

Required fields:
- `@timestamp`: ISO timestamp
- `level`: Log level (info, warn, error, debug)
- `message`: Log message text

Optional fields (enhance functionality):
- `correlationId`: For tracking related log entries
- Any additional fields will be displayed in the log details view

## 🔐 Authentication

Authentication is handled through Microsoft Azure Active Directory:

1. Configure Azure AD using environment variables:
   ```bash
   -e AUTH_ENABLED=true \
   -e VITE_AZURE_TENANT_ID=your-tenant-id \
   -e VITE_AZURE_CLIENT_ID=your-client-id \
   -e AZURE_TENANT_ID=your-tenant-id
   ```

2. Set required scopes (default is "User.Read")

3. Authentication can be disabled for development by setting `AUTH_ENABLED=false`

**Note**: Both client-side (`VITE_` prefixed) and server-side Azure variables are required for full authentication functionality.

## 🌐 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/logs` | GET | Get logs with pagination and filtering |
| `/api/auth/status` | GET | Check authentication status |

Query parameters for `/api/logs`:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `level`: Filter by log level
- `search`: Search in message and correlationId
- `startDate`: Filter logs after this date
- `endDate`: Filter logs before this date

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support, email support@nexq.it or open an issue on GitHub.

