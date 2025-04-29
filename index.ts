import { datastar } from "bun-datastar-sdk";
import type { Server } from "bun";

let messageCount = 0;
const activeConnections = new Map();

// Create an SSE handler for real-time updates
const handler = datastar.stream(async (stream) => {
    const connectionId = Date.now().toString();
    console.log(`[${connectionId}] New SSE connection established`);

    // Store connection info with abort controller
    const abortController = new AbortController();
    const connectionInfo = {
        id: connectionId,
        active: true,
        stream,
        abortController,
        cleanup: () => {
            console.log(`[${connectionId}] Cleaning up connection`);
            const info = activeConnections.get(connectionId);
            if (info) {
                info.active = false;
                info.abortController.abort();
                activeConnections.delete(connectionId);
            }
        }
    };
    activeConnections.set(connectionId, connectionInfo);

    try {
        // Initial state
        stream.mergeSignals({
            count: messageCount,
            connectionStatus: 'connected'
        });

        // Initial fragment
        stream.mergeFragments(`<div class="success">
            Connected at ${new Date().toLocaleTimeString()}
        </div>`, {
            selector: '#fragment-container',
            mergeMode: 'append'
        });

        // Keep connection alive and update count and fragments periodically
        while (connectionInfo.active) {
            try {
                // Use the abort signal for the sleep
                await new Promise((resolve, reject) => {
                    const timeout = setTimeout(resolve, 1000);
                    abortController.signal.addEventListener('abort', () => {
                        clearTimeout(timeout);
                        resolve();
                    });
                });
                
                // Check if connection is still active
                if (!connectionInfo.active) {
                    console.log(`[${connectionId}] Connection marked as inactive, stopping loop`);
                    break;
                }

                messageCount++;
                
                stream.mergeSignals({
                    count: messageCount
                });

                // Send a new fragment every 5 seconds
                if (messageCount % 5 === 0) {
                    stream.mergeFragments(`<div class="success">
                        Fragment update #${messageCount/5} at ${new Date().toLocaleTimeString()}
                    </div>`, {
                        selector: '#fragment-container',
                        mergeMode: 'append'
                    });
                }
            } catch (innerError) {
                if (innerError.name !== 'AbortError') {
                    console.error(`[${connectionId}] Error in SSE loop:`, innerError);
                }
                break;
            }
        }
    } catch (error) {
        console.error(`[${connectionId}] SSE connection error:`, error);
    } finally {
        connectionInfo.cleanup();
    }
});

// Error boundary for debugging
const errorBoundary = async (fn: () => Promise<Response>): Promise<Response> => {
    try {
        return await fn();
    } catch (error) {
        console.error('=== Error Boundary Caught Error ===');
        console.error('Error type:', error?.constructor?.name);
        console.error('Error message:', error?.message);
        console.error('Error stack:', error?.stack);
        console.error('Full error object:', error);
        console.error('================================');
        return new Response("Internal Server Error", { status: 500 });
    }
};

// Use with Bun's server
const server = Bun.serve({
    port: 3000,
    async fetch(req: Request, server: Server): Promise<Response> {
        return errorBoundary(async () => {
            const url = new URL(req.url);
            console.log(`[${Date.now()}] Handling request for: ${url.pathname}`);

            // Handle SSE connections
            if (url.pathname === "/events") {
                console.log('[DEBUG] New /events request received');
                console.log('[DEBUG] Request headers:', Object.fromEntries(req.headers.entries()));
                
                try {
                    const response = handler(req);
                    console.log('[DEBUG] SSE handler created response');
                    
                    // Add abort listener that triggers cleanup
                    req.signal.addEventListener('abort', () => {
                        console.log('[DEBUG] SSE request aborted');
                        // Find and cleanup the connection
                        for (const [_, connection] of activeConnections) {
                            connection.cleanup();
                        }
                    });

                    return response;
                } catch (error) {
                    console.error('[DEBUG] Error in SSE handler:', error);
                    return new Response("SSE Error", { status: 500 });
                }
            }

            // Handle signal updates
            if (url.pathname === "/signals") {
                console.log('[DEBUG] Processing /signals request');
                const result = await datastar.readSignals(req);
                if (result.success) {
                    messageCount++;
                    return new Response("OK");
                }
                return new Response(result.error, { status: 400 });
            }

            // Serve index.html on homepage
            if (url.pathname === "/") {
                console.log('[DEBUG] Serving index.html');
                return new Response(Bun.file("index.html"));
            }

            console.log('[DEBUG] Path not found:', url.pathname);
            return new Response("Not found", { status: 404 });
        });
    },
    error(error: Error) {
        console.error('=== Server Error Handler ===');
        console.error('Error type:', error?.constructor?.name);
        console.error('Error message:', error?.message);
        console.error('Error stack:', error?.stack);
        console.error('Full error object:', error);
        console.error('==========================');
        return new Response("Internal Server Error", { status: 500 });
    }
});

// Cleanup on server shutdown
process.on('SIGTERM', () => {
    console.log('Server shutting down, cleaning up connections...');
    for (const [_, connection] of activeConnections) {
        connection.cleanup();
    }
});

// Handle other termination signals
process.on('SIGINT', () => {
    console.log('Server interrupted, cleaning up...');
    process.exit(0);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error('=== Uncaught Exception ===');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    console.error('Full error object:', error);
    console.error('========================');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('=== Unhandled Rejection ===');
    console.error('Reason:', reason);
    console.error('Promise:', promise);
    console.error('=========================');
});

console.log(`Server running at http://localhost:${server.port}`);