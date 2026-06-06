import type { Messages } from '@/i18n/dictionaries';

export function getMessageValue(
  messages: Record<string, unknown>,
  path: string,
) {
  return path.split('.').reduce<unknown>((value, key) => {
    if (typeof value !== 'object' || value === null) {
      return undefined;
    }

    return (value as Record<string, unknown>)[key];
  }, messages);
}

export function translateMessage(messages: Messages, path: string) {
  const result = getMessageValue(messages as Record<string, unknown>, path);

  return typeof result === 'string' ? result : path;
}
