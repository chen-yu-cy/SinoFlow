// FILE: src/lib/actions/locale.ts
"use server";

import { cookies } from "next/headers";

/**
 * 设置当前选择语言 Cookie
 * @param locale 选中的语言，如 'zh' 或 'en'
 */
export async function setLocaleAction(locale: string) {
  const cookieStore = await cookies();
  cookieStore.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1年有效
    httpOnly: true,
    sameSite: "lax",
  });
}
