import { datastar } from "bun-datastar-sdk";

export const countToTenHandler = datastar.stream(async (stream) => {
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
    // Connection will close automatically when we exit the while loop
}); 