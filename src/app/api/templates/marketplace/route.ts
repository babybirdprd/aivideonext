import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Template } from '@/store/template.types';

// Mock database for now - replace with actual database later
let marketplaceTemplates: Template[] = [];

export async function GET() {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		return NextResponse.json(marketplaceTemplates);
	} catch (error) {
		console.error('Error fetching marketplace templates:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function POST(request: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const template = await request.json();
		
		// Validate template
		if (!template.id || !template.name || !template.description) {
			return NextResponse.json({ error: 'Invalid template data' }, { status: 400 });
		}

		// Add to marketplace
		template.isPublished = true;
		marketplaceTemplates.push(template);

		return NextResponse.json(template);
	} catch (error) {
		console.error('Error publishing template:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function DELETE(request: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const id = searchParams.get('id');

		if (!id) {
			return NextResponse.json({ error: 'Template ID required' }, { status: 400 });
		}

		marketplaceTemplates = marketplaceTemplates.filter(t => t.id !== id);
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error removing template from marketplace:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}