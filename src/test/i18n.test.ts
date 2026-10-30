// FILE: src/test/i18n.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getLocale, getTranslation } from '@/lib/i18n'
import { cookies, headers } from 'next/headers'

// Mock cookies and headers
vi.mock('next/headers', () => {
  const get = vi.fn()
  const set = vi.fn()
  const headersGet = vi.fn()
  return {
    cookies: vi.fn(() => ({
      get,
      set,
      delete: vi.fn(),
    })),
    headers: vi.fn(async () => ({
      get: headersGet,
    })),
  }
})

describe('Internationalization (i18n) System', () => {
  const mockCookies = cookies() as any
  
  beforeEach(async () => {
    vi.clearAllMocks()
    // 默认 mockHeaders.get 返回 undefined
    const mockHeaders = await headers() as any
    mockHeaders.get.mockReturnValue(undefined)
  })

  describe('getLocale', () => {
    it('在缺省状态下，且没有 Accept-Language 头时，在测试环境应默认返回 "zh"', async () => {
      mockCookies.get.mockReturnValue(undefined)
      
      const locale = await getLocale()
      expect(locale).toBe('zh')
    })

    it('当 Cookie 为 "en" 时，应正确返回 "en"', async () => {
      mockCookies.get.mockReturnValue({ value: 'en' })
      
      const locale = await getLocale()
      expect(locale).toBe('en')
    })

    it('当 Cookie 为 "es" 时，应正确返回 "es"', async () => {
      mockCookies.get.mockReturnValue({ value: 'es' })
      
      const locale = await getLocale()
      expect(locale).toBe('es')
    })

    it('当 Cookie 传入非法字符时，应自动容错回落为 "zh" (测试环境)', async () => {
      mockCookies.get.mockReturnValue({ value: 'invalid_locale' })
      
      const locale = await getLocale()
      expect(locale).toBe('zh')
    })

    it('当无 Cookie 且 Accept-Language 请求头首选为西班牙语时，应自动探测返回 "es"', async () => {
      mockCookies.get.mockReturnValue(undefined)
      const mockHeaders = await headers() as any
      mockHeaders.get.mockReturnValue('es-AR,es;q=0.9,en-US;q=0.8')

      const locale = await getLocale()
      expect(locale).toBe('es')
    })

    it('当无 Cookie 且 Accept-Language 请求头首选为英语时，应自动探测返回 "en"', async () => {
      mockCookies.get.mockReturnValue(undefined)
      const mockHeaders = await headers() as any
      mockHeaders.get.mockReturnValue('en-US,en;q=0.8,zh-CN;q=0.6')

      const locale = await getLocale()
      expect(locale).toBe('en')
    })
  })

  describe('getTranslation (t function)', () => {
    it('能够正确检索简单或嵌套翻译属性 (zh)', async () => {
      mockCookies.get.mockReturnValue({ value: 'zh' })
      const { t, locale } = await getTranslation()

      expect(locale).toBe('zh')
      expect(t('nav.home')).toBe('首页')
      expect(t('home.title')).toBe('中文视频学习网站')
    })

    it('能够正确检索简单或嵌套翻译属性 (en)', async () => {
      mockCookies.get.mockReturnValue({ value: 'en' })
      const { t, locale } = await getTranslation()

      expect(locale).toBe('en')
      expect(t('nav.home')).toBe('Home')
      expect(t('home.title')).toBe('Chinese Video Learning Website')
    })

    it('能够正确检索简单或嵌套翻译属性 (es)', async () => {
      mockCookies.get.mockReturnValue({ value: 'es' })
      const { t, locale } = await getTranslation()

      expect(locale).toBe('es')
      expect(t('nav.home')).toBe('Inicio')
      expect(t('home.title')).toBe('Sitio de Aprendizaje de Chino por Video')
    })

    it('当查找不存在的 Key 时，应安全返回该 Key 本身作占位符', async () => {
      mockCookies.get.mockReturnValue({ value: 'zh' })
      const { t } = await getTranslation()

      expect(t('nonexistent.key')).toBe('nonexistent.key')
    })

    it('支持动态替换模板大括号占位符中的插值参数', async () => {
      mockCookies.get.mockReturnValue({ value: 'zh' })
      const { t } = await getTranslation()

      // 验证在 support.ticketNo (如：ID de ticket: {id} / 工单号: {id}) 上的替换逻辑
      const result = t('support.ticketNo', { id: 't-999' })
      expect(result).toBe('工单号: t-999')
    })
  })

  describe('setLocaleAction Server Action', () => {
    it('应该成功设置带有指定属性的语言 Cookie', async () => {
      const { setLocaleAction } = await import('@/lib/actions/locale')
      await setLocaleAction('es')

      expect(mockCookies.set).toHaveBeenCalledWith('NEXT_LOCALE', 'es', {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        httpOnly: true,
        sameSite: "lax",
      })
    })
  })
})
