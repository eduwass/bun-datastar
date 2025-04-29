import { handleApiRequest } from "./api/routes";
import { serveFile } from "./utils/serve-file";

// Start the server
Bun.serve({
    port: 3000,
    async fetch(req) {
        const url = new URL(req.url);
        
        // First check if this is an API request
        const apiResponse = await handleApiRequest(req);
        if (apiResponse) return apiResponse;

        // If not an API request, serve the index.html file
        if (url.pathname === "/" || url.pathname === "/index.html") {
            return serveFile("public/index.html");
        }

        // Serve static files from public directory
        if (url.pathname.startsWith("/")) {
            return serveFile(`public${url.pathname}`);
        }

        // Return 404 for any unmatched routes
        return new Response("Not Found", { status: 404 });
    }
});