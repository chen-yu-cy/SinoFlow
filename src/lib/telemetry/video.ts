// FILE: src/lib/telemetry/video.ts

export interface VideoTelemetryPayload {
  courseId?: string;
  lessonId?: string;
  bytesLoaded: number;
  fragmentsCount: number;
  durationSeconds?: number;
  sourceUrl?: string;
}

// 单次上报上限熔断：防伪造巨量数据冲击大盘（15秒内单次上限 100MB 与 100 切片）
export const MAX_BYTES_PER_REPORT = 100 * 1024 * 1024;
export const MAX_FRAGMENTS_PER_REPORT = 100;
