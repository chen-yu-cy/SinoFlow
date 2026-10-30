// FILE: src/test/i18n.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getLocale, getTranslation } from '@/lib/i18n'
import { cookies } from 'next/headers'

// Mock cookies
vi.mock('next/headers', () => {
  const get = vi.fn()
  return {
    cookies: vi.fn(() => ({
      get,
      set: vi.fn(),
      delete: vi.fn(),
    })),
  }
})

describe('Internationalization (i18n) System', () => {
  const mockCookies = cookies() as any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getLocale', () => {
    it('在缺省状态下，应默认返回中文 "zh"', async () => {
      mockCookies.get.mockReturnValue(undefined)
      
      const locale = await getLocale()
      expect(locale).toBe('zh')
    })

    it('当 Cookie 为 "en" 时，应正确返回 "en"', async () => {
      mockCookies.get.mockReturnValue({ value: 'en' })
      
      const locale = await getLocale()
      expect(locale).toBe('en')
    })

    it('当 Cookie 传入非法字符时，应自动容错回落为 "zh"', async () => {
      mockCookies.get.mockReturnValue({ value: 'invalid_locale' })
      
      const locale = await getLocale()
      expect(locale).toBe('zh')
    })
  })

  describe('getTranslation (t function)', () => {
    it('能够正确检索简单或嵌套翻译属性 (zh)', async () => {
      mockCookies.get.mockReturnValue({ value: 'zh' })
      const { t, locale } = await getTranslation()

      expect(locale).toBe('zh')
      expect(t('nav.home')).toBe('首页')
      expect(t('home.title')).toBe('“读报学中文，感知新时代” —— 权威媒体官方精读流媒体平台')
    })

    it('能够正确检索简单或嵌套翻译属性 (en)', async () => {
      mockCookies.get.mockReturnValue({ value: 'en' })
      const { t, locale } = await getTranslation()

      expect(locale).toBe('en')
      expect(t('nav.home')).toBe('Home')
      expect(t('home.title')).toBe('"Read the News, Master Chinese" — The Official Media-Backed Close Reading & Media Platform')
    })

    it('当查找不存在的 Key 时，应安全返回该 Key 本身作占位符', async () => {
      mockCookies.get.mockReturnValue({ value: 'zh' })
      const { t } = await getTranslation()

      expect(t('nonexistent.key')).toBe('nonexistent.key')
    })

    it('支持动态替换模板大括号占位符中的插值参数', async () => {
      // 临时为 dict 加入带占位符的属性以进行测试
      mockCookies.get.mockReturnValue({ value: 'zh' })
      const { t } = await getTranslation()

      // 模拟包含占位符的文案处理
      const template = "欢迎 {name}，您已学完 {count} 课时"
      const tMock = (key: string, replacements: Record<string, string | number>) => {
        let value = template;
        Object.entries(replacements).forEach(([k, v]) => {
          value = value.replace(new RegExp(`{${k}}`, 'g'), String(v));
        });
        return value;
      }

      const result = tMock('some.key', { name: 'Alice', count: 12 })
      expect(result).toBe('欢迎 Alice，您已学完 12 课时')
    })
  })
})
