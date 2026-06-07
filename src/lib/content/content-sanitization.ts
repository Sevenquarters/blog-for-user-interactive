function hasAllowedProtocol(value: string, allowedProtocols: string[]) {
  return allowedProtocols.some((protocol) => value.startsWith(protocol));
}

export function sanitizeContentHref(href: string | null | undefined) {
  if (!href) {
    return null;
  }

  const normalized = href.trim();

  if (!normalized) {
    return null;
  }

  if (
    normalized.startsWith('/') ||
    normalized.startsWith('#') ||
    hasAllowedProtocol(normalized, ['http://', 'https://', 'mailto:', 'tel:'])
  ) {
    return normalized;
  }

  return null;
}

export function sanitizeContentMediaSrc(src: string | null | undefined) {
  if (!src) {
    return null;
  }

  const normalized = src.trim();

  if (!normalized) {
    return null;
  }

  if (
    normalized.startsWith('/') ||
    hasAllowedProtocol(normalized, ['http://', 'https://'])
  ) {
    return normalized;
  }

  return null;
}

