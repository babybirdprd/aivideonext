import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { 
	VideoProcessingParams, 
	AudioProcessingParams,
	RenderSettings,
	Effect,
	Transition
} from './types';
import { ServiceResponse, ServiceMetrics } from '../types';

export class FFmpegService {
	private ffmpeg: FFmpeg;
	private metrics: ServiceMetrics;
	private initialized: boolean = false;
	private progressCallback?: (progress: number) => void;

	constructor(onProgress?: (progress: number) => void) {
		this.ffmpeg = new FFmpeg();
		this.metrics = {
			startTime: 0,
			endTime: 0,
		};
		this.progressCallback = onProgress;
	}

	private async init() {
		if (!this.initialized) {
			const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
			await this.ffmpeg.load({
				coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
				wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
			});

			// Set up progress tracking
			this.ffmpeg.on('progress', ({ progress, time }) => {
				this.progressCallback?.(progress);
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

	private getHardwareAcceleration(settings?: RenderSettings): string[] {
		if (settings?.hardwareAcceleration) {
			// Try NVIDIA first, fall back to other options
			return ['-hwaccel', 'cuda', '-hwaccel_output_format', 'cuda'];
		}
		return [];
	}

	private getEffectFilter(effect: Effect): string {
		const { type, intensity, startTime, duration } = effect;
		const enable = `between(t,${startTime},${startTime + duration})`;
		
		switch (type) {
			case 'blur':
				return `boxblur=${intensity * 20}:1:enable='${enable}'`;
			case 'brightness':
				return `curves=all='0/0 1/${intensity * 2}':enable='${enable}'`;
			case 'contrast':
				return `eq=contrast=${1 + intensity}:enable='${enable}'`;
			case 'saturation':
				return `eq=saturation=${1 + intensity}:enable='${enable}'`;
			case 'zoom':
				return `scale=iw*${1 + intensity}:-1,crop=iw/${1 + intensity}:ih/${1 + intensity}:enable='${enable}'`;
			case 'rotate':
				const angle = intensity * 360;
				return `rotate=${angle}*PI/180:enable='${enable}'`;
			case 'fade':
				return `fade=t=in:st=${startTime}:d=${duration/2},fade=t=out:st=${startTime + duration/2}:d=${duration/2}`;
			default:
				return '';
		}
	}

	private getTransitionFilter(transition: Transition, inputDuration: number): string {
		const { type, direction, duration, smoothness } = transition;
		
		switch (type) {
			case 'fade':
				return `fade=t=out:st=${inputDuration-duration}:d=${duration}[v1];[1:v]fade=t=in:st=0:d=${duration}[v2]`;
			case 'dissolve':
				return `fade=t=out:st=${inputDuration-duration}:d=${duration}:alpha=1[v1];[1:v]fade=t=in:st=0:d=${duration}:alpha=1[v2];[v1][v2]overlay`;
			case 'wipe':
				const angle = direction === 'left' ? 180 : direction === 'right' ? 0 : direction === 'up' ? 90 : 270;
				return `wipe=0.${Math.floor(smoothness * 10)}:${angle}`;
			case 'slide':
				const x = direction === 'left' ? -1 : direction === 'right' ? 1 : 0;
				const y = direction === 'up' ? -1 : direction === 'down' ? 1 : 0;
				return `overlay=x='if(gte(t,${inputDuration-duration}),${x}*w*(t-(${inputDuration-duration}))/${duration},0)':y='if(gte(t,${inputDuration-duration}),${y}*h*(t-(${inputDuration-duration}))/${duration},0)'`;
			default:
				return '';
		}
	}

	private getQualityPresetSettings(preset: QualityPreset): string[] {
		const commands = [
			'-vf', `scale=${preset.resolution.width}:${preset.resolution.height}`,
			'-r', preset.fps.toString(),
			'-b:v', preset.videoBitrate,
			'-b:a', preset.audioBitrate
		];

		if (preset.twoPass) {
			commands.push('-pass', '1');
		}

		return commands;
	}

	private getFormatPresetSettings(preset: VideoFormatPreset): string[] {
		const commands = [];
		
		switch (preset.format) {
			case 'webm':
				commands.push('-c:v', 'libvpx-vp9');
				commands.push('-c:a', preset.audioCodec || 'libopus');
				break;
			case 'mov':
				commands.push('-c:v', 'h264_nvenc');
				commands.push('-c:a', preset.audioCodec || 'aac');
				break;
			case 'gif':
				commands.push('-f', 'gif');
				break;
			default: // mp4
				const codec = preset.codec === 'h265' ? 'libx265' : 'libx264';
				commands.push('-c:v', codec);
				commands.push('-c:a', preset.audioCodec || 'aac');
		}

		// Add quality-based settings
		switch (preset.quality) {
			case 'ultra':
				commands.push('-crf', '16');
				break;
			case 'high':
				commands.push('-crf', '20');
				break;
			case 'medium':
				commands.push('-crf', '26');
				break;
			case 'low':
				commands.push('-crf', '32');
				break;
		}

		return commands;
	}

	private async performTwoPassEncoding(
		baseCommand: string[],
		outputPath: string,
		settings: RenderSettings
	): Promise<void> {
		// First pass
		await this.ffmpeg.exec([
			...baseCommand,
			'-pass', '1',
			'-f', 'null',
			'/dev/null'
		]);

		// Second pass
		await this.ffmpeg.exec([
			...baseCommand,
			'-pass', '2',
			outputPath
		]);
	}

	public async processVideo(params: VideoProcessingParams, settings?: RenderSettings): Promise<ServiceResponse<Uint8Array>> {
		try {
			await this.init();
			this.startMetrics();

			const inputFile = await fetchFile(params.input);
			await this.ffmpeg.writeFile('input', inputFile);

			let baseCommand = [
				...this.getHardwareAcceleration(settings),
				'-i', 'input'
			];

			// Build filter chain
			const filters: string[] = [];

			// Apply quality preset if specified
			if (settings?.qualityPreset) {
				baseCommand.push(...this.getQualityPresetSettings(settings.qualityPreset));
			}

			// Apply format preset if specified
			if (settings?.format) {
				baseCommand.push(...this.getFormatPresetSettings(settings.format));
			}

			// Add denoising if enabled
			if (settings?.denoising) {
				filters.push('nlmeans=10:7:5:3:3');
			}

			// Add audio normalization if enabled
			if (settings?.audioNormalization) {
				filters.push('loudnorm=I=-16:TP=-1.5:LRA=11');
			}

			// Add effects if present
			if (params.effects?.length) {
				const effectFilters = params.effects
					.map(effect => this.getEffectFilter(effect))
					.filter(Boolean);
				filters.push(...effectFilters);
			}

			// Apply filter chain if present
			if (filters.length > 0) {
				baseCommand.push('-vf', filters.join(','));
			}

			const format = settings?.format?.format || params.format || 'mp4';
			const outputPath = `output.${format}`;

			// Perform two-pass encoding if enabled
			if (settings?.twoPassEncoding) {
				await this.performTwoPassEncoding(baseCommand, outputPath, settings);
			} else {
				await this.ffmpeg.exec([...baseCommand, outputPath]);
			}

			const data = await this.ffmpeg.readFile(outputPath) as Uint8Array;

			
			this.endMetrics();

			return {
				success: true,
				data,
				metrics: this.metrics
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error occurred',
				metrics: this.metrics
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