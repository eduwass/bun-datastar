import { startServer } from "./router";
const server = startServer({ port: 3000 });
console.log(`🚀 Server running at http://localhost:${server.port}`);