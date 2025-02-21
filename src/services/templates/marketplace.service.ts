import { Template } from '@/store/template.types';

class MarketplaceService {
	private static instance: MarketplaceService;

	private constructor() {}

	public static getInstance(): MarketplaceService {
		if (!MarketplaceService.instance) {
			MarketplaceService.instance = new MarketplaceService();
		}
		return MarketplaceService.instance;
	}

	async getMarketplaceTemplates(): Promise<Template[]> {
		try {
			const response = await fetch('/api/templates/marketplace');
			if (!response.ok) {
				throw new Error('Failed to fetch marketplace templates');
			}
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
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(template),
			});

			if (!response.ok) {
				throw new Error('Failed to publish template');
			}

			return response.json();
		} catch (error) {
			console.error('Error publishing template:', error);
			throw error;
		}
	}

	async removeFromMarketplace(templateId: string): Promise<void> {
		try {
			const response = await fetch(`/api/templates/marketplace?id=${templateId}`, {
				method: 'DELETE',
			});

			if (!response.ok) {
				throw new Error('Failed to remove template from marketplace');
			}
		} catch (error) {
			console.error('Error removing template from marketplace:', error);
			throw error;
		}
	}
}

export const marketplaceService = MarketplaceService.getInstance();