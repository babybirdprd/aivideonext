import { NextResponse } from 'next/server';
import { Template } from '@/store/template.types';
import { trendAnalysisService } from '@/services/ai/trend.service';
import { prisma } from '@/lib/prisma';

export async function GET() {
	try {
		// In a real app, fetch templates from database
		const templates = await prisma.template.findMany({
			where: { isPublished: true },
			orderBy: { trendScore: 'desc' },
			take: 20
		});

		// Analyze trends and update scores
		const analyzedTemplates = await trendAnalysisService.analyzeTrends(templates);

		// Return top trending templates
		return NextResponse.json(analyzedTemplates.slice(0, 10));
	} catch (error) {
		console.error('Error fetching trending templates:', error);
		return NextResponse.json({ error: 'Failed to fetch trending templates' }, { status: 500 });
	}
}

export async function POST(request: Request) {
	try {
		const { template, metrics } = await request.json();
		
		// Update template trend score using the trend analysis service
		const updatedTemplate = await trendAnalysisService.updateTemplateScore(template, metrics);

		// In a real app, update the database
		await prisma.template.update({
			where: { id: template.id },
			data: {
				trendScore: updatedTemplate.trendScore,
				views: updatedTemplate.views,
				uses: updatedTemplate.uses,
				shares: updatedTemplate.shares,
				likes: updatedTemplate.likes
			}
		});

		return NextResponse.json(updatedTemplate);
	} catch (error) {
		console.error('Error updating trending template:', error);
		return NextResponse.json({ error: 'Failed to update trending template' }, { status: 500 });
	}
}