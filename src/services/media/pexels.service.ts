interface PexelsMedia {
	id: string;
	type: 'image' | 'video';
	url: string;
	preview?: string;
	keywords: string[];
}

interface PexelsSearchParams {
	query: string;
	orientation?: 'landscape' | 'portrait' | 'square';
	size?: 'small' | 'medium' | 'large';
	type?: 'image' | 'video';
	perPage?: number;
}

class PexelsService {
	private static instance: PexelsService;
	private readonly API_KEY = process.env.NEXT_PUBLIC_PEXELS_API_KEY;
	private readonly BASE_URL = 'https://api.pexels.com';

	private constructor() {}

	public static getInstance(): PexelsService {
		if (!PexelsService.instance) {
			PexelsService.instance = new PexelsService();
		}
		return PexelsService.instance;
	}

	async searchMedia(params: PexelsSearchParams): Promise<PexelsMedia[]> {
		const { query, orientation = 'landscape', size = 'large', type = 'image', perPage = 10 } = params;
		const endpoint = type === 'image' ? '/v1/search' : '/videos/search';
		
		try {
			const response = await fetch(`${this.BASE_URL}${endpoint}?query=${encodeURIComponent(query)}&orientation=${orientation}&size=${size}&per_page=${perPage}`, {
				headers: {
					'Authorization': this.API_KEY!
				}
			});

			if (!response.ok) throw new Error('Failed to fetch from Pexels');
			
			const data = await response.json();
			return this.transformPexelsResponse(data, type);
		} catch (error) {
			console.error('Error fetching from Pexels:', error);
			throw error;
		}
	}

	private transformPexelsResponse(data: any, type: 'image' | 'video'): PexelsMedia[] {
		if (type === 'image') {
			return data.photos.map(photo => ({
				id: photo.id.toString(),
				type: 'image',
				url: photo.src.original,
				preview: photo.src.medium,
				keywords: photo.tags || []
			}));
		} else {
			return data.videos.map(video => ({
				id: video.id.toString(),
				type: 'video',
				url: video.video_files[0].link,
				preview: video.image,
				keywords: video.tags || []
			}));
		}
	}

	async getMediaById(id: string, type: 'image' | 'video'): Promise<PexelsMedia> {
		const endpoint = type === 'image' ? `/v1/photos/${id}` : `/videos/${id}`;
		
		try {
			const response = await fetch(`${this.BASE_URL}${endpoint}`, {
				headers: {
					'Authorization': this.API_KEY!
				}
			});

			if (!response.ok) throw new Error('Failed to fetch media from Pexels');
			
			const data = await response.json();
			return (this.transformPexelsResponse({ [type === 'image' ? 'photos' : 'videos']: [data] }, type))[0];
		} catch (error) {
			console.error('Error fetching media from Pexels:', error);
			throw error;
		}
	}
}

export const pexelsService = PexelsService.getInstance();