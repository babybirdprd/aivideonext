import { VideoFormat as NewVideoFormat, VIDEO_FORMATS } from './video-format.types';

export interface VideoDimensions {
	width: number;
	height: number;
	aspectRatio: string;
}

export type VideoFormatId = 'youtube-landscape' | 'youtube-shorts' | 'tiktok-vertical' | 'instagram-square' | 'instagram-story' | 'custom';

// For backward compatibility
export const VIDEO_PRESETS: Record<VideoFormatId, VideoDimensions> = {
	'youtube-landscape': {
		width: 1920,
		height: 1080,
		aspectRatio: '16:9'
	},
	'youtube-shorts': {
		width: 1080,
		height: 1920,
		aspectRatio: '9:16'
	},
	'tiktok-vertical': {
		width: 1080,
		height: 1920,
		aspectRatio: '9:16'
	},
	'instagram-square': {
		width: 1080,
		height: 1080,
		aspectRatio: '1:1'
	},
	'instagram-story': {
		width: 1080,
		height: 1920,
		aspectRatio: '9:16'
	},
	'custom': {
		width: 1920,
		height: 1080,
		aspectRatio: '16:9'
	}
};

export const calculateAspectRatio = (width: number, height: number): string => {
	const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
	const divisor = gcd(width, height);
	return `${width / divisor}:${height / divisor}`;
};

export type { NewVideoFormat as VideoFormat };
export { VIDEO_FORMATS };