# CargoPulse - Logistics & Shipping Management System

A comprehensive, professional logistics and shipping management application built with Next.js, TypeScript, MongoDB, and modern web technologies.

## Features

- **Real-time Parcel Tracking**: Track shipments with live location updates and detailed timelines
- **Admin Dashboard**: Complete admin panel for managing parcels, services, pricing, and more
- **User Authentication**: Secure JWT-based authentication system
- **Payment Management**: Integrated payment processing and tracking
- **Service Management**: Manage shipping services and transport means
- **Contact & Support**: Customer contact management and FAQ system
- **Responsive Design**: Modern, mobile-first UI with dark mode support
- **Email Notifications**: Automated email notifications for shipment updates

## Tech Stack

- **Framework**: Next.js 15.3.1 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **UI Library**: Mantine UI, Tailwind CSS
- **Authentication**: JWT (JSON Web Tokens)
- **Form Handling**: React Hook Form with Zod validation
- **Maps**: React Leaflet for tracking visualization
- **State Management**: React Context API
- **HTTP Client**: Axios with interceptors
- **Email**: Nodemailer
- **File Upload**: Cloudinary integration

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- MongoDB database (local or MongoDB Atlas)
- Cloudinary account (for image uploads)
- Email service credentials (Gmail or SMTP)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd cargopulse
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env` and fill in your configuration:

- `MONGODB_URI`: Your MongoDB connection string
- `JWT_KEY`: A secure secret key for JWT tokens
- `EMAIL_*`: Your email service credentials
- `NEXT_PUBLIC_CLOUDINARY_*`: Your Cloudinary credentials

4. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── (dashboards)/      # Protected dashboard routes
│   ├── api/               # API route handlers
│   ├── auth/              # Authentication pages
│   └── tracking/          # Public tracking pages
├── components/            # React components
│   ├── common/           # Shared components
│   ├── features/         # Feature-specific components
│   ├── layout/           # Layout components
│   └── ui/               # UI primitives
├── contexts/             # React context providers
├── lib/                  # Core business logic
│   ├── controllers/      # Request controllers
│   ├── dto/             # Data transfer objects
│   ├── models/          # MongoDB models
│   ├── services/        # Business logic services
│   └── utils/           # Utility functions
└── utils/               # Client-side utilities
```

## Key Features

### Authentication & Authorization

- JWT-based authentication
- Role-based access control (Admin/User)
- Secure cookie management
- Protected API routes

### Parcel Management

- Create and manage shipments
- Real-time tracking with map visualization
- Timeline updates with email notifications
- Status management (Pending, Dispatched, In Transit, etc.)

### Admin Dashboard

- Comprehensive admin panel
- Manage parcels, services, pricing
- Contact and FAQ management
- Payment and issue tracking

### Public Features

- Shipment tracking by ID
- Contact form
- Service listings
- FAQ system

## Environment Variables

See `.env.example` for all required environment variables.

## Building for Production

```bash
npm run build
npm start
```

## Security Features

- JWT token authentication
- Secure cookie handling (SameSite, Secure flags)
- Input validation with Joi and Zod
- Role-based access control
- Protected API routes
- Error handling with proper status codes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is private and proprietary.

## Support

For support, email support@fedxglobalshipping.org or open an issue in the repository.
