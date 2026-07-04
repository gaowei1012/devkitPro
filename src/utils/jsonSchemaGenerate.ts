import jsonSchemaGenerator from 'json-schema-generator';

export interface SchemaGenerateOptions {
  required?: boolean;
  enum?: boolean;
  description?: boolean;
}

function humanizeKey(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function applyEnumAndDescription(
  json: unknown,
  schema: Record<string, unknown>,
  options: SchemaGenerateOptions
): void {
  if (json === null || json === undefined) return;

  if (Array.isArray(json) && schema.items && typeof schema.items === 'object') {
    const itemSchema = schema.items as Record<string, unknown>;
    if (json.length > 0) {
      applyEnumAndDescription(json[0], itemSchema, options);
    }
    return;
  }

  if (typeof json !== 'object' || json === null) {
    if (options.enum && typeof json !== 'object') {
      schema.enum = [json];
    }
    return;
  }

  const props = schema.properties as Record<string, Record<string, unknown>> | undefined;
  if (!props) return;

  for (const [key, value] of Object.entries(json as Record<string, unknown>)) {
    const propSchema = props[key];
    if (!propSchema) continue;

    if (options.description) {
      propSchema.description = humanizeKey(key);
    }

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      applyEnumAndDescription(value, propSchema, options);
    } else if (Array.isArray(value)) {
      applyEnumAndDescription(value, propSchema, options);
    } else if (options.enum) {
      propSchema.enum = [value];
    }
  }
}

function stripRequired(schema: Record<string, unknown>): void {
  delete schema.required;
  const props = schema.properties as Record<string, Record<string, unknown>> | undefined;
  if (props) {
    for (const prop of Object.values(props)) {
      stripRequired(prop);
      const items = prop.items as Record<string, unknown> | undefined;
      if (items) stripRequired(items);
    }
  }
  const items = schema.items as Record<string, unknown> | undefined;
  if (items) stripRequired(items);
}

/** Wrapper around json-schema-generator with configurable post-processing. */
export function generate(
  jsonData: unknown,
  options: SchemaGenerateOptions = {}
): Record<string, unknown> {
  const { required = true, enum: useEnum = true, description = true } = options;
  const schema = jsonSchemaGenerator(jsonData) as Record<string, unknown>;

  schema.$schema = 'http://json-schema.org/draft-07/schema#';

  if (!required) {
    stripRequired(schema);
  }

  if (useEnum || description) {
    applyEnumAndDescription(jsonData, schema, { enum: useEnum, description });
  }

  return schema;
}
