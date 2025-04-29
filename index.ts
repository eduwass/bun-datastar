import { createSSEHandler } from "bun-sse";

const sse = createSSEHandler(async (stream, req) => {
  while (!req.signal.aborted) {
    stream.event("bun", { hello: "world" });
    stream.send("Hello!");
    await Bun.sleep(1000);
  }
});

Bun.serve({
  fetch(req) {
    if (new URL(req.url).pathname === "/stream") return sse(req);
    return new Response(Bun.file("index.html"));
  },
});