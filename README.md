# bun-datastar

A simple Bun project to try it out with DataStar.

## Prerequisites

- [Bun](https://bun.sh/) runtime installed

## Installation

Clone the repository and install dependencies:

```bash
bun i
```

## Development

To run the project in development mode:

```bash
bun dev
```

## Dependencies

- [@starfederation/datastar-sdk](https://www.npmjs.com/package/@starfederation/datastar-sdk) - DataStar SDK for data operations

## Project Structure & Routing

The application uses Bun's FileSystemRouter for a Next.js-style routing system:

```
├── api/          # API routes for data operations
│   └── *.ts      # Each file becomes an API endpoint
├── pages/        # Page routes
│   └── *.html    # Each HTML file becomes a page route
└── public/       # Static files served directly
```

### How Routing Works

- `/api/*` - Routes starting with /api are mapped to TypeScript files in the `api` directory
- `/*` - Page routes are mapped to HTML files in the `pages` directory
- Static files are served directly from the `public` directory
- 404 response for any unmatched routes

The router automatically handles all routing based on the file structure, making it easy to add new routes by simply adding files to the appropriate directories.
