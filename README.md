# Dutch Language Learning App

A modern mobile application designed to help users learn Dutch through interactive practice sessions, personalized learning paths, and AI-powered feedback.

## Features

- **Personalized Learning Experience**
  - Custom onboarding flow to understand user preferences
  - Tailored practice content based on skill level and interests
  - Progress tracking and skill level visualization

- **Interactive Practice Sessions**
  - Various practice types for different language skills
  - Real-time AI-powered feedback on answers
  - Difficulty adaptation based on user performance

- **User Progress Tracking**
  - Detailed progress statistics
  - Skill level tracking for different language aspects
  - Practice history and performance analytics

- **AI Integration**
  - Intelligent practice generation
  - Natural language processing for answer evaluation
  - Personalized feedback and suggestions

## Tech Stack

### Frontend
- React Native with Expo
- TypeScript
- Axios for API communication
- Secure storage for user data
- Modern UI components

### Backend
- Node.js with Express
- MongoDB for data storage
- JWT authentication
- OpenAI integration for AI features

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- OpenAI API key
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/li6834300/DutchTestPrep.git
cd DutchTestPrep
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd backend
npm install
```

4. Set up environment variables:
Create a `.env` file in the backend directory with:
```
DATABASE_URL=your_mongodb_url
PORT=3000
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
```

5. Start the backend server:
```bash
cd backend
npm run dev
```

6. Start the frontend application:
```bash
# In the root directory
npm start
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
