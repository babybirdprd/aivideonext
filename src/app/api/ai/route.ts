import { NextResponse } from 'next/server';
import { TrendAnalysisService } from '@/services/ai/trend.service';
import { AssetEnhancementService } from '@/services/ai/enhancement.service';
import { TrendAnalysisSchema, AssetEnhancementSchema } from '@/services/ai/types';

const trendService = new TrendAnalysisService();
const enhancementService = new AssetEnhancementService();

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { action, params } = body;

		switch (action) {
			case 'analyzeTrends': {
				const validParams = TrendAnalysisSchema.parse(params);
				const result = await trendService.analyzeTrends(validParams);
				return NextResponse.json(result);
			}
			case 'enhanceAsset': {
				const validParams = AssetEnhancementSchema.parse(params);
				const result = await enhancementService.enhanceAsset(validParams);
				return NextResponse.json(result);
			}
			default:
				return NextResponse.json(
					{ error: 'Invalid action' },
					{ status: 400 }
				);
		}
	} catch (error) {
		console.error('AI Service Error:', error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : 'Internal server error' },
			{ status: 500 }
		);
	}
}