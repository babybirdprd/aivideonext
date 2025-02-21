import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { 
	VideoProcessingParams, 
	AudioProcessingParams,
	RenderSettings
} from './types';
import { ServiceResponse, ServiceMetrics } from '../types';

export class FFmpegService {
	private ffmpeg: FFmpeg;
	private metrics: ServiceMetrics;
	private initialized: boolean = false;

	constructor() {
		this.ffmpeg = new FFmpeg();
		this.metrics = {
			startTime: 0,
			endTime: 0,
		};
	}

	private async init() {
		if (!this.initialized) {
			const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
			await this.ffmpeg.load({
				coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
				wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
			});
			this.initialized = true;
		}
	}

	private startMetrics() {
		this.metrics.startTime = Date.now();
	}

	private endMetrics() {
		this.metrics.endTime = Date.now();
		this.metrics.processingTime = this.metrics.endTime - this.metrics.startTime;
	}

	public async processVideo(params: VideoProcessingParams): Promise<ServiceResponse<Uint8Array>> {
		try {
			await this.init();
			this.startMetrics();

			const inputFile = await fetchFile(params.input);
			await this.ffmpeg.writeFile('input', inputFile);

			let command = ['-i', 'input'];
			
			if (params.resolution) {
				const scale = params.resolution === '4k' ? '3840:-1' : 
										 params.resolution === '1080p' ? '1920:-1' : '1280:-1';
				command.push('-vf', `scale=${scale}`);
			}

			if (params.fps) {
				command.push('-r', params.fps.toString());
			}

			if (params.quality) {
				command.push('-crf', Math.floor(51 - (params.quality / 2)).toString());
			}

			command.push('-c:v', 'libx264', '-preset', 'medium', 'output.mp4');

			await this.ffmpeg.exec(command);
			const data = await this.ffmpeg.readFile('output.mp4') as Uint8Array;
			
			this.endMetrics();

			return {
				success: true,
				data: data,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error occurred',
			};
		}
	}

	public async processAudio(params: AudioProcessingParams): Promise<ServiceResponse<Uint8Array>> {
		try {
			await this.init();
			this.startMetrics();

			const inputFile = await fetchFile(params.input);
			await this.ffmpeg.writeFile('input', inputFile);

			let command = ['-i', 'input'];

			if (params.bitrate) {
				command.push('-b:a', params.bitrate);
			}

			if (params.sampleRate) {
				command.push('-ar', params.sampleRate.toString());
			}

			const outputFormat = params.format || 'mp3';
			command.push(`output.${outputFormat}`);

			await this.ffmpeg.exec(command);
			const data = await this.ffmpeg.readFile(`output.${outputFormat}`) as Uint8Array;

			this.endMetrics();

			return {
				success: true,
				data: data,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error occurred',
			};
		}
	}

	public getMetrics(): ServiceMetrics {
		return this.metrics;
	}
}