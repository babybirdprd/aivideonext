export interface VideoFormat {
	id: string;
	name: string;
	width: number;
	height: number;
	platform: VideoPlatform;
}

export type VideoPlatform = 'youtube' | 'tiktok' | 'instagram' | 'custom';

export const VIDEO_FORMATS: VideoFormat[] = [
	{
		id: 'youtube-landscape',
		name: 'YouTube Landscape',
		width: 1920,
		height: 1080,
		platform: 'youtube'
	},
	{
		id: 'youtube-shorts',
		name: 'YouTube Shorts',
		width: 1080,
		height: 1920,
		platform: 'youtube'
	},
	{
		id: 'tiktok-vertical',
		name: 'TikTok',
		width: 1080,
		height: 1920,
		platform: 'tiktok'
	},
	{
		id: 'instagram-square',
		name: 'Instagram Square',
		width: 1080,
		height: 1080,
		platform: 'instagram'
	},
	{
		id: 'instagram-story',
		name: 'Instagram Story',
		width: 1080,
		height: 1920,
		platform: 'instagram'
	}
];

export const getVideoFormat = (id: string): VideoFormat | undefined => {
	return VIDEO_FORMATS.find(format => format.id === id);
};