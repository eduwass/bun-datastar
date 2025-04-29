import { datastar } from "bun-datastar-sdk";
import { incrementMessageCount } from "../streams/message-counter";

export async function handleSignalsUpdate(req: Request): Promise<Response> {
    const result = await datastar.readSignals(req);
    if (result.success) {
        incrementMessageCount();
        return new Response("OK");
    }
    return new Response(result.error, { status: 400 });
} 