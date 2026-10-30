// FILE: src/lib/i18n.ts
import { cookies } from "next/headers";
import zh from "@/locales/zh.json";
import en from "@/locales/en.json";
import es from "@/locales/es.json";

const dictionaries = { zh, en, es };

export type Locale = "zh" | "en" | "es";

/**
 * 在服务端获取当前活跃语言
 */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "zh";
  if (locale === "en") return "en";
  if (locale === "es") return "es";
  return "zh";
}

/**
 * 在服务端获取翻译器方法及字典数据
 */
export async function getTranslation() {
  const locale = await getLocale();
  const dict = dictionaries[locale] || zh;

  const t = (key: string, replacements?: Record<string, string | number>) => {
    // 支持嵌套点语法 "nav.home"
    let value = key.split('.').reduce((obj, k) => (obj as any)?.[k], dict) as string || key;
    
    // 支持占位符替换，如 "{name}"
    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        value = value.replace(new RegExp(`{${k}}`, 'g'), String(v));
      });
    }
    return value;
  };

  return { t, locale, dict };
}
