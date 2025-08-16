# Blocklog Backend API 🚀

A production-ready NestJS backend for the Blocklog productivity tracking application. This API provides user authentication, block management, tagging, analytics, and AI-powered suggestions with full production deployment configuration.

## ✨ Current Status

🟢 **PRODUCTION DEPLOYED** - Running live at `http://45.63.74.179:8080`
- ✅ Production server configured with PM2
- ✅ Nginx reverse proxy setup  
- ✅ PostgreSQL database with sample data
- ✅ JWT authentication working
- ✅ SSL-ready configuration
- ✅ Auto-restart and monitoring enabled

## 🚀 Features

- **User Authentication**: JWT-based authentication with registration and login
- **Block Management**: Full CRUD operations for productivity blocks with real-time duration tracking
- **Tagging System**: Categorize blocks with customizable colors and descriptions
- **Analytics Dashboard**: Comprehensive statistics, monthly/daily reports, and data export
- **AI Integration**: Google GenAI-powered block analysis and resolution suggestions
- **Production Ready**: PM2 process management, Nginx proxy, and monitoring
- **Data Export**: JSON export functionality for data portability

## 🛠️ Tech Stack

- **Framework**: NestJS 10 + TypeScript
- **Database**: PostgreSQL 14 with TypeORM
- **Authentication**: JWT with Passport Strategy
- **AI**: Google Generative AI (Gemini)
- **Process Manager**: PM2 with ecosystem configuration
- **Reverse Proxy**: Nginx with CORS support
- **Validation**: class-validator & class-transformer
- **Security**: bcrypt password hashing, input validation

## 📁 Project Structure

```
src/
├── auth/              # JWT authentication, guards, strategies
├── blocks/            # Block CRUD operations and business logic
├── tags/              # Tag management with color customization
├── analytics/         # Dashboard statistics and reporting
├── ai/                # Google GenAI integration for suggestions
├── entities/          # TypeORM database entities (User, Block, Tag)
├── dto/               # Data Transfer Objects with validation
├── common/            # Shared interfaces, filters, utilities
└── main.ts            # Application bootstrap and CORS config

# Production Files
├── ecosystem.config.js # PM2 production configuration
├── .env               # Production environment variables
└── README.md          # This file
```

## 🚀 Deployment Guide

### Option 1: Use Production Instance (Recommended)

The API is already deployed and ready to use:
- **API URL**: `http://45.63.74.179:8080`
- **Status**: Running with PM2 + Nginx
- **Database**: PostgreSQL with sample data
- **Monitoring**: Logs available via PM2

### Option 2: Deploy Your Own Instance

#### Prerequisites
- Ubuntu/Debian server
- Node.js 18+
- PostgreSQL 12+
- Nginx
- PM2

#### Quick Deployment Steps

```bash
# 1. Clone and setup
git clone https://github.com/cosmosdesigner/blocklog-be.git
cd blocklog-be
npm install
npm run build

# 2. Database setup
sudo -u postgres createdb blocklog
sudo -u postgres psql -d blocklog -f database-schema.sql

# 3. Environment configuration
cp .env.example .env
# Edit .env with your database credentials and JWT secret

# 4. Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 5. Configure Nginx (optional)
# Copy provided nginx configuration
sudo nginx -t && sudo systemctl reload nginx

# 6. Configure firewall
sudo ufw allow 8080  # API port
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
```

## 📊 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | ❌ |
| POST | `/auth/login` | User login | ❌ |
| GET | `/auth/profile` | Get current user profile | ✅ |
| PUT | `/auth/profile` | Update user profile | ✅ |

### Block Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/blocks` | Get all blocks (paginated, filterable) | ✅ |
| POST | `/blocks` | Create new block | ✅ |
| GET | `/blocks/ongoing` | Get only ongoing blocks | ✅ |
| GET | `/blocks/:id` | Get specific block with tags | ✅ |
| PUT | `/blocks/:id` | Update block details | ✅ |
| PATCH | `/blocks/:id/resolve` | Mark block as resolved | ✅ |
| DELETE | `/blocks/:id` | Delete block | ✅ |

### Tag System

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/tags` | Get all user tags | ✅ |
| POST | `/tags` | Create new tag | ✅ |
| GET | `/tags/stats` | Get tag usage statistics | ✅ |
| GET | `/tags/:id` | Get specific tag | ✅ |
| PUT | `/tags/:id` | Update tag (name, color, description) | ✅ |
| DELETE | `/tags/:id` | Delete tag | ✅ |

### Analytics & Reporting

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/analytics/dashboard` | Dashboard statistics overview | ✅ |
| GET | `/analytics/monthly?year=2024` | Monthly breakdown | ✅ |
| GET | `/analytics/daily?year=2024&month=1` | Daily statistics | ✅ |
| GET | `/analytics/calendar?year=2024` | Calendar heatmap data | ✅ |
| GET | `/analytics/export` | Export all user data as JSON | ✅ |

### AI-Powered Features (Optional)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/ai/status` | Check AI service availability | ✅ |
| POST | `/ai/analyze` | Analyze block and get insights | ✅ |
| POST | `/ai/similar` | Find similar historical blocks | ✅ |
| POST | `/ai/resolve` | Generate resolution suggestions | ✅ |

## 🔍 Query Parameters & Filtering

### Blocks Endpoint
```bash
GET /blocks?status=ongoing&search=database&tagIds=uuid1,uuid2&startDate=2024-01-01&endDate=2024-12-31&page=1&limit=10
```

**Parameters**:
- `status`: `ongoing` | `resolved`
- `search`: Search in title/reason (case-insensitive)
- `tagIds`: Comma-separated tag UUIDs
- `startDate` / `endDate`: ISO date strings for date range
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based auth with configurable expiration
- **Password Security**: bcrypt hashing with salt rounds
- **Input Validation**: Comprehensive DTO validation with class-validator
- **CORS Protection**: Configurable origins for cross-origin requests
- **SQL Injection Protection**: TypeORM parameterized queries
- **Environment Variables**: Sensitive data in environment configuration
- **Production Hardening**: Separate production/development configurations

## ⚡ Performance Optimizations

- **Database Indexing**: Optimized indexes on frequently queried fields
- **Pagination**: All list endpoints support efficient pagination
- **Query Optimization**: Efficient joins and selective field loading
- **Response Caching**: Headers set for appropriate caching
- **Connection Pooling**: PostgreSQL connection pooling via TypeORM
- **Memory Management**: PM2 memory limit and auto-restart


## 📈 Monitoring & Logging

### Application Logs
- **PM2 Logs**: `/var/log/pm2/blocklog-be-*.log`
- **Error Logs**: Detailed error tracking with stack traces
- **Request Logs**: HTTP request/response logging
- **Database Logs**: SQL query logging in development

### System Monitoring
- **PM2 Dashboard**: Built-in process monitoring
- **Nginx Logs**: Access and error logs
- **Database Monitoring**: PostgreSQL query performance
- **Resource Usage**: CPU, memory, disk usage via PM2


### Getting Help

- **Logs**: Check PM2 and Nginx logs for detailed error information
- **Health Check**: `curl http://45.63.74.179:8080/` should return "Hello World!"
- **Database**: Verify connection with `sudo -u postgres psql -d blocklog`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**🚀 Production Ready • Built with NestJS + TypeScript**

*This backend is currently deployed and serving the Blocklog application with full production monitoring and management.*
