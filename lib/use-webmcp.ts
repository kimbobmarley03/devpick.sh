"use client";

import { useEffect } from "react";
import type { WebMCPToolSchema } from "./webmcp";

/**
 * React hook to register a WebMCP tool on mount.
 * Only registers if navigator.modelContext is available (Chrome 146+).
 */
export function useWebMCP(tool: Omit<WebMCPToolSchema, "execute"> & {
  execute: (params: Record<string, unknown>) => Promise<{ content: { type: string; text: string }[] }>;
}) {
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.modelContext?.registerTool) {
      try {
        navigator.modelContext.registerTool(tool);
      } catch {
        // WebMCP not fully available
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
