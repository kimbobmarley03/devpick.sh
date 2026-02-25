/**
 * WebMCP (Web Model Context Protocol) integration for devpick.sh
 * Registers tools with navigator.modelContext when available (Chrome 146+)
 * https://developer.chrome.com/blog/webmcp-epp
 */

export interface WebMCPToolSchema {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, { type: string; description?: string; enum?: string[] }>;
    required?: string[];
  };
  execute: (params: Record<string, unknown>) => Promise<{ content: { type: string; text: string }[] }>;
}

// Extend Navigator type for WebMCP
declare global {
  interface Navigator {
    modelContext?: {
      registerTool: (tool: WebMCPToolSchema) => void;
    };
  }
}

/**
 * Register a tool with WebMCP if available in the browser.
 * Falls back silently if navigator.modelContext is not supported.
 */
export function registerWebMCPTool(tool: WebMCPToolSchema): boolean {
  if (typeof window !== "undefined" && navigator.modelContext?.registerTool) {
    try {
      navigator.modelContext.registerTool(tool);
      return true;
    } catch {
      // Silently fail — WebMCP not fully available
      return false;
    }
  }
  return false;
}
