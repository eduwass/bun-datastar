import {
  DatastarDatalineAttributes,
  DatastarDatalineAutoRemove,
  DatastarDatalineFragments,
  DatastarDatalineMergeMode,
  DatastarDatalineOnlyIfMissing,
  DatastarDatalinePaths,
  DatastarDatalineScript,
  DatastarDatalineSelector,
  DatastarDatalineSettleDuration,
  DatastarDatalineSignals,
  DatastarDatalineUseViewTransition,
  EventTypes,
  FragmentMergeModes,
} from "./consts.ts";

// Basic types
export type FragmentMergeMode = typeof FragmentMergeModes[number];
export type EventType = typeof EventTypes[number];
export type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
export type JsonObject = { [key: string]: JsonValue };
export type JsonArray = JsonValue[];
export type Jsonifiable = JsonValue | undefined;

// Event options
export interface DatastarEventOptions {
  eventId?: string;
  retryDuration?: number;
}

export interface FragmentOptions extends DatastarEventOptions {
  [DatastarDatalineUseViewTransition]?: boolean;
  [DatastarDatalineSettleDuration]?: number;
}

export interface MergeFragmentsOptions extends FragmentOptions {
  [DatastarDatalineMergeMode]?: FragmentMergeMode;
  [DatastarDatalineSelector]?: string;
}

export interface MergeFragmentsEvent {
  event: "datastar-merge-fragments";
  options: MergeFragmentsOptions;
  [DatastarDatalineFragments]: string;
}

export interface RemoveFragmentsEvent {
  event: "datastar-remove-fragments";
  options: FragmentOptions;
  [DatastarDatalineSelector]: string;
}

export interface MergeSignalsOptions extends DatastarEventOptions {
  [DatastarDatalineOnlyIfMissing]?: boolean;
}

export interface MergeSignalsEvent {
  event: "datastar-merge-signals";
  options: MergeSignalsOptions;
  [DatastarDatalineSignals]: Record<string, Jsonifiable>;
}

export interface RemoveSignalsEvent {
  event: "datastar-remove-signals";
  options: DatastarEventOptions;
  [DatastarDatalinePaths]: string[];
}

// Script-related types
type ScriptAttributes = {
  type?: "module" | "importmap" | "speculationrules" | "text/javascript";
  refererpolicy?:
    | "no-referrer"
    | "no-referrer-when-downgrade"
    | "origin"
    | "origin-when-cross-origin"
    | "same-origin"
    | "strict-origin"
    | "strict-origin-when-cross-origin"
    | "unsafe-url";
  nonce?: string;
  nomodule?: boolean;
  integrity?: string;
  fetchpriority?: "high" | "low" | "auto";
  crossorigin?: "anonymous" | "use-credentials";
  blocking?: boolean;
  attributionsrc?: boolean | string;
  src?: string;
} & {
  src: string;
  defer: true;
} & {
  src: string;
  async: true;
};

export interface ExecuteScriptOptions extends DatastarEventOptions {
  [DatastarDatalineAutoRemove]?: boolean;
  [DatastarDatalineAttributes]?: ScriptAttributes;
}

export interface ExecuteScriptEvent {
  event: "datastar-execute-script";
  options: ExecuteScriptOptions;
  [DatastarDatalineScript]: string;
}

// SSE headers
export const sseHeaders = {
  "Cache-Control": "no-cache",
  "Connection": "keep-alive",
  "Content-Type": "text/event-stream",
} as const;

// Type unions
export type MultilineDatalinePrefix =
  | typeof DatastarDatalineScript
  | typeof DatastarDatalineFragments
  | typeof DatastarDatalineSignals;

export type DatastarEventOptionsUnion =
  | MergeFragmentsOptions
  | FragmentOptions
  | MergeSignalsOptions
  | DatastarEventOptions
  | ExecuteScriptOptions;

export type DatastarEvent =
  | MergeFragmentsEvent
  | RemoveFragmentsEvent
  | MergeSignalsEvent
  | RemoveSignalsEvent
  | ExecuteScriptEvent; 