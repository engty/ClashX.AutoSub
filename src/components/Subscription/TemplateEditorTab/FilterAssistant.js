export function createFilterAssistant() {
  const state = {
    mode: "keyword",
    keywords: ["延迟", "高可用"],
  };

  return {
    get mode() {
      return state.mode;
    },
    get keywords() {
      return [...state.keywords];
    },
    setMode(mode) {
      state.mode = mode;
    },
    addKeyword(keyword) {
      state.keywords.push(keyword);
    },
  };
}
