import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function POST(
	request: Request,
	{ params }: { params: { templateId: string } }
) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { overrides, inherited } = await request.json();
		const parentTemplate = await prisma.template.findUnique({
			where: { id: params.templateId }
		});

		if (!parentTemplate) {
			return NextResponse.json({ error: 'Parent template not found' }, { status: 404 });
		}

		const user = await prisma.user.findUnique({
			where: { email: session.user?.email! }
		});

		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		// Create new template based on parent
		const newTemplate = await prisma.template.create({
			data: {
				name: `${parentTemplate.name} (Inherited)`,
				description: parentTemplate.description,
				category: parentTemplate.category,
				blocks: parentTemplate.blocks,
				parameters: parentTemplate.parameters,
				version: '1.0.0',
				versionHistory: JSON.stringify([]),
				parentId: parentTemplate.id,
				videoFormat: parentTemplate.videoFormat,
				isPublished: false,
				tags: parentTemplate.tags,
				isBase: false,
				userId: user.id,
				// Apply overrides if any
				...(overrides && {
					blocks: JSON.stringify({
						...JSON.parse(parentTemplate.blocks),
						...overrides
					})
				})
			}
		});

		return NextResponse.json(newTemplate);
	} catch (error) {
		console.error('Error creating inherited template:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function GET(
	request: Request,
	{ params }: { params: { templateId: string } }
) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Get all templates that inherit from this one
		const inheritedTemplates = await prisma.template.findMany({
			where: { parentId: params.templateId },
			include: {
				user: {
					select: {
						name: true,
						image: true
					}
				}
			}
		});

		return NextResponse.json(inheritedTemplates);
	} catch (error) {
		console.error('Error fetching inherited templates:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}