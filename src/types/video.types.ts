export interface VideoDimensions {
	width: number;
	height: number;
	aspectRatio: string;
}

export type VideoFormat = 'youtube' | 'youtube-shorts' | 'tiktok' | 'instagram' | 'instagram-story' | 'custom';

export const VIDEO_PRESETS: Record<VideoFormat, VideoDimensions> = {
	'youtube': {
		width: 1920,
		height: 1080,
		aspectRatio: '16:9'
	},
	'youtube-shorts': {
		width: 1080,
		height: 1920,
		aspectRatio: '9:16'
	},
	'tiktok': {
		width: 1080,
		height: 1920,
		aspectRatio: '9:16'
	},
	'instagram': {
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