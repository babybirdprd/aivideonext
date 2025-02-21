import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(
	request: Request,
	{ params }: { params: { templateId: string } }
) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const template = await prisma.template.findUnique({
			where: { id: params.templateId }
		});

		if (!template) {
			return NextResponse.json({ error: 'Template not found' }, { status: 404 });
		}

		const versionHistory = JSON.parse(template.versionHistory);
		return NextResponse.json(versionHistory);
	} catch (error) {
		console.error('Error fetching template versions:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function POST(
	request: Request,
	{ params }: { params: { templateId: string } }
) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const version = await request.json();
		const template = await prisma.template.findUnique({
			where: { id: params.templateId }
		});

		if (!template) {
			return NextResponse.json({ error: 'Template not found' }, { status: 404 });
		}

		const versionHistory = JSON.parse(template.versionHistory);
		versionHistory.push({
			...version,
			timestamp: new Date()
		});

		const updatedTemplate = await prisma.template.update({
			where: { id: params.templateId },
			data: {
				version: version.version,
				versionHistory: JSON.stringify(versionHistory)
			}
		});

		return NextResponse.json(updatedTemplate);
	} catch (error) {
		console.error('Error creating template version:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}