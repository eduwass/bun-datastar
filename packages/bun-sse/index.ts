// bun-sse/index.ts

export type SSEHandler = (stream: SSEStream, req: Request) => void | Promise<void>;

export interface SSEStream {
  send(data: string | object): void;
  event(name: string, data: string | object): void;
  id(id: string): void;
  retry(ms: number): void;
  close(): void;
}

export function createSSEHandler(handler: SSEHandler): (req: Request) => Response {
  return (req: Request): Response => {
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();
    const abortController = new AbortController();

    const stream: SSEStream = {
      send(data) {
        if (abortController.signal.aborted) return;
        const payload = typeof data === "string" ? data : JSON.stringify(data);
        writer.write(encoder.encode(`data: ${payload}\n\n`)).catch(() => {});
      },
      event(name, data) {
        if (abortController.signal.aborted) return;
        const payload = typeof data === "string" ? data : JSON.stringify(data);
        writer.write(encoder.encode(`event: ${name}\ndata: ${payload}\n\n`)).catch(() => {});
      },
      id(id) {
        if (abortController.signal.aborted) return;
        writer.write(encoder.encode(`id: ${id}\n\n`)).catch(() => {});
      },
      retry(ms) {
        if (abortController.signal.aborted) return;
        writer.write(encoder.encode(`retry: ${ms}\n\n`)).catch(() => {});
      },
      close() {
        if (abortController.signal.aborted) return;
        try {
          writer.close().catch(() => {});
        } catch {
          // Ignore close errors
        }
        abortController.abort();
      },
    };

    // Handle connection cleanup
    const cleanup = () => {
      try {
        stream.close();
      } catch {
        // Ignore close errors
      }
    };

    // Listen for connection abort
    req.signal.addEventListener('abort', () => {
      cleanup();
    });

    // Handle the SSE stream
    Promise.resolve().then(async () => {
      try {
        await handler(stream, req);
      } catch (error) {
        console.error('SSE handler error:', error);
      } finally {
        cleanup();
      }
    }).catch(() => {}); // Prevent unhandled rejections

    return new Response(readable, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  };
}