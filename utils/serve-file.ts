export function serveFile(path: string): Response {
    try {
        return new Response(Bun.file(path));
    } catch (error) {
        return new Response("Not Found", { status: 404 });
    }
} 