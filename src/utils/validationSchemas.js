export const templateSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "ClashX.AutoSub Template",
  type: "object",
  properties: {
    "proxy-providers": { type: "object" },
    "proxy-groups": { type: "array" },
    rules: { type: "array" },
  },
  additionalProperties: true,
};
