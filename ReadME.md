# EduBot - AI-Powered Educational Assistant

EduBot is a Next.js application that provides an intelligent educational assistant platform with video chat capabilities and AI-powered interactions.

Live Demo: [https://edubot-buildathon.vercel.app/](https://edubot-buildathon.vercel.app/)

## Features

- AI-powered chat interactions
- Video chat capabilities
- Role-based access (Admin, Counselor, Student)
- Real-time communication
- Document processing and embeddings
- Voice interactions

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (We recommend using [Neon](https://console.neon.tech/) for production)
- Clerk account for authentication
- OpenAI API key
- Anthropic API key
- Simli API key and Face ID
- Deepgram API key

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd edubot
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env-examples .env
```

4. Configure your `.env` file with the following values:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
- `CLERK_SECRET_KEY`: Your Clerk secret key
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`: Clerk sign-in URL
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`: Clerk sign-up URL
- `DATABASE_URL`: Your PostgreSQL database URL
- `SIGNING_SECRET`: A secure random string for signing
- `NEXT_PUBLIC_APP_URL`: Your application URL
- `ANTHROPIC_API_KEY`: Your Anthropic API key
- `OPENAI_API_KEY`: Your OpenAI API key
- `NEXT_PUBLIC_SIMLI_API_KEY`: Your Simli API key
- `NEXT_PUBLIC_SIMLI_FACE_ID`: Your Simli Face ID
- `NEXT_PUBLIC_DEEPGRAM_API_KEY`: Your Deepgram API key

5. Run database migrations:
```bash
npm run db:migrate
```

6. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Database Setup

We use PostgreSQL as our database. For local development, you can use any PostgreSQL instance. For production, we recommend using [Neon](https://console.neon.tech/).

After setting up your database, make sure to:
1. Update the `DATABASE_URL` in your `.env` file
2. Run migrations to set up the database schema

## Production Deployment

The application is optimized for deployment on Vercel. Make sure to:
1. Configure all environment variables in your Vercel project settings
2. Connect your repository to Vercel for automatic deployments
3. Ensure your database is accessible from your production environment

## Support

For any questions or issues, please open a GitHub issue or contact the development team.

## License

[Add your license information here]
