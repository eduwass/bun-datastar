import { datastar } from "bun-datastar-sdk";

let messageCount = 0;

export const messageStreamHandler = datastar.stream(async (stream) => {
    // Initial state
    stream.mergeSignals({
        count: messageCount,
        connectionStatus: 'connected'
    });

    // Keep connection alive and update count periodically
    while (true) {
        await Bun.sleep(1000);
        messageCount++;
        
        stream.mergeSignals({
            count: messageCount
        });
    }
});

export const getMessageCount = () => messageCount;
export const incrementMessageCount = () => messageCount++; 