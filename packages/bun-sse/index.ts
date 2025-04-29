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

    const stream: SSEStream = {
      send(data) {
        const payload = typeof data === "string" ? data : JSON.stringify(data);
        writer.write(encoder.encode(`data: ${payload}\n\n`));
      },
      event(name, data) {
        const payload = typeof data === "string" ? data : JSON.stringify(data);
        writer.write(encoder.encode(`event: ${name}\ndata: ${payload}\n\n`));
      },
      id(id) {
        writer.write(encoder.encode(`id: ${id}\n\n`));
      },
      retry(ms) {
        writer.write(encoder.encode(`retry: ${ms}\n\n`));
      },
      close() {
        // intentionally a no-op to avoid Bun crash on double close
      },
    };

    handler(stream, req).catch(() => {}); // prevent unhandled rejection

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