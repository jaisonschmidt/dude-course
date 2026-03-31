import { z } from 'zod'
import type { ZodType } from 'zod'

/**
 * Converts a Zod schema to a JSON Schema compatible with Fastify's Ajv validator.
 *
 * Zod v4 `z.toJSONSchema()` produces draft/2020-12 schemas, but Fastify uses
 * Ajv with draft-07/draft-04. We strip the `$schema` property to avoid
 * "no schema with key or ref" errors at route registration time.
 */
export function zodToJsonSchema(schema: ZodType): Record<string, unknown> {
  const jsonSchema = z.toJSONSchema(schema) as Record<string, unknown>
  const { $schema: _, ...rest } = jsonSchema
  return rest
}
