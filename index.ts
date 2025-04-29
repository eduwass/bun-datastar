import { serve } from "bun";

serve({
    port: 3000,
    fetch(req) {
        console.log(req);
        if (req.url === "/events") {
            const stream = new ReadableStream({
                start(controller) {
                    console.log("start");
                    const timer = setInterval(() => {
                        controller.enqueue(`data: ${new Date().toISOString()}\n\n`);
                    }, 1000);
                    controller.closed.then(() => clearInterval(timer));
                },
            });
            console.log("stream", stream);
            return new Response(stream, {
                headers: {
                    "Content-Type": "text/event-stream",
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                },
            });
        }
        // index.html
        return new Response(Bun.file("index.html"));
    },
});