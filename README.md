# Express.js Code Analysis API

A production-ready REST API for code analysis, formatting, validation, and search using Express.js and TypeScript.

## Features

- **Code Analysis**: Analyze code quality, metrics, and complexity
- **Code Formatting**: Format and prettify code with configurable indentation
- **Code Validation**: Validate code against syntax and style rules
- **Pattern Search**: Search for patterns in code with regex support
- **Security**: API key authentication, rate limiting, CORS protection
- **Logging**: Structured JSON logging with request tracking
- **Health Checks**: Monitor API status and uptime

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone and install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration

# Development
npm run dev

# Production
npm run build
npm start
```

### Environment Variables

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Security
API_KEY=your-secret-api-key-here
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

## API Documentation

### Authentication

All API routes (except `/health`) require authentication via the `X-API-Key` header:

```bash
curl -H "X-API-Key: your-secret-api-key-here" https://api.example.com/api/code/languages
```

### Rate Limiting

- **Limit**: 100 requests per minute per IP
- **Response**: 429 status with reset time when exceeded

### Endpoints

#### Health Check

```bash
# GET /health - Check API status
curl https://api.example.com/health

# Response:
{
  "status": "ok",
  "uptime": "3600s",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### Code Analysis

```bash
# POST /api/code/analyze - Analyze code quality and metrics
curl -X POST https://api.example.com/api/code/analyze \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "code": "function hello(name) { console.log(\"Hello, \" + name); }",
    "language": "javascript"
  }'

# Response:
{
  "success": true,
  "data": {
    "id": "1642248600000",
    "language": "javascript",
    "metrics": {
      "lines": 1,
      "characters": 56,
      "functions": 1,
      "classes": 0,
      "complexity": 1
    },
    "issues": [
      {
        "type": "warning",
        "message": "Console.log statement found",
        "line": 1
      }
    ],
    "suggestions": []
  }
}
```

#### Code Formatting

```bash
# POST /api/code/format - Format and prettify code
curl -X POST https://api.example.com/api/code/format \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "code": "function hello(name){console.log(\"Hello, \"+name);}",
    "language": "javascript",
    "indentSize": 2
  }'

# Response:
{
  "success": true,
  "data": {
    "id": "1642248600001",
    "original": "function hello(name){console.log(\"Hello, \"+name);}",
    "formatted": "function hello(name) {\n  console.log(\"Hello, \" + name);\n}",
    "changes": 1
  }
}
```

#### Code Validation

```bash
# POST /api/code/validate - Validate code against rules
curl -X POST https://api.example.com/api/code/validate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "code": "function test() {\n  return true;\n}",
    "language": "javascript",
    "rules": ["syntax", "style"]
  }'

# Response:
{
  "success": true,
  "data": {
    "id": "1642248600002",
    "valid": true,
    "errors": []
  }
}
```

#### Pattern Search

```bash
# POST /api/code/search - Search for patterns in code
curl -X POST https://api.example.com/api/code/search \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "pattern": "function",
    "caseSensitive": false,
    "regex": false
  }'

# Response:
{
  "success": true,
  "data": {
    "matches": [
      {
        "line": 2,
        "column": 1,
        "match": "function",
        "context": "function hello(name) {"
      }
    ],
    "total": 1,
    "searchedIn": "sample code",
    "query": {
      "pattern": "function",
      "caseSensitive": false,
      "regex": false
    }
  }
}
```

#### Get Supported Languages

```bash
# GET /api/code/languages - Get supported programming languages
curl https://api.example.com/api/code/languages \
  -H "X-API-Key: your-api-key"

# Response:
{
  "success": true,
  "data": {
    "languages": ["javascript", "typescript", "python", "java", "cpp", "csharp"],
    "default": "javascript"
  }
}
```

#### Get Validation Rules

```bash
# GET /api/code/rules - Get available validation rules
curl https://api.example.com/api/code/rules \
  -H "X-API-Key: your-api-key"

# Response:
{
  "success": true,
  "data": {
    "rules": ["syntax", "style"],
    "descriptions": {
      "syntax": "Check for syntax errors and structural issues",
      "style": "Check for code style and formatting issues"
    }
  }
}
```

### Error Responses

All errors follow a consistent format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional error details"
  }
}
```

**Common Error Codes:**
- `VALIDATION_ERROR` (400) - Request validation failed
- `MISSING_API_KEY` (401) - X-API-Key header missing
- `INVALID_API_KEY` (401) - Invalid API key provided
- `NOT_FOUND` (404) - Endpoint not found
- `RATE_LIMIT_EXCEEDED` (429) - Too many requests
- `INTERNAL_ERROR` (500) - Server error

## Development

```bash
# Run in development mode with hot reload
npm run dev

# Type checking
npm run type-check

# Build for production
npm run build
```

## Deployment

The API is designed to run in Docker containers:

1. Set required environment variables
2. Build: `npm run build`
3. Start: `npm start`

## Architecture

- **Framework**: Express.js with TypeScript
- **Validation**: Zod schemas for request/response validation
- **Security**: Helmet, CORS, API key auth, rate limiting
- **Logging**: Structured JSON logs with request tracking
- **Error Handling**: Centralized error middleware
- **Code Analysis**: Pattern-based analysis without external dependencies

## License

MIT License