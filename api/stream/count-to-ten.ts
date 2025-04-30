import { ServerSentEventGenerator as datastar } from "@datastar-typescript-sdk";

export default function handler(req: Request): Response {
    return datastar.stream(async (stream) => {
        // Initial state
        let count = 0;
        stream.mergeSignals({
            limitedCount: count,
            limitedStatus: 'started'
        });

        // Count until 10
        while (count < 10) {
            await Bun.sleep(1000);
            count++;
            
            stream.mergeSignals({
                limitedCount: count,
                limitedStatus: count === 10 ? 'completed' : 'counting'
            });
        }

        // Final update before closing
        stream.mergeSignals({
            limitedStatus: 'completed'
        });
    });
} 