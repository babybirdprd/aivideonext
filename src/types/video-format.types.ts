export interface VideoFormat {
	id: string;
	name: string;
	width: number;
	height: number;
	platform: VideoPlatform;
	recommendedSettings?: {
		fps?: number;
		bitrate?: string;
		maxDuration?: number; // in seconds
	};
}

export type VideoPlatform = 'youtube' | 'tiktok' | 'instagram' | 'custom';

export const VIDEO_FORMATS: VideoFormat[] = [
	{
		id: 'youtube-landscape',
		name: 'YouTube Landscape',
		width: 1920,
		height: 1080,
		platform: 'youtube',
		recommendedSettings: {
			fps: 30,
			bitrate: '8000k',
			maxDuration: 3600
		}
	},
	{
		id: 'youtube-shorts',
		name: 'YouTube Shorts',
		width: 1080,
		height: 1920,
		platform: 'youtube',
		recommendedSettings: {
			fps: 30,
			bitrate: '6000k',
			maxDuration: 60
		}
	},
	{
		id: 'tiktok-vertical',
		name: 'TikTok',
		width: 1080,
		height: 1920,
		platform: 'tiktok',
		recommendedSettings: {
			fps: 30,
			bitrate: '5000k',
			maxDuration: 180
		}
	},
	{
		id: 'instagram-square',
		name: 'Instagram Square',
		width: 1080,
		height: 1080,
		platform: 'instagram',
		recommendedSettings: {
			fps: 30,
			bitrate: '4000k',
			maxDuration: 60
		}
	},
	{
		id: 'instagram-story',
		name: 'Instagram Story',
		width: 1080,
		height: 1920,
		platform: 'instagram',
		recommendedSettings: {
			fps: 30,
			bitrate: '4000k',
			maxDuration: 15
		}
	}
];

export const getVideoFormat = (id: string): VideoFormat | undefined => {
	return VIDEO_FORMATS.find(format => format.id === id);
};

export const getPlatformFormats = (platform: VideoPlatform): VideoFormat[] => {
	return VIDEO_FORMATS.filter(format => format.platform === platform);
};