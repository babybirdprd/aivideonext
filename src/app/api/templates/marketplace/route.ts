import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Template, TemplateVersion } from '@/store/template.types';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const category = searchParams.get('category');
		const videoFormat = searchParams.get('videoFormat');
		const tags = searchParams.get('tags');
		const niche = searchParams.get('niche');
		const subNiche = searchParams.get('subNiche');
		const contentType = searchParams.get('contentType');
		const targetAudience = searchParams.get('targetAudience');
		const stylePreferences = searchParams.get('stylePreferences');

		const where = {
			isPublished: true,
			...(category && { category }),
			...(videoFormat && { videoFormat }),
			...(tags && { tags: { contains: tags } }),
			...(niche && { niche }),
			...(subNiche && { subNiche }),
			...(contentType && { contentType }),
			...(targetAudience && { targetAudience: { contains: targetAudience } }),
			...(stylePreferences && { stylePreferences: { contains: stylePreferences } })
		};

		const templates = await prisma.template.findMany({
			where,
			include: {
				user: {
					select: {
						name: true,
						image: true
					}
				}
			}
		});

		return NextResponse.json(templates);
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
		
		const user = await prisma.user.findUnique({
			where: { email: session.user?.email! }
		});

		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		const newTemplate = await prisma.template.create({
			data: {
				...template,
				userId: user.id,
				isPublished: true,
				blocks: JSON.stringify(template.blocks),
				parameters: JSON.stringify(template.parameters),
				tags: JSON.stringify(template.tags),
				stylePreferences: JSON.stringify(template.stylePreferences),
				targetAudience: JSON.stringify(template.targetAudience),
				versionHistory: JSON.stringify([])
			}
		});

		return NextResponse.json(newTemplate);
	} catch (error) {
		console.error('Error publishing template:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function PATCH(request: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const templateId = request.url.split('/').pop();
		const updates = await request.json();

		const template = await prisma.template.update({
			where: { id: templateId },
			data: {
				...updates,
				...(updates.blocks && { blocks: JSON.stringify(updates.blocks) }),
				...(updates.parameters && { parameters: JSON.stringify(updates.parameters) }),
				...(updates.tags && { tags: JSON.stringify(updates.tags) }),
				updatedAt: new Date()
			}
		});

		return NextResponse.json(template);
	} catch (error) {
		console.error('Error updating template:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function DELETE(request: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const templateId = request.url.split('/').pop();
		await prisma.template.delete({
			where: { id: templateId }
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error removing template:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}