"use client";

import { useState } from "react";
import Ajv from "ajv";
import { TextArea } from "@/components/TextArea";
import { ToolPanel } from "@/components/ToolLayout";
import { ToolGrid } from "@/components/ToolLayout";

const EXAMPLE_SCHEMA = JSON.stringify(
  {
    type: "object",
    properties: {
      name: { type: "string", minLength: 1 },
      age: { type: "integer", minimum: 0 },
      email: { type: "string", format: "email" },
    },
    required: ["name", "age"],
    additionalProperties: false,
  },
  null,
  2
);

const EXAMPLE_DATA = JSON.stringify(
  {
    name: "Alice",
    age: 30,
    email: "alice@example.com",
  },
  null,
  2
);

export default function JsonSchemaValidator() {
  const [data, setData] = useState("");
  const [schema, setSchema] = useState("");
  const [valid, setValid] = useState<boolean | null>(null);
  const [errors, setErrors] = useState<{ path: string; message: string }[]>([]);
  const [parseError, setParseError] = useState("");

  const btnClass =
    "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 transition-opacity";

  const handleValidate = () => {
    try {
      const jsonData = JSON.parse(data);
      const jsonSchema = JSON.parse(schema);
      const ajv = new Ajv({ allErrors: true });
      const validate = ajv.compile(jsonSchema);
      const isValid = validate(jsonData);
      setValid(isValid as boolean);
      if (!isValid && validate.errors) {
        setErrors(
          validate.errors.map((err) => ({
            path: err.instancePath || "/",
            message: err.message || "Unknown error",
          }))
        );
      } else {
        setErrors([]);
      }
      setParseError("");
    } catch (e) {
      setParseError((e as Error).message);
      setValid(null);
      setErrors([]);
    }
  };

  const handleLoadExample = () => {
    setData(EXAMPLE_DATA);
    setSchema(EXAMPLE_SCHEMA);
    setValid(null);
    setErrors([]);
    setParseError("");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <button type="button" className={btnClass} onClick={handleValidate}>
          Validate
        </button>
        <button
          type="button"
          className="rounded-md bg-muted px-3 py-1.5 text-sm text-foreground hover:bg-border"
          onClick={handleLoadExample}
        >
          Load Example
        </button>
      </div>

      <ToolGrid>
        <ToolPanel title="JSON Data">
          <TextArea
            value={data}
            onChange={setData}
            placeholder='{"name": "Alice", "age": 30}'
            rows={12}
          />
        </ToolPanel>
        <ToolPanel title="JSON Schema">
          <TextArea
            value={schema}
            onChange={setSchema}
            placeholder='{"type": "object", "properties": {...}, "required": [...]}'
            rows={12}
          />
        </ToolPanel>
      </ToolGrid>

      {parseError && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          Parse Error: {parseError}
        </div>
      )}

      {valid !== null && (
        <ToolPanel title="Validation Result">
          {valid ? (
            <div className="rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400">
              Valid - JSON data matches the schema.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
                Invalid - {errors.length} error{errors.length !== 1 ? "s" : ""} found.
              </div>
              <div className="max-h-[300px] overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="px-3 py-2">Path</th>
                      <th className="px-3 py-2">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {errors.map((err, i) => (
                      <tr key={i} className="border-b border-border">
                        <td className="px-3 py-2 font-mono text-foreground">{err.path}</td>
                        <td className="px-3 py-2 text-foreground">{err.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </ToolPanel>
      )}
    </div>
  );
}
