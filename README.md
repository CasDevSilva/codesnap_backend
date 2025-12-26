# CodeSnap API

REST API backend for CodeSnap - a code snippet to image converter.

## 🚀 Live API

**Production:** [https://codesnap-api.onrender.com](https://codesnap-api.onrender.com)

## ✨ Features

- **Snippet Storage** - MongoDB with automatic TTL (1-hour expiration)
- **Image Handling** - Stores base64 images, serves as PNG buffer
- **Rate Limiting** - 20 requests per 15 minutes per IP
- **CORS Configured** - Secure cross-origin requests
- **Input Validation** - Request body validation
- **Health Check** - Database connectivity monitoring

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Node.js 18+ | Runtime |
| Express 5 | Web Framework |
| MongoDB | Database |
| Mongoose 9 | ODM |
| express-rate-limit | Rate Limiting |
| Helmet | Security Headers |
| CORS | Cross-Origin Support |
| UUID | Unique ID Generation |

## 📁 Project Structure

```
├── src/
│   ├── config/
│   │   └── database.js         # MongoDB connection
│   ├── controllers/
│   │   └── SnippetController.js # Business logic
│   ├── models/
│   │   └── Snippet.js          # Mongoose schema
│   ├── router/
│   │   ├── SnippetRouter.js    # /api/snippets routes
│   │   └── SystemRouter.js     # /api/health routes
│   └── app.js                  # Express configuration
├── server.js                   # Entry point
├── .env.example
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/codesnap-backend.git
cd codesnap-backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure your .env file with MongoDB URI

# Start development server
npm run dev
```

### Environment Variables

```env
PORT=3000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/codesnap?retryWrites=true&w=majority
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
NODE_ENV=development
```

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server |

## 🔗 API Endpoints

### Health Check

```
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-26T12:00:00.000Z",
  "database": "connected"
}
```

---

### Create Snippet

```
POST /api/snippets/generate
```

**Request Body:**
```json
{
  "code": "console.log('Hello World')",
  "language": "javascript",
  "theme": "tomorrow",
  "font": "\"Open Sans\", sans-serif",
  "padding": 16,
  "background": "#525252",
  "shadow": false,
  "imageBase64": "data:image/png;base64,..."
}
```

**Response (201):**
```json
{
  "success": true,
  "snippetId": "550e8400-e29b-41d4-a716-446655440000",
  "shareUrl": "https://codesnap-frontend.vercel.app/snippet/550e8400-e29b-41d4-a716-446655440000",
  "imageUrl": "https://codesnap-api.onrender.com/api/snippets/550e8400-e29b-41d4-a716-446655440000/image",
  "code": "console.log('Hello World')",
  "language": "javascript",
  "theme": "tomorrow",
  "font": "\"Open Sans\", sans-serif",
  "padding": 16,
  "background": "#525252",
  "shadow": false,
  "imageBase64": "data:image/png;base64,..."
}
```

**Rate Limit:** 20 requests / 15 minutes

---

### Get Snippet

```
GET /api/snippets/:id
```

**Response (200):**
```json
{
  "snippetId": "550e8400-e29b-41d4-a716-446655440000",
  "code": "console.log('Hello World')",
  "language": "javascript",
  "theme": "tomorrow",
  "font": "\"Open Sans\", sans-serif",
  "padding": 16,
  "background": "#525252",
  "shadow": false,
  "imageBase64": "data:image/png;base64,...",
  "shareUrl": "...",
  "imageUrl": "...",
  "createdAt": "2025-12-26T12:00:00.000Z"
}
```

**Response (404):**
```json
{
  "error": "Not Found",
  "message": "Snippet not found"
}
```

---

### Get Snippet Image

```
GET /api/snippets/:id/image
```

**Response (200):**
- Content-Type: `image/png`
- Body: PNG buffer

**Response (404):**
```json
{
  "error": "Not Found",
  "message": "Snippet not found"
}
```

## 📊 Database Schema

### Snippet Collection

```javascript
{
  snippetId: String,      // UUID - unique identifier
  code: String,           // Source code (max 10000 chars)
  language: String,       // Programming language
  theme: String,          // Prism theme name
  font: String,           // CSS font-family
  padding: Number,        // Padding in pixels
  background: String,     // Hex color
  shadow: Boolean,        // Shadow enabled
  imageBase64: String,    // PNG as base64
  shareUrl: String,       // Frontend share URL
  imageUrl: String,       // Direct image URL
  createdAt: Date,        // Auto-generated
  expiresAt: Date         // TTL - 1 hour from creation
}
```

**Indexes:**
- `snippetId`: unique
- `expiresAt`: TTL index (auto-delete after expiration)

## 🌐 Deployment (Render)

1. Create new Web Service on Render
2. Connect GitHub repository
3. Configure:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node
4. Add environment variables
5. Deploy

## ⚠️ Rate Limiting

- **Limit:** 20 requests per 15 minutes per IP
- **Scope:** POST `/api/snippets/generate` only
- **Response (429):**
```json
{
  "error": "Too many requests, please try again later."
}
```

## 🔒 Security

- Helmet.js for security headers
- CORS restricted to frontend origin
- Request body size limit: 10MB
- Input validation on all endpoints

## 📄 License

MIT

## 👤 Author

**Carlos Rimachi Silva**

- GitHub: [@CasDevSilva](https://github.com/CasDevSilva)