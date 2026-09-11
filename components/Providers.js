"use client";

import { LangProvider } from "@/lib/i18n";

export default function Providers({ children }) {
  return <LangProvider>{children}</LangProvider>;
}
