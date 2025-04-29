import { messageStreamHandler } from "./streams/message-counter";
import { fragmentStreamHandler } from "./streams/fragments";
import { countToTenHandler } from "./streams/count-to-ten";
import { handleSignalsUpdate } from "./handlers/signals";

export async function handleApiRequest(req: Request): Promise<Response | undefined> {
    const url = new URL(req.url);
    const path = url.pathname;

    // Stream endpoints
    if (path === "/api/stream/message-count") {
        return messageStreamHandler(req);
    }

    if (path === "/api/stream/fragments") {
        return fragmentStreamHandler(req);
    }

    if (path === "/api/stream/count-to-ten") {
        return countToTenHandler(req);
    }

    // Regular endpoints
    if (path === "/api/signals/update") {
        return handleSignalsUpdate(req);
    }

    // Return undefined if no route matches (allows fallthrough to other handlers)
    return undefined;
} 