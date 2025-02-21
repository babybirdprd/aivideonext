import { NextResponse } from 'next/server';
import { Template } from '@/store/template.types';

// In a real application, this would be fetched from a database
let trendingTemplates: Template[] = [];

export async function GET() {
	try {
		// Sort templates by trend score in descending order
		const sortedTemplates = trendingTemplates.sort((a, b) => 
			(b.trendScore || 0) - (a.trendScore || 0)
		);

		// Return top 10 trending templates
		return NextResponse.json(sortedTemplates.slice(0, 10));
	} catch (error) {
		console.error('Error fetching trending templates:', error);
		return NextResponse.json({ error: 'Failed to fetch trending templates' }, { status: 500 });
	}
}

export async function POST(request: Request) {
	try {
		const template = await request.json();
		
		// Update trending templates
		const existingIndex = trendingTemplates.findIndex(t => t.id === template.id);
		if (existingIndex !== -1) {
			trendingTemplates[existingIndex] = {
				...trendingTemplates[existingIndex],
				...template,
				trendScore: (trendingTemplates[existingIndex].trendScore || 0) + 1
			};
		} else {
			trendingTemplates.push({
				...template,
				trendScore: 1
			});
		}

		return NextResponse.json(trendingTemplates[existingIndex !== -1 ? existingIndex : trendingTemplates.length - 1]);
	} catch (error) {
		console.error('Error updating trending template:', error);
		return NextResponse.json({ error: 'Failed to update trending template' }, { status: 500 });
	}
}