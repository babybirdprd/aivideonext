import { NextResponse } from 'next/server';
import { Template } from '@/store/template.types';

export async function POST(
	request: Request,
	{ params }: { params: { templateId: string } }
) {
	try {
		const { score } = await request.json();
		const { templateId } = params;

		// In a real application, this would update a database
		// For now, we'll just return a mock response
		const updatedTemplate: Partial<Template> = {
			id: templateId,
			trendScore: score,
			trending: score > 5,
		};

		return NextResponse.json(updatedTemplate);
	} catch (error) {
		console.error('Error updating trend score:', error);
		return NextResponse.json(
			{ error: 'Failed to update trend score' },
			{ status: 500 }
		);
	}
}