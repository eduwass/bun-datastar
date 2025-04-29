// Initialize routers
const apiRouter = new Bun.FileSystemRouter({
    dir: "./api",
    style: "nextjs"
});

const pagesRouter = new Bun.FileSystemRouter({
    dir: "./pages",
    style: "nextjs",
    fileExtensions: [".html"]
});

// Start the server
Bun.serve({
    port: 3000,
    async fetch(req) {
        const url = new URL(req.url);
        
        // First check if this is an API request
        if (url.pathname.startsWith("/api/")) {
            // Strip the /api prefix before matching
            const pathWithoutApi = url.pathname.replace(/^\/api/, "");
            const match = apiRouter.match(pathWithoutApi);
            
            if (match) {
                const module = await import(match.filePath);
                return module.default(req);
            }
        }

        // Then try to match page routes
        const pageMatch = pagesRouter.match(req);
        if (pageMatch) {
            return new Response(Bun.file(pageMatch.filePath));
        }

        // Try to serve static files from public directory
        const staticFile = Bun.file(`public${url.pathname}`);
        if (await staticFile.exists()) {
            return new Response(staticFile);
        }

        // Return 404 for any unmatched routes
        return new Response("Not Found", { status: 404 });
    }
});