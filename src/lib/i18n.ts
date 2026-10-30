import { cookies, headers } from "next/headers";
import zh from "@/locales/zh.json";
import en from "@/locales/en.json";
import es from "@/locales/es.json";

const dictionaries = { zh, en, es };

export type Locale = "zh" | "en" | "es";

/**
 * 在服务端获取当前活跃语言 (优先读取 Cookie，无 Cookie 则探测浏览器 Accept-Language)
 */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value;
  
  if (locale === "en") return "en";
  if (locale === "es") return "es";
  if (locale === "zh") return "zh";

  try {
    const headersList = await headers();
    const acceptLang = headersList.get("accept-language") || "";
    
    // 解析，例如 "es-AR,es;q=0.9,en-US;q=0.8" -> ["es-ar", "es", "en-us"]
    const preferredLocales = acceptLang
      .split(",")
      .map((part) => {
        const [lang] = part.split(";");
        return lang.trim().toLowerCase();
      });

    for (const pref of preferredLocales) {
      if (pref.startsWith("es")) return "es";
      if (pref.startsWith("en")) return "en";
      if (pref.startsWith("zh")) return "zh";
    }
  } catch (err) {
    // 静态构建或一些脱机渲染场景防崩溃降级
  }

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
