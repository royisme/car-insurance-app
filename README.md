# Canadian Car Insurance Quote App

A demonstration application for obtaining car insurance quotes in Canada. This application is built with Next.js and PrimeReact, and is deployed on Vercel.

## Features

- Three-step quote process
  - Driver information collection
  - Vehicle information collection
  - Coverage selection and customization
- Bilingual support (English and Chinese)
- Theme switching (Professional and Vibrant themes)
- Mock quote calculation
- Email quote delivery
- Responsive design for all devices

## Technology Stack

- **Frontend**: Next.js 14, PrimeReact components
- **Database**: Vercel Postgres (via Prisma ORM)
- **API**: Next.js API Routes
- **Deployment**: Vercel
- **Email**: Resend API
- **Internationalization**: next-intl

## Local Development

### Prerequisites

- Node.js 18+
- PostgreSQL database or Vercel account

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/car-insurance-app.git
cd car-insurance-app
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env` file with the following variables:

```
DATABASE_URL="postgresql://username:password@localhost:5432/car_insurance"
RESEND_API_KEY="your_resend_api_key"
```

4. Initialize the database:

```bash
npx prisma migrate dev
npm run seed
```

5. Start the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment on Vercel

1. Push your code to a GitHub repository.

2. Import the repository in Vercel.

3. Configure environment variables:
   - `DATABASE_URL`: Your Vercel Postgres connection string
   - `RESEND_API_KEY`: Your Resend API key

4. Deploy the application.

## Project Structure

```
/app
  /[locale]              # Internationalized routes
    /page.tsx            # Home page
    /quote/page.tsx      # Quote wizard
    /result/page.tsx     # Quote result page
  /api                   # API routes
  /components            # Shared components
  /lib                   # Utility functions
/prisma                  # Database schema
/data                    # Seed data
```

## License

This project is for demonstration purposes only.
