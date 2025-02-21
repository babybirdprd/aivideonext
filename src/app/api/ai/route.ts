import { NextResponse } from 'next/server';
import { TrendAnalysisService } from '@/services/ai/trend.service';
import { AssetEnhancementService } from '@/services/ai/enhancement.service';
import { StyleTransferService } from '@/services/ai/style.service';
import { 
	TrendAnalysisSchema, 
	AssetEnhancementSchema, 
	StyleTransferSchema 
} from '@/services/ai/types';

const trendService = new TrendAnalysisService();
const enhancementService = new AssetEnhancementService();
const styleService = new StyleTransferService();

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
			case 'transferStyle': {
				const validParams = StyleTransferSchema.parse(params);
				const result = await styleService.transferStyle(validParams);
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