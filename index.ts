function sendSSECustom(controller: ReadableStreamDirectController, eventName: string, data: string) {
    return controller.write(`event: ${eventName}\ndata:${JSON.stringify(data)}\n\n`);
}
function sendSSEMessage(controller: ReadableStreamDirectController, data: string) {
    return controller.write(`data:${JSON.stringify(data)}\n\n`);
}
function sse(req: Request): Response {
    const signal = req.signal;
    return new Response(
        new ReadableStream({
            type: "direct",
            async pull(controller: ReadableStreamDirectController) {
                while (!signal.aborted) {
                    await sendSSECustom(controller, "bun", "Hello, World!");
                    await sendSSEMessage(controller, "Hello, World!");
                    await controller.flush();
                    await Bun.sleep(1000);
                }
                controller.close();
            },
        }),
        { status: 200, headers: { "Content-Type": "text/event-stream" } },
    );
}
Bun.serve({
    port: 3000,
    fetch(req) {
        if (new URL(req.url).pathname === "/stream") {
            return sse(req);
        }
        // else return index.html
        return new Response(Bun.file("index.html"));
    },
});