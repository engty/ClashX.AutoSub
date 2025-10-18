export interface ProxyProvider {
  readonly name: string;
  readonly url: string;
}

export interface TemplateSnapshot {
  readonly id: string;
  readonly diff: Record<string, unknown>;
}
