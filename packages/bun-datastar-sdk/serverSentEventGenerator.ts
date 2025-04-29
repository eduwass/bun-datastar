import { DatastarEventOptions, EventType, type Jsonifiable } from "./types.ts";
import { ServerSentEventGenerator as AbstractSSEGenerator } from "./abstractServerSentEventGenerator.ts";
import { createSSEHandler, type SSEStream } from "bun-sse";

function isRecord(obj: unknown): obj is Record<string, Jsonifiable> {
  return typeof obj === "object" && obj !== null;
}

/**
 * ServerSentEventGenerator class for Bun, responsible for initializing and handling
 * server-sent events (SSE) as well as reading signals sent by the client.
 * Cannot be instantiated directly, you must use the stream static method.
 */
export class ServerSentEventGenerator extends AbstractSSEGenerator {
  protected stream: SSEStream;

  protected constructor(stream: SSEStream) {
    super();
    this.stream = stream;
  }

  /**
   * Initializes the server-sent event generator and executes the streamFunc function.
   *
   * @param streamFunc - A function that will be passed the initialized ServerSentEventGenerator class as it's first parameter.
   * @returns A handler function compatible with Bun's HTTP server
   */
  static stream(
    streamFunc: (stream: ServerSentEventGenerator) => Promise<void> | void,
  ): (req: Request) => Response {
    return createSSEHandler(async (stream, req) => {
      const generator = new ServerSentEventGenerator(stream);
      const result = streamFunc(generator);
      if (result instanceof Promise) await result;
    });
  }

  protected override send(
    event: EventType,
    dataLines: string[],
    options: DatastarEventOptions,
  ): string[] {
    const eventLines = super.send(event, dataLines, options);

    // Join all lines into a single string and send it through bun-sse
    const eventData = eventLines.join("");
    this.stream.event(event, eventData);

    return eventLines;
  }

  /**
   * Reads client sent signals based on HTTP methods
   *
   * @params request - The Bun Request object.
   *
   * @returns An object containing a success boolean and either the client's signals or an error message.
   */
  static async readSignals(request: Request): Promise<
    | { success: true; signals: Record<string, Jsonifiable> }
    | { success: false; error: string }
  > {
    try {
      if (request.method === "GET") {
        const url = new URL(request.url);
        const params = url.searchParams;

        if (params.has("datastar")) {
          const signals = JSON.parse(params.get("datastar")!);
          if (isRecord(signals)) {
            return { success: true, signals };
          } else throw new Error("Datastar param is not a record");
        } else throw new Error("No datastar object in request");
      }

      const signals = await request.json();

      if (isRecord(signals)) {
        return { success: true, signals };
      }

      throw new Error("Parsed JSON body is not of type record");
    } catch (e: unknown) {
      if (isRecord(e) && "message" in e && typeof e.message === "string") {
        return { success: false, error: e.message };
      }

      return { success: false, error: "unknown error when parsing request" };
    }
  }
} 