import { ServerSentEventGenerator as datastar } from "@datastar-typescript-sdk";

export default function handler(req: Request): Response {
    return datastar.stream(async (stream) => {
        // Initial fragment
        stream.mergeFragments(`<div class="success">
            Connected at ${new Date().toLocaleTimeString()}
        </div>`, {
            selector: '#fragment-container',
            mergeMode: 'append'
        });

        let updateCount = 0;
        // Send new fragments periodically
        while (true) {
            await Bun.sleep(5000); // Every 5 seconds
            updateCount++;
            stream.mergeFragments(`<div class="success">
                Fragment update #${updateCount} at ${new Date().toLocaleTimeString()}
            </div>`, {
                selector: '#fragment-container',
                mergeMode: 'append'
            });
        }
    });
} 