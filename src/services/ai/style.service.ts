import { StyleTransferParams, StyleTransferResult, StyleTransferSchema } from './types';
import { replicateService } from './replicate.service';
import { REPLICATE_MODELS } from './replicate.types';

export class StyleTransferService {
	async transferStyle(params: StyleTransferParams): Promise<StyleTransferResult> {
		try {
			const validatedParams = StyleTransferSchema.parse(params);
			
			const prediction = await replicateService.predict({
				modelVersion: REPLICATE_MODELS.stableDiffusion,
				input: {
					image: validatedParams.sourceUrl,
					prompt: validatedParams.style,
					strength: validatedParams.strength || 0.8,
					guidance_scale: validatedParams.preserveContent ? 7.5 : 15.0
				}
			});

			const result = await replicateService.waitForCompletion(prediction.id);

			if (!result.output || typeof result.output !== 'string') {
				throw new Error('Invalid output from style transfer model');
			}

			return {
				resultUrl: result.output,
				style: validatedParams.style,
				processingStats: {
					duration: Date.now() - new Date(result.created_at || Date.now()).getTime(),
					modelUsed: 'sdxl',
					success: true
				}
			};
		} catch (error) {
			console.error('Style transfer error:', error);
			throw error;
		}
	}
}

export const styleTransferService = new StyleTransferService();
