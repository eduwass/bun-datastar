import type { Server } from "bun";

// Initialize routers for API and pages
const apiRouter = new Bun.FileSystemRouter({
    dir: "./api",
    style: "nextjs"
});

const pagesRouter = new Bun.FileSystemRouter({
    dir: "./pages",
    style: "nextjs",
    fileExtensions: [".html"]
});

/**
 * Handles all routing logic for the application including:
 * - API routes (/api/*)
 * - Page routes (mapped to .html files)
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
        return new Response(Bun.file(pageMatch.filePath));
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