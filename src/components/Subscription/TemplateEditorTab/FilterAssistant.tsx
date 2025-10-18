export type FilterMode = "keyword" | "regex";

export interface FilterAssistantView {
  mode: FilterMode;
  keywords: string[];
  setMode: (mode: FilterMode) => void;
  addKeyword: (keyword: string) => void;
}

export function createFilterAssistant(): FilterAssistantView {
  const state = {
    mode: "keyword" as FilterMode,
    keywords: ["延迟", "高可用"],
  };

  return {
    get mode() {
      return state.mode;
    },
    get keywords() {
      return state.keywords;
    },
    setMode(mode: FilterMode) {
      state.mode = mode;
    },
    addKeyword(keyword: string) {
      state.keywords.push(keyword);
    },
  };
}
