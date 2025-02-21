import { NextRequest, NextResponse } from 'next/server';
import { RenderService } from '@/services/media/render.service';
import { RenderSettingsSchema, VideoProcessingSchema } from '@/services/media/types';
import { z } from 'zod';

const RenderRequestSchema = z.object({
	projectId: z.string(),
	segments: z.array(z.object({
		startTime: z.number(),
		endTime: z.number(),
		input: z.string(),
		settings: VideoProcessingSchema
	})),
	settings: RenderSettingsSchema
});

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const { projectId, segments, settings } = RenderRequestSchema.parse(body);

		const renderService = new RenderService(projectId);

		// Apply default quality preset if none specified
		if (!settings.qualityPreset && !settings.format) {
			settings.qualityPreset = renderService.getQualityPreset('web');
			settings.format = renderService.getFormatPreset('web');
		}

		const result = await renderService.renderProject(segments, settings);

		if (!result.success) {
			return NextResponse.json({ error: result.error }, { status: 500 });
		}

		return NextResponse.json({
			success: true,
			data: result.data,
			metrics: result.metrics
		});
	} catch (error) {
		console.error('Render error:', error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : 'Unknown error occurred' },
			{ status: 500 }
		);
	}
}

