import { ServerSentEventGenerator } from "bun-datastar-sdk";


// Create an SSE handler
const handler = ServerSentEventGenerator.stream(async (stream) => {
    // Send HTML fragments
    stream.mergeFragments("<div>New content</div>", {
        selector: "#target",
        mergeMode: "inner"
    });

    // Send signals
    stream.mergeSignals({
        count: 42,
        status: "ready"
    });

    // Execute client-side scripts
    stream.executeScript(`
    console.log("Hello from Datastar!");
  `);
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
            const result = await ServerSentEventGenerator.readSignals(req);
            if (result.success) {
                // Handle signals...
                return new Response("OK");
            }
            return new Response(result.error, { status: 400 });
        }

        return new Response("Not found", { status: 404 });
    }
});