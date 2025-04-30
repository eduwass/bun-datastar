import { ServerSentEventGenerator } from "../../node_modules/@starfederation/datastar-sdk/src/web/serverSentEventGenerator";
import { incrementMessageCount } from "../stream/message-count";

export default async function handler(req: Request): Promise<Response> {
    const result = await ServerSentEventGenerator.readSignals(req);
    if (result.success) {
        incrementMessageCount();
        return new Response("OK");
    }
    return new Response(result.error, { status: 400 });
} 