export function createConflictDialog(hasConflict) {
  if (!hasConflict) {
    return { messages: [], hasConflict: false };
  }
  return {
    messages: ["检测到外部变更，请重新加载模板后再保存"],
    hasConflict: true,
  };
}
