import { ServerSentEventGenerator as datastar } from "@datastar-typescript-sdk";
import { incrementMessageCount } from "../stream/message-count";

export default async function handler(req: Request): Promise<Response> {
    const result = await datastar.readSignals(req);
    if (result.success) {
        incrementMessageCount();
        return new Response("OK");
    }
    return new Response(result.error, { status: 400 });
} 