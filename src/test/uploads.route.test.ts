// FILE: src/test/uploads.route.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, OPTIONS } from '@/app/uploads/[...path]/route'
import { NextRequest } from 'next/server'
import fs from 'fs'

vi.mock('fs', () => {
  const existsSync = vi.fn()
  const statSync = vi.fn()
  const createReadStream = vi.fn()
  return {
    default: {
      existsSync,
      statSync,
      createReadStream,
    },
    existsSync,
    statSync,
    createReadStream,
  };
})

describe('Uploads Route Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该拒绝非法的 path 或空 slug', async () => {
    const req = new NextRequest('http://localhost/uploads')
    const response = await GET(req, { params: Promise.resolve({ path: [] }) })
    expect(response.status).toBe(400)
  })

  it('应该防范路径穿越攻击返回 403', async () => {
    const req = new NextRequest('http://localhost/uploads/../secret.txt')
    const response = await GET(req, { params: Promise.resolve({ path: ['..', 'secret.txt'] }) })
    expect(response.status).toBe(403)
  })

  it('应该对不存在的文件返回 404', async () => {
    (fs.existsSync as ReturnType<typeof vi.fn>).mockReturnValue(false)
    const req = new NextRequest('http://localhost/uploads/missing.jpg')
    const response = await GET(req, { params: Promise.resolve({ path: ['missing.jpg'] }) })
    expect(response.status).toBe(404)
  })

  it('应该成功返回文件的 stream 且设置正确头部', async () => {
    (fs.existsSync as ReturnType<typeof vi.fn>).mockReturnValue(true);
    (fs.statSync as ReturnType<typeof vi.fn>).mockReturnValue({
      isFile: () => true,
      size: 1000,
    });
    const mockStream = {};
    (fs.createReadStream as ReturnType<typeof vi.fn>).mockReturnValue(mockStream);

    const req = new NextRequest('http://localhost/uploads/test.jpg')
    const response = await GET(req, { params: Promise.resolve({ path: ['test.jpg'] }) })

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('image/jpeg')
    expect(response.headers.get('Content-Length')).toBe('1000')
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=31536000, immutable')
    expect(fs.createReadStream).toHaveBeenCalled()
  })

  it('对于 MP4 视频支持 Range 分块传输且返回 206', async () => {
    (fs.existsSync as ReturnType<typeof vi.fn>).mockReturnValue(true);
    (fs.statSync as ReturnType<typeof vi.fn>).mockReturnValue({
      isFile: () => true,
      size: 10000,
    });
    const mockStream = {};
    (fs.createReadStream as ReturnType<typeof vi.fn>).mockReturnValue(mockStream);

    const req = new NextRequest('http://localhost/uploads/video.mp4', {
      headers: {
        'range': 'bytes=0-499'
      }
    })
    const response = await GET(req, { params: Promise.resolve({ path: ['video.mp4'] }) })

    expect(response.status).toBe(206)
    expect(response.headers.get('Content-Type')).toBe('video/mp4')
    expect(response.headers.get('Content-Range')).toBe('bytes 0-499/10000')
    expect(response.headers.get('Content-Length')).toBe('500')
    expect(fs.createReadStream).toHaveBeenCalledWith(expect.any(String), { start: 0, end: 499 })
  })

  it('对于 HLS 播放列表 .m3u8 文件应返回正确 Content-Type 与无缓存头部', async () => {
    (fs.existsSync as ReturnType<typeof vi.fn>).mockReturnValue(true);
    (fs.statSync as ReturnType<typeof vi.fn>).mockReturnValue({
      isFile: () => true,
      size: 200,
    });
    const mockStream = {};
    (fs.createReadStream as ReturnType<typeof vi.fn>).mockReturnValue(mockStream);

    const req = new NextRequest('http://localhost/uploads/videos/demo/index.m3u8')
    const response = await GET(req, { params: Promise.resolve({ path: ['videos', 'demo', 'index.m3u8'] }) })

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/vnd.apple.mpegurl')
    expect(response.headers.get('Cache-Control')).toContain('no-cache')
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
  })

  it('对于 HLS 切片 .ts 文件应返回 video/MP2T 与 CORS 头部', async () => {
    (fs.existsSync as ReturnType<typeof vi.fn>).mockReturnValue(true);
    (fs.statSync as ReturnType<typeof vi.fn>).mockReturnValue({
      isFile: () => true,
      size: 250000,
    });
    const mockStream = {};
    (fs.createReadStream as ReturnType<typeof vi.fn>).mockReturnValue(mockStream);

    const req = new NextRequest('http://localhost/uploads/videos/demo/seg-0.ts')
    const response = await GET(req, { params: Promise.resolve({ path: ['videos', 'demo', 'seg-0.ts'] }) })

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('video/MP2T')
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
  })

  it('OPTIONS 请求应正确返回 204 及 CORS 预检响应头', async () => {
    const response = await OPTIONS()
    expect(response.status).toBe(204)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET')
  })
})
