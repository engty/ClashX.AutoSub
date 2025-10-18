export interface ConflictDialogView {
  readonly messages: string[];
  readonly hasConflict: boolean;
}

export function createConflictDialog(hasConflict: boolean): ConflictDialogView {
  if (!hasConflict) {
    return { messages: [], hasConflict: false };
  }
  return {
    messages: ["检测到外部变更，请重新加载模板后再保存"],
    hasConflict: true,
  };
}
