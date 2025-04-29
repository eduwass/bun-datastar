import { startServer } from "./utils/router";
// Start the server with routing for:
// - API routes (/api/*)
// - Page routes (mapped to /views/pages/*.edge files)
// - Static files (from /public directory)
const server = startServer({ port: 3000 });
console.log(`🚀 Server running at http://localhost:${server.port}`);