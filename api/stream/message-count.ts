import { datastar } from "bun-datastar-sdk";

let messageCount = 0;

export function incrementMessageCount() {
    messageCount++;
}

export default function handler(req: Request): Response {
    return datastar.stream(async (stream) => {
        // Initial state
        stream.mergeSignals({
            count: messageCount,
            connectionStatus: 'connected'
        });

        // Keep connection alive and update count periodically
        while (true) {
            await Bun.sleep(1000);
            stream.mergeSignals({
                count: messageCount
            });
        }
    })(req);
} 