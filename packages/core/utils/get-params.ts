import type { z } from 'zod';
export type SearchParams = Record<string, string | null | number>;
export type ParamValue = string | string[] | undefined;
export type Params = Record<string, ParamValue>;
type ParamsInput = Params | string | number | null;
async function schemaResultAsync<T extends z.ZodTypeAny>(
  data: Promise<unknown> | unknown,
  schema: T
) {
  return schema.parse(
    data instanceof Promise ? await data : data
  ) as z.infer<T>;
}

export async function getParamsStrict<T extends z.ZodTypeAny>(
  params: Promise<ParamsInput>,
  schema: T
) {
  return schemaResultAsync(params, schema);
}
export async function getSearchParams<T extends z.AnyZodObject>(
  searchParams: Promise<SearchParams>,
  schema: T
) {
  return schemaResultAsync(searchParams, schema);
}
