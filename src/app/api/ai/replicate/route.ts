import { NextRequest, NextResponse } from 'next/server';
import { replicateService } from '@/services/ai/replicate.service';
import { ReplicateInputSchema } from '@/services/ai/replicate.types';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const input = ReplicateInputSchema.parse(body);
		
		const prediction = await replicateService.predict(input);
		const result = await replicateService.waitForCompletion(prediction.id);
		
		return NextResponse.json(result);
	} catch (error) {
		console.error('Replicate API error:', error);
		return NextResponse.json(
			{ error: 'Failed to process Replicate request' },
			{ status: 500 }
		);
	}
}

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const id = searchParams.get('id');
		
		if (!id) {
			return NextResponse.json(
				{ error: 'Prediction ID is required' },
				{ status: 400 }
			);
		}
		
		const prediction = await replicateService.getPrediction(id);
		return NextResponse.json(prediction);
	} catch (error) {
		console.error('Replicate API error:', error);
		return NextResponse.json(
			{ error: 'Failed to get prediction status' },
			{ status: 500 }
		);
	}
}