import { datastar } from "bun-datastar-sdk";

let messageCount = 0;

// Create an SSE handler for real-time message count updates
const messageStreamHandler = datastar.stream(async (stream) => {
    // Initial state
    stream.mergeSignals({
        count: messageCount,
        connectionStatus: 'connected'
    });

    // Keep connection alive and update count periodically
    while (true) {
        await Bun.sleep(1000);
        messageCount++;
        
        stream.mergeSignals({
            count: messageCount
        });
    }
});

// Create an SSE handler for fragment updates
const fragmentStreamHandler = datastar.stream(async (stream) => {
    // Initial fragment
    stream.mergeFragments(`<div class="success">
        Connected at ${new Date().toLocaleTimeString()}
    </div>`, {
        selector: '#fragment-container',
        mergeMode: 'append'
    });

    // Send new fragments periodically
    while (true) {
        await Bun.sleep(5000); // Every 5 seconds
        stream.mergeFragments(`<div class="success">
            Fragment update #${messageCount/5} at ${new Date().toLocaleTimeString()}
        </div>`, {
            selector: '#fragment-container',
            mergeMode: 'append'
        });
    }
});

// Use with Bun's server
Bun.serve({
    port: 3000,
    async fetch(req) {
        const url = new URL(req.url);

        // Handle real-time message count updates
        if (url.pathname === "/stream/message-count") {
            return messageStreamHandler(req);
        }

        // Handle fragment updates
        if (url.pathname === "/stream/fragments") {
            return fragmentStreamHandler(req);
        }

        // Handle signal updates
        if (url.pathname === "/api/signals/update") {
            const result = await datastar.readSignals(req);
            if (result.success) {
                messageCount++;
                return new Response("OK");
            }
            return new Response(result.error, { status: 400 });
        }

        // Serve index.html on homepage
        if (url.pathname === "/") {
            return new Response(Bun.file("index.html"));
        }

        return new Response("Not found", { status: 404 });
    }
});