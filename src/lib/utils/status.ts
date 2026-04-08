const EVENT_STATUS_LABELS: Record<string, string> = {
  PLANNED: "Запланировано",
  COMPLETED: "Проведено",
  CANCELLED: "Отменено",
};

const INITIATIVE_STATUS_LABELS: Record<string, string> = {
  NEW: "Новая",
  UNDER_REVIEW: "На рассмотрении",
  ACCEPTED: "Принята",
  IN_PROGRESS: "В работе",
  IMPLEMENTED: "Реализована",
  REJECTED: "Отклонена",
  ARCHIVED: "Архив",
};

const PUBLICATION_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Черновик",
  SCHEDULED: "Запланировано",
  PUBLISHED: "Опубликовано",
  ARCHIVED: "Архив",
};

const ACCOUNT_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Активен",
  DISABLED: "Отключен",
};

const ADMIN_ROLE_LABELS: Record<string, string> = {
  CHIEF_ADMIN: "Администратор",
  ADMIN: "Президент",
  MINISTRY_EDITOR: "Министр",
  EDITOR: "Редактор",
  ANALYST: "Аналитик",
};

export function getEventStatusLabel(status: string): string {
  return EVENT_STATUS_LABELS[status] ?? status;
}

export function getInitiativeStatusLabel(status: string): string {
  return INITIATIVE_STATUS_LABELS[status] ?? status;
}

export function getPublicationStatusLabel(status: string): string {
  return PUBLICATION_STATUS_LABELS[status] ?? status;
}

export function getAccountStatusLabel(status: string): string {
  return ACCOUNT_STATUS_LABELS[status] ?? status;
}

export function getAdminRoleLabel(role: string): string {
  return ADMIN_ROLE_LABELS[role] ?? role;
}

