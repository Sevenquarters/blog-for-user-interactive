import 'server-only';

import type { Locale } from '@/i18n/config';

import en from '@/messages/en.json';
import zhCN from '@/messages/zh-CN.json';

export type Messages = typeof en;

const dictionaries: Record<Locale, Messages> = {
  en,
  'zh-CN': zhCN,
};

export async function getMessages(locale: Locale) {
  return dictionaries[locale];
}
