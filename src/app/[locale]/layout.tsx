import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { SiteHeader } from '@/components/layout/site-header';
import { getMessages } from '@/i18n/dictionaries';
import { SUPPORTED_LOCALES, isSupportedLocale } from '@/i18n/config';
import { translateMessage } from '@/i18n/messages';
import { getActiveThemeDefinition } from '@/lib/db/themes';
import { AppProviders } from '@/providers/app-providers';

import '../globals.css';

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

type MetadataProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: MetadataProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    return {};
  }

  const messages = await getMessages(locale);

  return {
    title: translateMessage(messages, 'meta.title'),
    description: translateMessage(messages, 'meta.description'),
  };
}

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const messages = await getMessages(locale);
  const activeTheme = await getActiveThemeDefinition();

  return (
    <html lang={locale} suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="min-h-screen bg-[var(--theme-background)] text-[var(--theme-foreground)] antialiased">
        <AppProviders
          locale={locale}
          messages={messages}
          initialTheme={activeTheme}
        >
          <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.18),_transparent_42%),linear-gradient(180deg,_rgba(255,255,255,0.96)_0%,_rgba(254,243,199,0.42)_100%)]">
            <SiteHeader />
            <main className="mx-auto flex w-full max-w-6xl flex-1 px-4 pt-10 pb-16 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
