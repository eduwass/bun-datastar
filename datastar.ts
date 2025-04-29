import { ServerSentEventGenerator as datastar } from "bun-datastar-sdk";

let messageCount = 0;

// Create an SSE handler for real-time updates
const handler = datastar.stream(async (stream) => {
    // Initial state
    stream.mergeSignals({
        count: messageCount
    });

    // Keep connection alive and update count periodically
    while (true) {
        await Bun.sleep(1000);
        stream.mergeSignals({
            count: messageCount
        });
    }
});

// Use with Bun's server
Bun.serve({
    port: 3000,
    async fetch(req) {
        const url = new URL(req.url);

        // Handle SSE connections
        if (url.pathname === "/events") {
            return handler(req);
        }

        // Handle signal updates
        if (url.pathname === "/signals") {
            const result = await datastar.readSignals(req);
            if (result.success) {
                messageCount++;
                return new Response("OK");
            }
            return new Response(result.error, { status: 400 });
        }

        // Serve index2.html on homepage
        if (url.pathname === "/") {
            return new Response(Bun.file("index2.html"));
        }

        return new Response("Not found", { status: 404 });
    }
});