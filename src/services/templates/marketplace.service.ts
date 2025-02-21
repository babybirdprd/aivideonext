import { Template, TemplateVersion } from '@/store/template.types';
import { VideoFormatId } from '@/types/video.types';
import { pexelsService } from '../media/pexels.service';

class MarketplaceService {
	private static instance: MarketplaceService;

	private constructor() {}

	public static getInstance(): MarketplaceService {
		if (!MarketplaceService.instance) {
			MarketplaceService.instance = new MarketplaceService();
		}
		return MarketplaceService.instance;
	}

	async getMarketplaceTemplates(filters?: {
		category?: string;
		videoFormat?: VideoFormatId;
		tags?: string[];
		niche?: string;
		subNiche?: string;
		contentType?: string;
		targetAudience?: string[];
		stylePreferences?: {
			tone?: string;
			pacing?: string;
			visualStyle?: string[];
		};
	}): Promise<Template[]> {
		try {
			const queryParams = new URLSearchParams();
			if (filters?.category) queryParams.set('category', filters.category);
			if (filters?.videoFormat) queryParams.set('videoFormat', filters.videoFormat);
			if (filters?.tags) queryParams.set('tags', JSON.stringify(filters.tags));
			if (filters?.niche) queryParams.set('niche', filters.niche);
			if (filters?.subNiche) queryParams.set('subNiche', filters.subNiche);
			if (filters?.contentType) queryParams.set('contentType', filters.contentType);
			if (filters?.targetAudience) queryParams.set('targetAudience', JSON.stringify(filters.targetAudience));
			if (filters?.stylePreferences) queryParams.set('stylePreferences', JSON.stringify(filters.stylePreferences));

			const response = await fetch(`/api/templates/marketplace?${queryParams}`);
			if (!response.ok) throw new Error('Failed to fetch marketplace templates');
			return response.json();
		} catch (error) {
			console.error('Error fetching marketplace templates:', error);
			throw error;
		}
	}

	async publishTemplate(template: Template): Promise<Template> {
		try {
			const response = await fetch('/api/templates/marketplace', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(template),
			});

			if (!response.ok) throw new Error('Failed to publish template');
			return response.json();
		} catch (error) {
			console.error('Error publishing template:', error);
			throw error;
		}
	}

	async updateTemplate(templateId: string, updates: Partial<Template>): Promise<Template> {
		try {
			const response = await fetch(`/api/templates/marketplace/${templateId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(updates),
			});

			if (!response.ok) throw new Error('Failed to update template');
			return response.json();
		} catch (error) {
			console.error('Error updating template:', error);
			throw error;
		}
	}

	async createVersion(templateId: string, version: TemplateVersion): Promise<Template> {
		try {
			const response = await fetch(`/api/templates/marketplace/${templateId}/versions`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(version),
			});

			if (!response.ok) throw new Error('Failed to create template version');
			return response.json();
		} catch (error) {
			console.error('Error creating template version:', error);
			throw error;
		}
	}

	async removeFromMarketplace(templateId: string): Promise<void> {
		try {
			const response = await fetch(`/api/templates/marketplace/${templateId}`, {
				method: 'DELETE',
			});

			if (!response.ok) throw new Error('Failed to remove template from marketplace');
		} catch (error) {
			console.error('Error removing template from marketplace:', error);
			throw error;
		}
	}

	async getTemplateVersions(templateId: string): Promise<TemplateVersion[]> {
		try {
			const response = await fetch(`/api/templates/marketplace/${templateId}/versions`);
			if (!response.ok) throw new Error('Failed to fetch template versions');
			return response.json();
		} catch (error) {
			console.error('Error fetching template versions:', error);
			throw error;
		}
	}

	async inheritTemplate(templateId: string, overrides: any = {}): Promise<Template> {
		try {
			const response = await fetch(`/api/templates/marketplace/${templateId}/inherit`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ overrides }),
			});

			if (!response.ok) throw new Error('Failed to inherit template');
			return response.json();
		} catch (error) {
			console.error('Error inheriting template:', error);
			throw error;
		}
	}

	async getInheritedTemplates(templateId: string): Promise<Template[]> {
		try {
			const response = await fetch(`/api/templates/marketplace/${templateId}/inherit`);
			if (!response.ok) throw new Error('Failed to fetch inherited templates');
			return response.json();
		} catch (error) {
			console.error('Error fetching inherited templates:', error);
			throw error;
		}
	}

	async getBaseTemplates(): Promise<Template[]> {
		try {
			const response = await fetch('/api/templates/marketplace?isBase=true');
			if (!response.ok) throw new Error('Failed to fetch base templates');
			return response.json();
		} catch (error) {
			console.error('Error fetching base templates:', error);
			throw error;
		}
	}

	async getTrendingTemplates(): Promise<Template[]> {
		try {
			const response = await fetch('/api/templates/marketplace/trending');
			if (!response.ok) throw new Error('Failed to fetch trending templates');
			return response.json();
		} catch (error) {
			console.error('Error fetching trending templates:', error);
			throw error;
		}
	}

	async searchPexelsAssets(template: Template, query: string): Promise<Template> {
		try {
			const media = await pexelsService.searchMedia({
				query,
				orientation: 'landscape',
				perPage: 5
			});

			const updatedTemplate = {
				...template,
				pexelsAssets: media
			};

			await this.updateTemplate(template.id, updatedTemplate);
			return updatedTemplate;
		} catch (error) {
			console.error('Error searching Pexels assets:', error);
			throw error;
		}
	}

	async updateTrendScore(templateId: string, score: number): Promise<Template> {
		try {
			const response = await fetch(`/api/templates/marketplace/${templateId}/trend`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ score })
			});

			if (!response.ok) throw new Error('Failed to update trend score');
			return response.json();
		} catch (error) {
			console.error('Error updating trend score:', error);
			throw error;
		}
	}
}

export const marketplaceService = MarketplaceService.getInstance();