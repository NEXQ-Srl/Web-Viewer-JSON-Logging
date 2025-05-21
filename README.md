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
```html
<div class="screenshot-grid">
   <img src="screenshots/web-viewer.png" alt="Dashboard view" width="600" />
</div>

<p><em>Screenshots of the application showing the dashboard, detailed log view, and filtering capabilities</em></p>
```
</div>

## 🏗️ Architecture

The application follows a client-server architecture:

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
  - Comprehensive audit and analytics capabilities

## 🚀 Getting Started

### Prerequisites

- Node.js 14+ and npm
- Access to JSON log files

### Installation

#### From Source

1. Clone the repository:
   ```bash
   git clone https://github.com/NEXQ-Srl/Web-Viewer-JSON-Logging.git
   cd Web-Viewer-JSON-Logging
   ```

2. Install dependencies:
   ```bash
   npm run install:all
   ```

3. Configuration:
   - Create a `.env` file in the server directory based on `.env.example`
   - Set the log file path and other environment variables

4. Start the application:
   ```bash
   npm run start
   ```

#### Using Docker

```bash
docker build -t nexqlogviewer .
docker run -p 3000:3000 -p 8080:8080 -v /path/to/logs:/app/logs nexqlogviewer
```

## 🔧 Development

Start development environment (both frontend and backend):
```bash
npm run dev
```

Start only frontend:
```bash
npm run start:client
```

Start only backend:
```bash
npm run start:server
```

Build for production:
```bash
npm run build
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

1. Configure Azure AD in your environment file:
   ```
   AUTH_ENABLED=true
   AZURE_TENANT_ID=your-tenant-id
   AZURE_CLIENT_ID=your-client-id
   ```

2. Set required scopes (default is "User.Read")

3. Authentication can be disabled for development by setting `AUTH_ENABLED=false`

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

