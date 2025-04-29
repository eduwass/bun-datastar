export type FragmentMergeMode = 
    | 'morph'      // Use Idiomorph to merge the fragment into the DOM
    | 'inner'      // Replace the innerHTML of the selector with the fragment
    | 'outer'      // Replace the outerHTML of the selector with the fragment
    | 'prepend'    // Prepend the fragment to the selector
    | 'append'     // Append the fragment to the selector
    | 'before'     // Insert the fragment before the selector
    | 'after'      // Insert the fragment after the selector
    | 'upsertAttributes'; // Update the attributes of the selector with the fragment

export interface SSEOptions {
    eventId?: string;
    retryDuration?: number; // in milliseconds
}

export interface MergeFragmentsOptions extends SSEOptions {
    selector?: string;
    mergeMode?: FragmentMergeMode;
    useViewTransition?: boolean;
}

export interface RemoveFragmentsOptions extends SSEOptions {
    useViewTransition?: boolean;
}

export interface MergeSignalsOptions extends SSEOptions {
    onlyIfMissing?: boolean;
}

export interface ExecuteScriptOptions extends SSEOptions {
    autoRemove?: boolean;
    attributes?: string[];
}

export class ServerSentEventGenerator {
    /**
     * Merges HTML fragments into the DOM
     * @param fragments The HTML fragments to merge
     * @param options Configuration options for the merge
     */
    mergeFragments(fragments: string, options?: MergeFragmentsOptions): void;

    /**
     * Removes HTML fragments from the DOM
     * @param selector CSS selector for elements to remove
     * @param options Configuration options for the removal
     */
    removeFragments(selector: string, options?: RemoveFragmentsOptions): void;

    /**
     * Merges signals into the store
     * @param signals Signals object or JSON string
     * @param options Configuration options for the merge
     */
    mergeSignals(signals: Record<string, any> | string, options?: MergeSignalsOptions): void;

    /**
     * Removes signals from the store
     * @param paths Array of dot-notation paths to remove
     * @param options Configuration options
     */
    removeSignals(paths: string[], options?: SSEOptions): void;

    /**
     * Executes JavaScript in the browser
     * @param script JavaScript code to execute
     * @param options Configuration options
     */
    executeScript(script: string, options?: ExecuteScriptOptions): void;

    /**
     * Creates a streaming SSE handler
     * @param handler Function that receives the SSE generator instance
     */
    static stream(handler: (stream: ServerSentEventGenerator) => Promise<void>): (req: Request) => Response;
}

export { ServerSentEventGenerator as datastar }; 