# ChatHub Backend

A Node.js backend for a chat application using Express, MongoDB (Mongoose), Firebase authentication, and OpenRouter API for AI chat completions.

## Features

- User authentication via Firebase Admin SDK
- Start new chat sessions and continue existing ones
- Stream AI responses from OpenRouter API to the frontend
- Store chat history and user data in MongoDB
- RESTful API endpoints with error handling and CORS support

## Folder Structure

```
backend/
├── controllers/
│   └── chatController.js
├── routes/
│   └── chatRoutes.js
├── models/
│   ├── Chat.js
│   └── User.js
├── middlewares/
│   └── authMiddleware.js
├── services/
│   ├── openRouterService.js
│   └── firebaseAuth.js
├── app.js
├── server.js
├── .env
└── package.json
```

## Setup

1. **Clone the repository**

   ```sh
   git clone <your-repo-url>
   cd chatHubBackend
   ```

2. **Install dependencies**

   ```sh
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory with the following:

   ```
   MONGO_URI=your_mongodb_atlas_uri
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email
   FIREBASE_PRIVATE_KEY=your_firebase_private_key
   OPENROUTER_API_KEY=your_openrouter_api_key
   PORT=3000
   ```

4. **Run the server**

   ```sh
   npm start
   # or for development
   npm run dev
   ```

## API Endpoints

All endpoints require a valid Firebase ID token in the `Authorization` header.

- **POST `/api/chat/send`**  
  Start a new chat session.  
  **Body:** `{ "message": "Hello!" }`

- **POST `/api/chat/send/:id`**  
  Continue an existing chat.  
  **Body:** `{ "message": "Next message" }`

- **GET `/api/chat/history`**  
  Get all chat sessions for the logged-in user.

- **GET `/api/chat/:id`**  
  Get a single chat by ID.

## Technologies Used

- Node.js
- Express
- MongoDB & Mongoose
- Firebase Admin SDK
- OpenRouter API
- dotenv
- CORS

## Notes

- Responses from OpenRouter are streamed directly to the frontend.
- Error handling is implemented for all endpoints and services.
- Make sure your environment variables are set correctly for all integrations.

---

**License:** MIT
