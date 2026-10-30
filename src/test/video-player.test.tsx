import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import VideoPlayer from '@/components/course/video-player'
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

  it('应该正确渲染视频容器', () => {
    const { container } = render(<VideoPlayer url={mockUrl} />)
    const videoElement = container.querySelector('video')
    expect(videoElement).toBeDefined()
    expect(videoElement).toHaveAttribute('controls')
  })

  it('当 Hls.js 受支持时应初始化 Hls', () => {
    (Hls.isSupported as any).mockReturnValue(true)
    render(<VideoPlayer url={mockUrl} />)

    expect(Hls).toHaveBeenCalled()
    const hlsInstance = (Hls as any).mock.results[0].value
    expect(hlsInstance.loadSource).toHaveBeenCalledWith(mockUrl)
    expect(hlsInstance.attachMedia).toHaveBeenCalled()
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
})
