// Import the implementation
import { ServerSentEventGenerator } from "./serverSentEventGenerator";

// Re-export all types that should be available to consumers
export type {
    FragmentMergeMode,
    EventType,
    DatastarEventOptions as SSEOptions,
    FragmentOptions,
    MergeFragmentsOptions,
    MergeSignalsOptions,
    ExecuteScriptOptions,
} from "./types";

// Export the implementation and its alias
export { ServerSentEventGenerator, ServerSentEventGenerator as datastar };

// Export constants
export * from "./consts.ts"; 