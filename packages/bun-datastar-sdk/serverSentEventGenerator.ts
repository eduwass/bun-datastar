import type { DatastarEventOptions, EventType, Jsonifiable, MergeFragmentsOptions, FragmentOptions, MergeSignalsOptions, ExecuteScriptOptions } from "./types.ts";
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

  /**
   * Merges HTML fragments into the DOM.
   * @param fragments - The HTML fragments to merge
   * @param options - Configuration options for merging
   * @param options.selector - CSS selector to target where fragments should be merged
   * @param options.mergeMode - How to merge the fragments: 'morph' (default), 'inner', 'outer', 'prepend', 'append', 'before', 'after', or 'upsertAttributes'
   * @param options.useViewTransition - Whether to use view transitions API when merging
   * @param options.eventId - Optional ID for the SSE event
   * @param options.retryDuration - Optional retry duration in milliseconds
   */
  public override mergeFragments(fragments: string, options?: MergeFragmentsOptions): ReturnType<typeof this.send> {
    return super.mergeFragments(fragments, options);
  }

  /**
   * Removes HTML fragments from the DOM.
   * @param selector - CSS selector for elements to remove
   * @param options - Configuration options for removal
   * @param options.useViewTransition - Whether to use view transitions API when removing
   * @param options.eventId - Optional ID for the SSE event
   * @param options.retryDuration - Optional retry duration in milliseconds
   */
  public override removeFragments(selector: string, options?: FragmentOptions): ReturnType<typeof this.send> {
    return super.removeFragments(selector, options);
  }

  /**
   * Merges signals into the store.
   * @param data - Data object that will be merged into the client's signals
   * @param options - Configuration options for merging
   * @param options.onlyIfMissing - Only merge if the signal doesn't exist
   * @param options.eventId - Optional ID for the SSE event
   * @param options.retryDuration - Optional retry duration in milliseconds
   */
  public override mergeSignals(data: Record<string, Jsonifiable>, options?: MergeSignalsOptions): ReturnType<typeof this.send> {
    return super.mergeSignals(data, options);
  }

  /**
   * Removes signals from the store.
   * @param paths - Array of dot-notation paths to remove from signals
   * @param options - Configuration options
   * @param options.eventId - Optional ID for the SSE event
   * @param options.retryDuration - Optional retry duration in milliseconds
   */
  public override removeSignals(paths: string[], options?: DatastarEventOptions): ReturnType<typeof this.send> {
    return super.removeSignals(paths, options);
  }

  /**
   * Executes JavaScript in the browser.
   * @param script - JavaScript code to execute
   * @param options - Configuration options
   * @param options.autoRemove - Whether to remove the script after execution (default: true)
   * @param options.attributes - Script element attributes (type, defer, async, etc.)
   * @param options.eventId - Optional ID for the SSE event
   * @param options.retryDuration - Optional retry duration in milliseconds
   */
  public override executeScript(script: string, options?: ExecuteScriptOptions): ReturnType<typeof this.send> {
    return super.executeScript(script, options);
  }

  protected override send(
    event: EventType,
    dataLines: string[],
    options: DatastarEventOptions,
  ): string[] {
    const eventLines = super.send(event, dataLines, options);
    const eventData = eventLines.join("");
    this.stream.event(event, eventData);
    return eventLines;
  }

  /**
   * Reads client sent signals based on HTTP methods
   * @param request - The Bun Request object
   * @returns Object containing success status and either signals or error message
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