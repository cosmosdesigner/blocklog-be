# Blocklog Backend API

A comprehensive NestJS backend for the Blocklog productivity tracking application. This API provides user authentication, block management, tagging, analytics, and AI-powered suggestions.

## 🚀 Features

- **User Authentication**: JWT-based authentication with registration and login
- **Block Management**: Full CRUD operations for productivity blocks
- **Tagging System**: Categorize blocks with customizable tags
- **Analytics**: Dashboard statistics, monthly/daily reports, and data export
- **AI Integration**: Google GenAI-powered block analysis and suggestions
- **Real-time Duration**: Live duration tracking for ongoing blocks
- **Data Export**: JSON export functionality for data portability

## 🛠️ Tech Stack

- **Framework**: NestJS 10
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport
- **AI**: Google Generative AI (Gemini)
- **Validation**: class-validator & class-transformer
- **Language**: TypeScript

## 📁 Project Structure

```
src/
├── auth/              # Authentication module (JWT, guards, strategies)
├── blocks/            # Block management (CRUD operations)
├── tags/              # Tag management system
├── analytics/         # Dashboard & reporting endpoints
├── ai/                # AI-powered analysis & suggestions
├── entities/          # TypeORM database entities
├── dto/               # Data Transfer Objects
├── common/            # Shared interfaces, filters, utilities
└── main.ts            # Application bootstrap
```

## ⚙️ Installation & Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### 1. Clone & Install Dependencies

```bash
git clone <repository-url>
cd blocklog-be
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=blocklog

# Application Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Google AI Configuration (optional for AI features)
GOOGLE_AI_API_KEY=your-google-ai-api-key

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:4173
```

### 3. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE blocklog;
```

The application will automatically create tables when you start it in development mode.

### 4. Start the Application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`

## 🔐 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | User login |
| GET | `/auth/profile` | Get current user profile |
| PUT | `/auth/profile` | Update user profile |

### Blocks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/blocks` | Get all blocks (with filtering) |
| POST | `/blocks` | Create new block |
| GET | `/blocks/ongoing` | Get ongoing blocks |
| GET | `/blocks/:id` | Get specific block |
| PUT | `/blocks/:id` | Update block |
| PATCH | `/blocks/:id/resolve` | Resolve block |
| DELETE | `/blocks/:id` | Delete block |

### Tags

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tags` | Get all user tags |
| POST | `/tags` | Create new tag |
| GET | `/tags/stats` | Get tag statistics |
| GET | `/tags/:id` | Get specific tag |
| PUT | `/tags/:id` | Update tag |
| DELETE | `/tags/:id` | Delete tag |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/dashboard` | Dashboard statistics |
| GET | `/analytics/monthly?year=2024` | Monthly statistics |
| GET | `/analytics/daily?year=2024&month=1` | Daily statistics |
| GET | `/analytics/calendar?year=2024` | Yearly calendar data |
| GET | `/analytics/export` | Export user data as JSON |

### AI (Optional)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/ai/status` | Check AI service availability |
| POST | `/ai/analyze` | Analyze block with AI |
| POST | `/ai/similar` | Find similar blocks |
| POST | `/ai/resolve` | Generate resolution suggestions |

## 📝 API Examples

### Register User

```bash
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Create Block

```bash
POST /blocks
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "API Integration Issue",
  "reason": "Third-party API returning 500 errors",
  "tagIds": ["tag-uuid-1", "tag-uuid-2"]
}
```

### Get Dashboard Stats

```bash
GET /analytics/dashboard
Authorization: Bearer <jwt-token>
```

Response:
```json
{
  "totalBlocks": 45,
  "ongoingBlocks": 3,
  "resolvedBlocks": 42,
  "totalTimeBlocked": 12345678,
  "averageBlockTime": 876543,
  "longestBlock": {
    "id": "uuid",
    "title": "Database Migration",
    "duration": 3600000
  }
}
```

### AI Block Analysis

```bash
POST /ai/analyze
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "Database Connection Timeout",
  "reason": "Application cannot connect to PostgreSQL database after server restart",
  "context": "Production environment, high traffic"
}
```

## 🔍 Query Parameters

### Blocks Filtering

```bash
GET /blocks?status=ongoing&search=database&tagIds=uuid1,uuid2&startDate=2024-01-01&endDate=2024-12-31&page=1&limit=10
```

Parameters:
- `status`: `ongoing` | `resolved`
- `search`: Search in title/reason
- `tagIds`: Comma-separated tag UUIDs
- `startDate`: ISO date string
- `endDate`: ISO date string
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Comprehensive DTO validation
- **CORS Protection**: Configurable origins
- **Error Handling**: Structured error responses
- **Request Logging**: Comprehensive request/response logging

## 📊 Database Schema

### Users
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `password` (String, Hashed)
- `firstName` (String)
- `lastName` (String)
- `isActive` (Boolean)
- `createdAt`, `updatedAt` (Timestamps)

### Blocks
- `id` (UUID, Primary Key)
- `title` (String)
- `reason` (Text)
- `status` (Enum: ongoing, resolved)
- `startedAt` (DateTime)
- `resolvedAt` (DateTime, Nullable)
- `duration` (BigInt, milliseconds)
- `userId` (UUID, Foreign Key)
- `createdAt`, `updatedAt` (Timestamps)

### Tags
- `id` (UUID, Primary Key)
- `name` (String)
- `description` (String, Nullable)
- `color` (String, Hex color)
- `userId` (UUID, Foreign Key)
- `createdAt`, `updatedAt` (Timestamps)

### Block-Tag Relationship
Many-to-many relationship via junction table `block_tags`

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🚀 Deployment

### Docker (Recommended)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### Environment Variables for Production

Ensure these are set securely:
- `JWT_SECRET`: Strong, unique secret
- `DATABASE_*`: Production database credentials
- `GOOGLE_AI_API_KEY`: For AI features
- `NODE_ENV=production`

## 🔧 Development

### Code Style

- ESLint + Prettier configuration included
- Run `npm run lint` to check code style
- Run `npm run format` to format code

### Database Migrations

For production, disable `synchronize` and use TypeORM migrations:

```bash
npm run migration:generate -- -n MigrationName
npm run migration:run
```

## 📈 Performance Considerations

- **Database Indexing**: Key fields are indexed
- **Query Optimization**: Efficient queries with proper joins
- **Pagination**: All list endpoints support pagination
- **Caching**: Consider Redis for session storage in production
- **Rate Limiting**: Implement for production usage

## 🤝 API Integration

This backend is designed to work seamlessly with the Blocklog React frontend. The API responses match the expected data structures for:

- Dashboard statistics and charts
- Real-time block duration updates  
- Tagging and filtering systems
- Data export/import functionality
- AI-powered suggestions and analysis

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection**: Ensure PostgreSQL is running and credentials are correct
2. **JWT Errors**: Verify `JWT_SECRET` is set and consistent
3. **AI Not Working**: Check `GOOGLE_AI_API_KEY` is valid
4. **CORS Issues**: Update `ALLOWED_ORIGINS` to include your frontend URL

### Logging

Check application logs for detailed error information. In development, all SQL queries and errors are logged.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

**Built with ❤️ using NestJS + TypeScript**

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
