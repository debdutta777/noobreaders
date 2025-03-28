# NoobReaders - Web Novel Reading Platform

A web application for reading web novels from talented writers around the world. This platform connects to the existing Noob Writers database to provide a seamless reading experience for users.

## Features

- User authentication with email/password and social logins
- Personalized reading experience with library and bookmarking
- Novel discovery with advanced search and filtering
- Reading history tracking
- Customizable reading interface
- Social features including ratings, reviews, and comments
- Direct support for authors through donations

## Tech Stack

- Next.js 15+ with App Router
- TypeScript
- MongoDB for database
- NextAuth.js for authentication
- Tailwind CSS for styling
- TanStack Query for data fetching
- Stripe/PayPal for payment processing

## Getting Started

### Prerequisites

- Node.js 18.17.0 or higher
- MongoDB instance (local or remote)
- Account credentials for OAuth providers (Google, GitHub) if needed
- Stripe/PayPal API keys for payment processing

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/noobreaders.git
   cd noobreaders
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_SECRET=your_nextauth_secret_key
   NEXTAUTH_URL=http://localhost:3000
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GITHUB_ID=your_github_client_id
   GITHUB_SECRET=your_github_client_secret
   STRIPE_PUBLIC_KEY=your_stripe_public_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   PAYPAL_CLIENT_ID=your_paypal_client_id
   PAYPAL_CLIENT_SECRET=your_paypal_client_secret
   ```

4. Run the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

- `app/` - Next.js app directory
  - `api/` - API routes
  - `components/` - React components
  - `hooks/` - Custom React hooks
  - `lib/` - Utility functions and libraries
    - `models/` - MongoDB models
    - `utils/` - Utility functions
    - `services/` - Service functions
    - `auth/` - Authentication logic
  - `(pages)/` - App router pages
  - `types/` - TypeScript type definitions

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
