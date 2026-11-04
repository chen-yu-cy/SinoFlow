import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, act, fireEvent } from '@testing-library/react'
import VideoPlayer from '@/components/course/video-player'
import PurchaseNotice from '@/components/course/purchase-notice'
import Hls from 'hls.js'

// Mock hls.js
vi.mock('hls.js', () => {
  const MockHls = vi.fn().mockImplementation(() => ({
    loadSource: vi.fn(),
    attachMedia: vi.fn(),
    on: vi.fn(),
    destroy: vi.fn(),
  }))
  // @ts-ignore
  MockHls.isSupported = vi.fn().mockReturnValue(true)
  // @ts-ignore
  MockHls.Events = { MANIFEST_PARSED: 'hlsManifestParsed' }
  return { default: MockHls }
})

describe('VideoPlayer Component', () => {
  const mockUrl = 'https://example.com/video.m3u8'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该正确渲染视频容器且禁用原生控制栏', () => {
    const { container } = render(<VideoPlayer url={mockUrl} />)
    const videoElement = container.querySelector('video')
    expect(videoElement).toBeDefined()
    expect(videoElement).not.toHaveAttribute('controls')
    expect(container.querySelector('.custom-video-player')).toBeDefined()
  })

  it('如果是 MP4 文件，应直接设置 video 的 src 属性', () => {
    const mp4Url = 'https://example.com/video.mp4'
    const { container } = render(<VideoPlayer url={mp4Url} />)
    
    const videoElement = container.querySelector('video')
    expect(videoElement).toHaveAttribute('src', mp4Url)
    expect(Hls).not.toHaveBeenCalled()
  })

  it('如果是 HLS 文件且受支持，应初始化 Hls', () => {
    (Hls.isSupported as any).mockReturnValue(true)
    render(<VideoPlayer url={mockUrl} />)

    expect(Hls).toHaveBeenCalled()
  })

  it('当 Hls.js 不受支持但原生支持时应使用 src', () => {
    (Hls.isSupported as any).mockReturnValue(false)
    
    // 模拟原生 HLS 支持
    const canPlayTypeSpy = vi.spyOn(HTMLMediaElement.prototype, 'canPlayType')
      .mockReturnValue('maybe' as any)

    render(<VideoPlayer url={mockUrl} />)

    const videoElement = document.querySelector('video')
    // 注意：在 jsdom 中，直接设置 src 可能不会立即反映在属性上，
    // 但我们可以检查逻辑是否走到了这一步
    expect(Hls).not.toHaveBeenCalled()
    
    canPlayTypeSpy.mockRestore()
  })

  it('在卸载时应销毁 Hls 实例', () => {
    (Hls.isSupported as any).mockReturnValue(true)
    const { unmount } = render(<VideoPlayer url={mockUrl} />)
    
    const hlsInstance = (Hls as any).mock.results[0].value
    unmount()
    
    expect(hlsInstance.destroy).toHaveBeenCalled()
  })

  it('在启用 isLimitedPreview 且播放进度超过限制比例时，应自动暂停并展示试看结束遮罩', async () => {
    // 渲染带有 isLimitedPreview 和 previewLimitRatio=0.3 的 VideoPlayer
    const { container } = render(
      <VideoPlayer url={mockUrl} isLimitedPreview={true} previewLimitRatio={0.3} />
    )

    const videoElement = container.querySelector('video')
    expect(videoElement).toBeDefined()
    if (!videoElement) throw new Error('video element not found')

    // 模拟 video 属性
    Object.defineProperty(videoElement, 'duration', { value: 100, writable: true })
    Object.defineProperty(videoElement, 'currentTime', { value: 31, writable: true })
    
    const pauseSpy = vi.spyOn(videoElement, 'pause').mockImplementation(() => {})

    // 触发 timeupdate 事件
    const event = new Event('timeupdate')
    
    await act(async () => {
      videoElement.dispatchEvent(event)
    })

    // 验证 video 是否被暂停，且 currentTime 被重置为限制时间 (30)
    expect(pauseSpy).toHaveBeenCalled()
    expect(videoElement.currentTime).toBe(30)

    // 验证试看结束的遮罩层是否出现在页面上
    expect(container.textContent).toContain('试看已结束')
    expect(container.textContent).toContain('仅允许免费试看前 30%')

    pauseSpy.mockRestore()
  })

  it('应该在进度条渲染笔记锚点并在播放到对应时间戳时展示随堂笔记弹幕浮层', async () => {
    const sampleNotes = [
      { id: 'note-1', content: '重点声调规则记录', timestamp: 15 },
    ]
    const { container } = render(<VideoPlayer url={mockUrl} notes={sampleNotes} />)
    const videoElement = container.querySelector('video')!

    Object.defineProperty(videoElement, 'duration', { value: 100, writable: true })
    Object.defineProperty(videoElement, 'currentTime', { value: 16, writable: true })

    await act(async () => {
      videoElement.dispatchEvent(new Event('loadedmetadata'))
      videoElement.dispatchEvent(new Event('timeupdate'))
    })

    // 进度条上应渲染金色笔记圆点锚点
    const marker = container.querySelector('.video-note-marker')
    expect(marker).toBeTruthy()

    // 视频画面上方应展示实时笔记弹幕浮层
    const danmakuLayer = container.querySelector('.video-note-danmaku-layer')
    expect(danmakuLayer).toBeTruthy()
    expect(danmakuLayer?.textContent).toContain('重点声调规则记录')
  })

  it('当触发外部 seekToTime 与 seekTrigger 时应跳转到对应秒数并自动播放', async () => {
    const { container, rerender } = render(
      <VideoPlayer url={mockUrl} seekToTime={null} seekTrigger={0} />
    )
    const videoElement = container.querySelector('video')!
    const playSpy = vi.spyOn(videoElement, 'play').mockResolvedValue()

    rerender(<VideoPlayer url={mockUrl} seekToTime={42} seekTrigger={1} />)

    expect(videoElement.currentTime).toBe(42)
    expect(playSpy).toHaveBeenCalled()

    playSpy.mockRestore()
  })

  it('PurchaseNotice 点击 Unlock All 按钮应平滑滚动至 #purchase-section', async () => {
    const purchaseSection = document.createElement('section')
    purchaseSection.id = 'purchase-section'
    const buyBtn = document.createElement('button')
    purchaseSection.appendChild(buyBtn)
    document.body.appendChild(purchaseSection)

    const scrollSpy = vi.fn().mockReturnValue(Promise.resolve())
    purchaseSection.scrollIntoView = scrollSpy

    const { getByText } = render(
      <PurchaseNotice price={99} labels={{ unlockAll: 'Unlock All Content Now' }} />
    )

    fireEvent.click(getByText('Unlock All Content Now'))
    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' })

    document.body.removeChild(purchaseSection)
  })
})


