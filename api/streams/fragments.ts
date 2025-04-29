import { datastar } from "bun-datastar-sdk";
import { getMessageCount } from "./message-counter";

export const fragmentStreamHandler = datastar.stream(async (stream) => {
    // Initial fragment
    stream.mergeFragments(`<div class="success">
        Connected at ${new Date().toLocaleTimeString()}
    </div>`, {
        selector: '#fragment-container',
        mergeMode: 'append'
    });

    // Send new fragments periodically
    while (true) {
        await Bun.sleep(5000); // Every 5 seconds
        stream.mergeFragments(`<div class="success">
            Fragment update #${getMessageCount()/5} at ${new Date().toLocaleTimeString()}
        </div>`, {
            selector: '#fragment-container',
            mergeMode: 'append'
        });
    }
}); 