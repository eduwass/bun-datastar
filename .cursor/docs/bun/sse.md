Bun supports implementing Server-Sent Events (SSE) by returning a ReadableStream as the body of a Response, and setting the Content-Type header to text/event-stream. Here’s a community example that sets up an SSE endpoint in Bun, sending a "Hello, World!" message every second:

javascript
function sendSSEMessage(controller, data) {
  controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
}

function sse(req) {
  const { signal } = req;
  return new Response(
    new ReadableStream({
      start(controller) {
        const interval = setInterval(() => {
          sendSSEMessage(controller, "Hello, World!");
        }, 1000);

        signal.onabort = () => {
          clearInterval(interval);
          controller.close();
        };
      }
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      }
    }
  );
}

Bun.serve({
  fetch(req) {
    if (new URL(req.url).pathname === "/sse") {
      return sse(req);
    }
    return new Response("Not Found", { status: 404 });
  }
});
1

This creates a simple SSE endpoint at /sse. You can find further discussion and details in Support Server Sent Events.

Sources
Support Server Sent Events
https://github.com/oven-sh/bun/issues/2443