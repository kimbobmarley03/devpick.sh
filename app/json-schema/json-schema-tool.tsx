"use client";

import { useWebMCP } from "@/lib/use-webmcp";

import { useState, useCallback } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { SplitPane } from "@/components/split-pane";
import { AlertCircle, CheckCircle2, Trash2 } from "lucide-react";

interface ValidationError {
  path: string;
  message: string;
}

// Basic JSON Schema draft-07 validator (no deps)
function validateSchema(data: unknown, schema: Record<string, unknown>, path = "#"): ValidationError[] {
  const errors: ValidationError[] = [];

  if (schema.type !== undefined) {
    const expectedTypes = Array.isArray(schema.type) ? schema.type : [schema.type];
    const actualType = getType(data);
    if (!expectedTypes.includes(actualType)) {
      errors.push({ path, message: `Expected type "${expectedTypes.join(" | ")}", got "${actualType}"` });
      return errors; // can't validate further if wrong type
    }
  }

  // Enum
  if (Array.isArray(schema.enum)) {
    const inEnum = (schema.enum as unknown[]).some((v) => JSON.stringify(v) === JSON.stringify(data));
    if (!inEnum) {
      errors.push({ path, message: `Value must be one of: ${(schema.enum as unknown[]).map((v) => JSON.stringify(v)).join(", ")}` });
    }
  }

  // Const
  if ("const" in schema && JSON.stringify(schema.const) !== JSON.stringify(data)) {
    errors.push({ path, message: `Value must equal ${JSON.stringify(schema.const)}` });
  }

  // String validations
  if (typeof data === "string") {
    if (typeof schema.minLength === "number" && data.length < schema.minLength) {
      errors.push({ path, message: `String too short (${data.length} < ${schema.minLength})` });
    }
    if (typeof schema.maxLength === "number" && data.length > schema.maxLength) {
      errors.push({ path, message: `String too long (${data.length} > ${schema.maxLength})` });
    }
    if (typeof schema.pattern === "string") {
      try {
        const re = new RegExp(schema.pattern);
        if (!re.test(data)) {
          errors.push({ path, message: `String does not match pattern: ${schema.pattern}` });
        }
      } catch {
        errors.push({ path, message: `Invalid regex pattern: ${schema.pattern}` });
      }
    }
    if (schema.format === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data)) {
      errors.push({ path, message: `Invalid email format` });
    }
    if (schema.format === "uri" && !/^https?:\/\/.+/.test(data)) {
      errors.push({ path, message: `Invalid URI format` });
    }
    if (schema.format === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      errors.push({ path, message: `Invalid date format (expected YYYY-MM-DD)` });
    }
  }

  // Number validations
  if (typeof data === "number") {
    if (typeof schema.minimum === "number" && data < schema.minimum) {
      errors.push({ path, message: `Value ${data} < minimum ${schema.minimum}` });
    }
    if (typeof schema.maximum === "number" && data > schema.maximum) {
      errors.push({ path, message: `Value ${data} > maximum ${schema.maximum}` });
    }
    if (typeof schema.exclusiveMinimum === "number" && data <= schema.exclusiveMinimum) {
      errors.push({ path, message: `Value ${data} must be > ${schema.exclusiveMinimum}` });
    }
    if (typeof schema.exclusiveMaximum === "number" && data >= schema.exclusiveMaximum) {
      errors.push({ path, message: `Value ${data} must be < ${schema.exclusiveMaximum}` });
    }
    if (typeof schema.multipleOf === "number" && data % schema.multipleOf !== 0) {
      errors.push({ path, message: `Value must be a multiple of ${schema.multipleOf}` });
    }
  }

  // Object validations
  if (data !== null && typeof data === "object" && !Array.isArray(data)) {
    const obj = data as Record<string, unknown>;

    // required
    if (Array.isArray(schema.required)) {
      for (const key of schema.required as string[]) {
        if (!(key in obj)) {
          errors.push({ path: `${path}.${key}`, message: `Required property "${key}" is missing` });
        }
      }
    }

    // properties
    if (schema.properties && typeof schema.properties === "object") {
      const props = schema.properties as Record<string, Record<string, unknown>>;
      for (const [key, subSchema] of Object.entries(props)) {
        if (key in obj) {
          errors.push(...validateSchema(obj[key], subSchema, `${path}.${key}`));
        }
      }
    }

    // additionalProperties: false
    if (schema.additionalProperties === false && schema.properties) {
      const allowedKeys = Object.keys(schema.properties as object);
      for (const key of Object.keys(obj)) {
        if (!allowedKeys.includes(key)) {
          errors.push({ path: `${path}.${key}`, message: `Additional property "${key}" is not allowed` });
        }
      }
    }

    // minProperties / maxProperties
    const propCount = Object.keys(obj).length;
    if (typeof schema.minProperties === "number" && propCount < schema.minProperties) {
      errors.push({ path, message: `Object has too few properties (${propCount} < ${schema.minProperties})` });
    }
    if (typeof schema.maxProperties === "number" && propCount > schema.maxProperties) {
      errors.push({ path, message: `Object has too many properties (${propCount} > ${schema.maxProperties})` });
    }
  }

  // Array validations
  if (Array.isArray(data)) {
    if (typeof schema.minItems === "number" && data.length < schema.minItems) {
      errors.push({ path, message: `Array too short (${data.length} < ${schema.minItems})` });
    }
    if (typeof schema.maxItems === "number" && data.length > schema.maxItems) {
      errors.push({ path, message: `Array too long (${data.length} > ${schema.maxItems})` });
    }
    if (schema.uniqueItems === true) {
      const seen = new Set<string>();
      for (let i = 0; i < data.length; i++) {
        const key = JSON.stringify(data[i]);
        if (seen.has(key)) {
          errors.push({ path: `${path}[${i}]`, message: `Duplicate item at index ${i}` });
        }
        seen.add(key);
      }
    }
    if (schema.items && typeof schema.items === "object" && !Array.isArray(schema.items)) {
      const itemSchema = schema.items as Record<string, unknown>;
      data.forEach((item, i) => {
        errors.push(...validateSchema(item, itemSchema, `${path}[${i}]`));
      });
    }
  }

  // allOf, anyOf, oneOf
  if (Array.isArray(schema.allOf)) {
    for (const subSchema of schema.allOf as Record<string, unknown>[]) {
      errors.push(...validateSchema(data, subSchema, path));
    }
  }
  if (Array.isArray(schema.anyOf)) {
    const anyValid = (schema.anyOf as Record<string, unknown>[]).some(
      (s) => validateSchema(data, s, path).length === 0
    );
    if (!anyValid) {
      errors.push({ path, message: "Value must match at least one of the anyOf schemas" });
    }
  }
  if (Array.isArray(schema.oneOf)) {
    const matchCount = (schema.oneOf as Record<string, unknown>[]).filter(
      (s) => validateSchema(data, s, path).length === 0
    ).length;
    if (matchCount !== 1) {
      errors.push({ path, message: `Value must match exactly one oneOf schema (matched ${matchCount})` });
    }
  }

  return errors;
}

function getType(val: unknown): string {
  if (val === null) return "null";
  if (Array.isArray(val)) return "array";
  return typeof val;
}

const SAMPLE_JSON = `{
  "name": "Alice",
  "age": 30,
  "email": "alice@example.com",
  "tags": ["developer", "designer"]
}`;

const SAMPLE_SCHEMA = `{
  "type": "object",
  "required": ["name", "age", "email"],
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1
    },
    "age": {
      "type": "number",
      "minimum": 0,
      "maximum": 150
    },
    "email": {
      "type": "string",
      "format": "email"
    },
    "tags": {
      "type": "array",
      "items": { "type": "string" },
      "uniqueItems": true
    }
  },
  "additionalProperties": false
}`;

export function JsonSchemaTool() {
  useWebMCP({
    name: "validateJsonSchema",
    description: "Validate JSON against a JSON Schema",
    inputSchema: {
      type: "object" as const,
      properties: {
      "json": {
            "type": "string",
            "description": "JSON to validate"
      },
      "schema": {
            "type": "string",
            "description": "JSON Schema"
      }
},
      required: ["json", "schema"],
    },
    execute: async (params) => {
      return { content: [{ type: "text", text: "Use the web UI for schema validation" }] };
    },
  });

  const [jsonInput, setJsonInput] = useState(SAMPLE_JSON);
  const [schemaInput, setSchemaInput] = useState(SAMPLE_SCHEMA);

  const result = useCallback(() => {
    if (!jsonInput.trim() || !schemaInput.trim()) return null;

    let data: unknown;
    let schema: Record<string, unknown>;

    try {
      data = JSON.parse(jsonInput);
    } catch (e) {
      return { type: "json-error" as const, message: `JSON parse error: ${e instanceof Error ? e.message : "Invalid JSON"}` };
    }

    try {
      schema = JSON.parse(schemaInput);
    } catch (e) {
      return { type: "schema-error" as const, message: `Schema parse error: ${e instanceof Error ? e.message : "Invalid JSON"}` };
    }

    const errors = validateSchema(data, schema);
    return { type: "validation" as const, errors };
  }, [jsonInput, schemaInput])();

  const isValid = result?.type === "validation" && result.errors.length === 0;

  return (
    <ToolLayout agentReady
      title="JSON Schema Validator"
      description="Validate JSON data against a JSON Schema (draft-07) — type checking, required fields, patterns, min/max, enum"
    >
      {/* Status banner */}
      {result && (
        <div
          className={`mb-4 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium ${
            isValid
              ? "bg-success/10 border border-success/20 text-success"
              : "bg-error/10 border border-error/20 text-error"
          }`}
        >
          {isValid ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {result.type === "json-error" && result.message}
          {result.type === "schema-error" && result.message}
          {result.type === "validation" && (
            isValid
              ? "✓ Valid — JSON matches the schema"
              : `✗ Invalid — ${result.errors.length} error${result.errors.length !== 1 ? "s" : ""} found`
          )}
        </div>
      )}

      <SplitPane
        left={
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-1">
              <div className="pane-label">JSON Data</div>
              <button onClick={() => setJsonInput("")} className="action-btn" style={{ fontSize: "11px", padding: "2px 8px" }}>
                <Trash2 size={11} />
                Clear
              </button>
            </div>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='{"key": "value"}'
              className="tool-textarea flex-1"
              spellCheck={false}
            />
          </div>
        }
        right={
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-1">
              <div className="pane-label">JSON Schema</div>
              <button onClick={() => setSchemaInput("")} className="action-btn" style={{ fontSize: "11px", padding: "2px 8px" }}>
                <Trash2 size={11} />
                Clear
              </button>
            </div>
            <textarea
              value={schemaInput}
              onChange={(e) => setSchemaInput(e.target.value)}
              placeholder='{"type": "object", ...}'
              className="tool-textarea flex-1"
              spellCheck={false}
            />
          </div>
        }
      />

      {/* Error list */}
      {result?.type === "validation" && result.errors.length > 0 && (
        <div className="mt-4 space-y-2">
          <h3 className="text-sm font-semibold text-error mb-2">Validation Errors</h3>
          {result.errors.map((err, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3 bg-error/5 border border-error/20 rounded-lg">
              <AlertCircle size={14} className="text-error mt-0.5 shrink-0" />
              <div>
                <span className="font-mono text-xs text-accent">{err.path}</span>
                <p className="text-sm text-text-secondary mt-0.5">{err.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 p-3 bg-[var(--dp-bg-subtle)] rounded-lg text-xs text-text-dimmed">
        <strong className="text-text-secondary">Supported:</strong>{" "}
        type, required, properties, additionalProperties, enum, const, format (email, uri, date),
        minLength, maxLength, pattern, minimum, maximum, exclusiveMinimum, exclusiveMaximum, multipleOf,
        minProperties, maxProperties, minItems, maxItems, uniqueItems, items, allOf, anyOf, oneOf
      </div>

      {/* Related Tools */}
      <div className="mt-8 pt-6 border-t border-border-subtle">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "JSON Formatter", href: "/json-formatter" },
            { name: "JSONPath Tester", href: "/jsonpath" },
            { name: "JSON → TypeScript", href: "/json-to-ts" },
            { name: "YAML to JSON", href: "/yaml-formatter" },
          ].map((t) => (
            <a key={t.href} href={t.href} className="text-xs text-accent hover:underline px-2 py-1 rounded bg-[var(--dp-bg-subtle)]">
              {t.name}
            </a>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
