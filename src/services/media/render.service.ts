import { FFmpegService } from './ffmpeg.service';
import { VideoProcessingParams, RenderSettings, RenderProgress, QualityPreset, VideoFormatPreset } from './types';
import { ServiceResponse } from '../types';
import { RenderWebSocketService } from './websocket.service';

const QUALITY_PRESETS: Record<string, QualityPreset> = {
	web: {
		name: 'web',
		resolution: { width: 1280, height: 720 },
		fps: 30,
		videoBitrate: '2500k',
		audioBitrate: '128k',
		twoPass: false
	},
	mobile: {
		name: 'mobile',
		resolution: { width: 1080, height: 1080 },
		fps: 30,
		videoBitrate: '2000k',
		audioBitrate: '128k',
		twoPass: false
	},
	hd: {
		name: 'hd',
		resolution: { width: 1920, height: 1080 },
		fps: 60,
		videoBitrate: '6000k',
		audioBitrate: '192k',
		twoPass: true
	},
	'4k': {
		name: '4k',
		resolution: { width: 3840, height: 2160 },
		fps: 60,
		videoBitrate: '15000k',
		audioBitrate: '320k',
		twoPass: true
	}
};

const FORMAT_PRESETS: Record<string, VideoFormatPreset> = {
	web: {
		format: 'mp4',
		codec: 'h264',
		quality: 'high',
		bitrateRange: { min: 2000, max: 4000 },
		audioCodec: 'aac',
		audioBitrate: '128k'
	},
	social: {
		format: 'mp4',
		codec: 'h264',
		quality: 'high',
		bitrateRange: { min: 3000, max: 6000 },
		audioCodec: 'aac',
		audioBitrate: '192k'
	},
	archive: {
		format: 'mov',
		codec: 'h265',
		quality: 'ultra',
		bitrateRange: { min: 8000, max: 20000 },
		audioCodec: 'aac',
		audioBitrate: '320k'
	}
};

interface RenderSegment {
	startTime: number;
	endTime: number;
	input: string;
	settings: VideoProcessingParams;
}

export class RenderService {
	private ffmpegService: FFmpegService;
	private wsService: RenderWebSocketService;
	private projectId: string;
	private currentSegment: number = 0;
	private totalSegments: number = 0;

	constructor(projectId: string) {
		this.projectId = projectId;
		this.wsService = RenderWebSocketService.getInstance();
		this.ffmpegService = new FFmpegService(this.handleSegmentProgress.bind(this));
	}

	private handleSegmentProgress(segmentProgress: number) {
		if (!this.currentSegment || !this.totalSegments) return;
		
		const progress: RenderProgress = {
			segment: this.currentSegment,
			totalSegments: this.totalSegments,
			segmentProgress,
			totalProgress: ((this.currentSegment - 1) + segmentProgress) / this.totalSegments
		};

		this.wsService.updateProgress(this.projectId, progress);

	}

	public getQualityPreset(name: string): QualityPreset | undefined {
		return QUALITY_PRESETS[name];
	}

	public getFormatPreset(name: string): VideoFormatPreset | undefined {
		return FORMAT_PRESETS[name];
	}

	public async renderProject(
		segments: RenderSegment[],
		settings: RenderSettings
	): Promise<ServiceResponse<Uint8Array>> {
		try {
			this.totalSegments = segments.length;
			const processedSegments: Uint8Array[] = [];

			// Apply quality and format presets if specified by name
			if (typeof settings.qualityPreset === 'string') {
				settings.qualityPreset = this.getQualityPreset(settings.qualityPreset);
			}
			if (typeof settings.format === 'string') {
				settings.format = this.getFormatPreset(settings.format);
			}

			// Process segments in parallel if enabled
			if (settings.parallelProcessing) {
				const batchSize = 2;
				for (let i = 0; i < segments.length; i += batchSize) {
					const batch = segments.slice(i, i + batchSize);
					const promises = batch.map((segment, index) => {
						this.currentSegment = i + index + 1;
						return this.ffmpegService.processVideo(segment.settings, settings);
					});

					const results = await Promise.all(promises);
					processedSegments.push(...results.filter(r => r.success && r.data).map(r => r.data!));
				}
			} else {
				for (let i = 0; i < segments.length; i++) {
					this.currentSegment = i + 1;
					const result = await this.ffmpegService.processVideo(segments[i].settings, settings);
					if (!result.success || !result.data) {
						throw new Error(`Failed to process segment ${i + 1}`);
					}
					processedSegments.push(result.data);
				}
			}

			// Concatenate all segments
			const finalVideo = await this.concatenateSegments(processedSegments, settings);
			
			this.wsService.sendComplete(this.projectId, 'video-url-here');
			return {
				success: true,
				data: finalVideo
			};
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
			this.wsService.sendError(this.projectId, errorMessage);
			return {
				success: false,
				error: errorMessage
			};
		}
	}

	private async concatenateSegments(
		segments: Uint8Array[],
		settings: RenderSettings
	): Promise<Uint8Array> {
		// Write segments to temporary files
		for (let i = 0; i < segments.length; i++) {
			await this.ffmpegService.ffmpeg.writeFile(`segment_${i}`, segments[i]);
		}

		// Create concat file
		const concatContent = segments
			.map((_, i) => `file segment_${i}`)
			.join('\n');
		await this.ffmpegService.ffmpeg.writeFile('concat.txt', concatContent);

		// Concatenate using FFmpeg
		await this.ffmpegService.ffmpeg.exec([
			'-f', 'concat',
			'-safe', '0',
			'-i', 'concat.txt',
			'-c', 'copy',
			'output.mp4'
		]);

		return await this.ffmpegService.ffmpeg.readFile('output.mp4') as Uint8Array;
	}

	public getOptimizedSettings(quality: 'low' | 'medium' | 'high'): RenderSettings {
		switch (quality) {
			case 'high':
				return {
					hardwareAcceleration: true,
					parallelProcessing: true,
					priorityLevel: 'high'
				};
			case 'medium':
				return {
					hardwareAcceleration: true,
					parallelProcessing: false,
					priorityLevel: 'medium'
				};
			case 'low':
				return {
					hardwareAcceleration: false,
					parallelProcessing: false,
					priorityLevel: 'low'
				};
		}
	}
}