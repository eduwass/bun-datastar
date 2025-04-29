import type { Server } from "bun";
import { Edge } from "edge.js";

// Initialize Edge.js
const edge = Edge.create({
    cache: process.env.NODE_ENV === 'production'
});

// Mount views directory using URL
edge.mount(new URL('../views', import.meta.url));

// Initialize routers for API and pages
const apiRouter = new Bun.FileSystemRouter({
    dir: "./api",
    style: "nextjs"
});

const pagesRouter = new Bun.FileSystemRouter({
    dir: "./views/pages",
    style: "nextjs",
    fileExtensions: [".edge"]
});

/**
 * Handles all routing logic for the application including:
 * - API routes (/api/*)
 * - Page routes (mapped to .edge templates)
 * - Static files (from /public directory)
 */
export async function handleRequest(req: Request): Promise<Response> {
    const url = new URL(req.url);
    
    // Handle API routes
    if (url.pathname.startsWith("/api/")) {
        const pathWithoutApi = url.pathname.replace(/^\/api/, "");
        const match = apiRouter.match(pathWithoutApi);
        
        if (match) {
            const module = await import(match.filePath);
            return module.default(req);
        }
    }

    // Handle page routes
    const pageMatch = pagesRouter.match(req);
    if (pageMatch) {
        try {
            // Get template name without extension
            const templateName = 'pages/index';
            
            // Render the template with Edge.js
            const html = await edge.render(templateName);
            return new Response(html, {
                headers: {
                    "Content-Type": "text/html",
                },
            });
        } catch (error: any) {
            console.error('Template rendering error:', error);
            return new Response(`Template Error: ${error.message}`, { status: 500 });
        }
    }

    // Handle static files
    const staticFile = Bun.file(`public${url.pathname}`);
    if (await staticFile.exists()) {
        return new Response(staticFile);
    }

    // Return 404 for unmatched routes
    return new Response("Not Found", { status: 404 });
}

/**
 * Creates and starts the server with the configured router
 */
export function startServer(options: { port: number } = { port: 3000 }): Server {
    return Bun.serve({
        port: options.port,
        fetch: handleRequest
    });
} 