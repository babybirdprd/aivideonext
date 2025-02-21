import { Template } from '@/store/template.types';
import { marketplaceService } from '../templates/marketplace.service';

interface TrendMetrics {
	views: number;
	uses: number;
	shares: number;
	likes: number;
	timeWeight: number;
}

class TrendAnalysisService {
	private static instance: TrendAnalysisService;

	private constructor() {}

	public static getInstance(): TrendAnalysisService {
		if (!TrendAnalysisService.instance) {
			TrendAnalysisService.instance = new TrendAnalysisService();
		}
		return TrendAnalysisService.instance;
	}

	private calculateTimeWeight(timestamp: Date): number {
		const now = new Date();
		const diffInHours = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
		return Math.exp(-diffInHours / 168); // Decay over a week
	}

	private calculateTrendScore(metrics: TrendMetrics): number {
		const { views, uses, shares, likes, timeWeight } = metrics;
		const baseScore = (views * 0.3 + uses * 0.4 + shares * 0.2 + likes * 0.1);
		return baseScore * timeWeight;
	}

	async updateTemplateScore(template: Template, metrics: Partial<TrendMetrics>): Promise<Template> {
		const timeWeight = this.calculateTimeWeight(new Date(template.updated));
		const defaultMetrics: TrendMetrics = {
			views: 0,
			uses: 0,
			shares: 0,
			likes: 0,
			timeWeight
		};

		const combinedMetrics = { ...defaultMetrics, ...metrics, timeWeight };
		const trendScore = this.calculateTrendScore(combinedMetrics);

		return await marketplaceService.updateTrendScore(template.id, trendScore);
	}

	async analyzeTrends(templates: Template[]): Promise<Template[]> {
		const updatedTemplates = await Promise.all(
			templates.map(async (template) => {
				const timeWeight = this.calculateTimeWeight(new Date(template.updated));
				const metrics = {
					views: template.views || 0,
					uses: template.uses || 0,
					shares: template.shares || 0,
					likes: template.likes || 0,
					timeWeight
				};
				
				const trendScore = this.calculateTrendScore(metrics);
				return await marketplaceService.updateTrendScore(template.id, trendScore);
			})
		);

		return updatedTemplates.sort((a, b) => (b.trendScore || 0) - (a.trendScore || 0));
	}
}

export const trendAnalysisService = TrendAnalysisService.getInstance();
