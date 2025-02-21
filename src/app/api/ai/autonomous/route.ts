import { NextRequest, NextResponse } from 'next/server';
import { createAutonomousService } from '@/services/ai/autonomous.service';
import { AutoEditRequestSchema, AutoCreateRequestSchema } from '@/services/ai/autonomous.service';
import { z } from 'zod';

const AutonomousRequestSchema = z.object({
	projectId: z.string(),
	action: z.enum(['edit', 'create']),
	params: z.union([AutoEditRequestSchema, AutoCreateRequestSchema])
});

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const { projectId, action, params } = AutonomousRequestSchema.parse(body);

		const autonomousService = createAutonomousService(projectId);

		let result;
		switch (action) {
			case 'edit':
				result = await autonomousService.autoEdit(params);
				break;
			case 'create':
				result = await autonomousService.autoCreate(params);
				break;
			default:
				return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
		}

		if (!result.success) {
			return NextResponse.json({ error: result.error }, { status: 500 });
		}

		return NextResponse.json({
			success: true,
			data: result.data
		});
	} catch (error) {
		console.error('Autonomous processing error:', error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : 'Unknown error occurred' },
			{ status: 500 }
		);
	}
}