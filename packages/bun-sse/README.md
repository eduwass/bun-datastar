# bun-sse

**Simple, minimal Server-Sent Events (SSE) helper for [Bun](https://bun.sh/)** — built to abstract away Bun's quirks around streaming, and make real-time communication easy and crash-free.

See related Github Issue: https://github.com/oven-sh/bun/issues/2443

---

## 🔥 Why this exists

Bun has native support for `TransformStream`, but it can behave unexpectedly with SSE:

- Closing a `WritableStreamDefaultWriter` multiple times causes a crash
- Streaming over `ReadableStream` requires special handling to avoid disconnects
- SSE needs precise flushing and newline formatting (`\n\n`) that’s easy to mess up

This tiny package wraps all that up for you.

---

## ✅ Features

- Minimal API: just `createSSEHandler()`
- Auto-writes `data: ...\n\n` or `event: ...\ndata: ...\n\n`
- Avoids `writer.close()` crashes
- Compatible with browser auto-reconnect via `Last-Event-ID`
- Works seamlessly with Bun v1.2+

---

## 📦 Installation

```bash
bun add bun-sse
```

---

## 🧱 Usage

```ts
import { createSSEHandler } from "bun-sse";

const sse = createSSEHandler(async (stream, req) => {
  while (!req.signal.aborted) {
    stream.event("ping", { time: Date.now() });
    await Bun.sleep(1000);
  }
});

Bun.serve({
  fetch(req) {
    if (new URL(req.url).pathname === "/stream") return sse(req);
    return new Response("Hello World");
  }
});
```

If you do a curl request to the endpoint, you'll see the SSE stream:

```bash
curl http://localhost:3000/stream
```

You should see something like this:

```
event: ping
data: {"time":1714435200000}

event: ping
data: {"time":1714435201000}

event: ping
data: {"time":1714435202000}
```

---

## ✨ API

### `createSSEHandler((stream, req) => void | Promise<void>)`
Creates a `fetch` handler for an SSE endpoint.

### `stream.send(data: string | object)`
Sends a generic message.

### `stream.event(eventName: string, data: string | object)`
Sends a named custom event.

### `stream.id(id: string)`
Sets the event ID (used for browser reconnect tracking).

### `stream.retry(ms: number)`
Suggests a reconnect interval to the client.

### `stream.close()`
No-op for now due to Bun crash bug. Connection closes automatically on client disconnect.

---

## 🧠 Gotchas / Notes

- **Don’t call `writer.close()`** manually — Bun will crash if the stream is already closed or errored. This package handles cleanup automatically.
- **No need to flush** — `writer.write()` flushes immediately.
- **`Last-Event-ID` is supported** by the browser — access it like this:

```ts
req.headers.get("last-event-id")
```

Use it to resume missed messages if needed.

---

## 📄 License
MIT

---

## 💬 Feedback
Issues, PRs and improvements welcome! This package is intentionally small and focused — keep it lean.

Inspired by a real need while exploring Bun's SSE behavior. Built by [Edu Wass](https://github.com/eduwass).
