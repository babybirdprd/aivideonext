import { OpenAIService } from './openai.service';
import { ReplicateService, VideoGenerationParams } from './replicate.service';
import { RenderService } from '../media/render.service';
import { FFmpegService } from '../media/ffmpeg.service';
import { 
	VideoProcessingParams, 
	RenderSettings, 
	EffectType,
	Effect,
	TransitionType,
	Transition
} from '../media/types';
import { ServiceResponse, ServiceMetrics } from '../types';
import { z } from 'zod';

// Schema definitions
export const AutoEditRequestSchema = z.object({
	sourceVideoUrl: z.string().url(),
	editInstructions: z.string(),
	style: z.string().optional(),
	temperature: z.number().min(0).max(1).optional(),
	useVisionAnalysis: z.boolean().optional(),
	outputFormat: z.enum(['mp4', 'webm']).optional(),
	quality: z.enum(['high', 'medium', 'low']).optional()
});

export const AutoCreateRequestSchema = z.object({
	prompt: z.string(),
	style: z.string().optional(),
	temperature: z.number().min(0).max(1).optional(),
	duration: z.number(),
	outputFormat: z.enum(['mp4', 'webm']).optional(),
	quality: z.enum(['high', 'medium', 'low']).optional()
});

export type AutoEditRequest = z.infer<typeof AutoEditRequestSchema>;
export type AutoCreateRequest = z.infer<typeof AutoCreateRequestSchema>;

// AI and Video Quality Settings
interface AISettings {
	temperature: number;
	style: string;
	quality: 'high' | 'medium' | 'low';
}

interface VideoQualityPreset {
	resolution: { width: number; height: number };
	bitrate: string;
	fps: number;
}

const QUALITY_PRESETS: Record<string, VideoQualityPreset> = {
	high: {
		resolution: { width: 1920, height: 1080 },
		bitrate: '8000k',
		fps: 30
	},
	medium: {
		resolution: { width: 1280, height: 720 },
		bitrate: '4000k',
		fps: 30
	},
	low: {
		resolution: { width: 854, height: 480 },
		bitrate: '2000k',
		fps: 24
	}
};

// Interface definitions
export interface VideoConcept {
    scenes: {
        description: string;
        duration: number;
        assets: {
            type: 'video' | 'image' | 'audio';
            description: string;
            source?: string;
        }[];
        text?: string;
    }[];
    style: string;
    soundtrack?: string;
}

export interface VideoComposition {
    timeline: {
        scenes: {
            assets: { url: string; type: string; }[];
            text?: string;
            duration: number;
            transition?: Transition;
        }[];
    };
    style: {
        visualEffects: Effect[];
        audioEffects: any[];
    };
}

interface EditPlan {
	timeline: {
		cuts: { start: number; end: number; }[];
		transitions: { type: string; duration: number; }[];
	};
	visualEnhancements: {
		effects: {
			type: string;
			intensity: number;
			startTime: number;
			duration: number;
		}[];
	};
	audioModifications: {
		normalize: boolean;
		volume: number;
	};
	additionalElements: {
		text?: { content: string; timestamp: number; duration: number; }[];
		graphics?: { url: string; timestamp: number; duration: number; }[];
	};
}

interface VideoAnalysis {
	frames: {
		timestamp: number;
		description: string;
		keyElements: string[];
	}[];
	summary: string;
	suggestedEdits: string[];
}




export class AutonomousService {
	private ffmpeg: FFmpegService;
	private openai: OpenAIService;
	private replicateService: ReplicateService;
	private renderService: RenderService;
	private projectId: string;

	constructor(projectId: string) {
		this.projectId = projectId;
		this.ffmpeg = new FFmpegService();
		this.openai = new OpenAIService();
		this.replicateService = new ReplicateService();
		this.renderService = new RenderService(this.projectId);
	}
	async autoEdit(params: AutoEditRequest) {
		try {
			const validatedParams = AutoEditRequestSchema.parse(params);
			
			// 1. Analyze video content using OpenAI Vision
			const analysis = await this.analyzeVideoContent(validatedParams.sourceVideoUrl);
			
			// 2. Generate edit instructions using LLM
			const editPlan = await this.generateEditPlan(analysis, validatedParams.editInstructions);
			
			// 3. Execute edits using render service
			const result = await this.executeEdits(editPlan, validatedParams);
			
			return result;
		} catch (error) {
			console.error('Auto edit error:', error);
			throw error;
		}
	}

	async autoCreate(params: AutoCreateRequest): Promise<ServiceResponse<Uint8Array>> {
		try {
			const validatedParams = AutoCreateRequestSchema.parse(params);
			
			// Generate video concept
			const concept = await this.generateVideoConcept(validatedParams.prompt);
			
			// Generate or source required assets
			const assets = await this.generateAssets(concept);
			
			// Create video composition
			const composition = await this.createComposition(concept, assets, validatedParams);
			
			// Render final video
			const result = await this.renderVideo(composition, validatedParams);
			
			return result;
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error occurred'
			};
		}
	}

	private async analyzeVideoContent(videoUrl: string, useVision: boolean = true, temperature: number = 0.7): Promise<VideoAnalysis> {
		// Extract frames only if vision analysis is enabled
		let frameAnalyses: ServiceResponse<string[]> = { success: true, data: [] };
		
		if (useVision) {
			const framesResult = await this.ffmpeg.extractFrames(videoUrl, 10);
			if (!framesResult.success || !framesResult.data) {
				throw new Error('Failed to extract video frames');
			}

			frameAnalyses = await this.openai.analyzeVideoFrames(framesResult.data);
			if (!frameAnalyses.success || !frameAnalyses.data) {
				throw new Error('Failed to analyze video frames');
			}
		}

		// Generate overall summary and edit suggestions
		const summaryPrompt = `Analyze these video frame descriptions and provide:
1. A concise summary of the video content
2. A list of suggested edits to improve the video

${useVision ? `Frame descriptions:\n${frameAnalyses.data.join('\n')}` : 'No vision analysis performed'}`;

		const summaryResult = await this.openai.generateText({
			prompt: summaryPrompt,
			maxTokens: 1000,
			temperature
		});

		if (!summaryResult.success || !summaryResult.data) {
			throw new Error('Failed to generate video analysis');
		}

		const [summary, ...suggestions] = summaryResult.data.split('\n\n');
		
		return {
			frames: useVision ? frameAnalyses.data.map((description, index) => ({
				timestamp: (index / 10),
				description,
				keyElements: this.extractKeyElements(description)
			})) : [],
			summary,
			suggestedEdits: suggestions
		};

	}

	private async generateEditPlan(analysis: VideoAnalysis, instructions: string): Promise<any> {
		const prompt = `Based on the video analysis and edit instructions, create a detailed edit plan:

Video Analysis:
${analysis.summary}

Key Frames:
${analysis.frames.map(f => `- ${f.timestamp}s: ${f.description}`).join('\n')}

Edit Instructions:
${instructions}

Suggested Edits:
${analysis.suggestedEdits.join('\n')}

Create a structured edit plan that includes:
1. Timeline adjustments (cuts, transitions)
2. Visual enhancements (effects, filters)
3. Audio modifications
4. Additional elements needed (text, graphics)`;

		const editPlanResult = await this.openai.generateText({
			prompt,
			maxTokens: 1500,
			temperature: 0.7
		});

		if (!editPlanResult.success || !editPlanResult.data) {
			throw new Error('Failed to generate edit plan');
		}

		return this.parseEditPlan(editPlanResult.data);
	}

	private extractKeyElements(description: string): string[] {
		// Extract key elements like people, objects, actions from the description
		const elements = description.match(/\b(?:person|people|object|action|background|[A-Z][a-z]+)\b/g) || [];
		return Array.from(new Set(elements));
	}

	private parseEditPlan(planText: string): EditPlan {
		try {
			const sections = planText.split('\n\n');
			const plan: EditPlan = {
				timeline: { cuts: [], transitions: [] },
				visualEnhancements: { effects: [] },
				audioModifications: { normalize: false, volume: 1.0 },
				additionalElements: {}
			};

			// Parse timeline adjustments
			const timelineSection = sections[0];
			Array.from(timelineSection.matchAll(/cut:?\s*(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/gi))
				.forEach(match => {
					plan.timeline.cuts.push({ 
						start: parseFloat(match[1]), 
						end: parseFloat(match[2]) 
					});
				});

			Array.from(timelineSection.matchAll(/transition:?\s*(\w+)\s*(\d+\.?\d*)/gi))
				.forEach(match => {
					plan.timeline.transitions.push({ 
						type: match[1], 
						duration: parseFloat(match[2]) 
					});
				});

			// Parse visual enhancements
			const visualSection = sections[1];
			Array.from(visualSection.matchAll(/effect:?\s*(\w+)\s*intensity:?\s*(\d+\.?\d*)\s*at:?\s*(\d+\.?\d*)\s*for:?\s*(\d+\.?\d*)/gi))
				.forEach(match => {
					plan.visualEnhancements.effects.push({
						type: match[1] as EffectType,
						intensity: parseFloat(match[2]),
						startTime: parseFloat(match[3]),
						duration: parseFloat(match[4])
					});
				});

			// Parse audio modifications
			const audioSection = sections[2];
			plan.audioModifications.normalize = audioSection.toLowerCase().includes('normalize');
			const volumeMatch = audioSection.match(/volume:?\s*(\d+\.?\d*)/i);
			if (volumeMatch) {
				plan.audioModifications.volume = parseFloat(volumeMatch[1]);
			}

			return plan;
		} catch (error) {
			console.error('Failed to parse edit plan:', error);
			throw new Error('Failed to parse edit plan');
		}
	}

	private async executeEdits(editPlan: EditPlan, params: AutoEditRequest): Promise<ServiceResponse<Uint8Array>> {
		try {
			const qualityPreset = QUALITY_PRESETS[params.quality || 'high'];
			
			const processingParams = {
				input: params.sourceVideoUrl,
				effects: editPlan.visualEnhancements.effects,
				format: params.outputFormat || 'mp4'
			};

			const settings = {
				denoising: true,
				audioNormalization: editPlan.audioModifications.normalize,
				format: {
					format: params.outputFormat || 'mp4',
					quality: params.quality || 'high',
					codec: 'h264'
				},
				resolution: qualityPreset.resolution,
				bitrate: qualityPreset.bitrate,
				fps: qualityPreset.fps
			};

			// Process the video with the specified edits
			const result = await this.ffmpeg.processVideo(processingParams, settings);
			if (!result.success || !result.data) {
				throw new Error('Failed to process video');
			}

			return result;
		} catch (error) {
			console.error('Failed to execute edits:', error);
			throw error;
		}
	}




	private async generateVideoConcept(prompt: string): Promise<VideoConcept> {
		const conceptPrompt = `Create a detailed video concept based on this prompt: "${prompt}"
		
Format the response as a structured video concept with:
1. A sequence of scenes, each with:
   - Description of the scene
   - Approximate duration in seconds
   - Required assets (videos, images, audio)
   - Any text overlays
2. Overall style direction
3. Soundtrack suggestion

Keep scenes between 3-10 seconds each.`;

		const result = await this.openai.generateText({
			prompt: conceptPrompt,
			maxTokens: 1000,
			temperature: 0.7
		});

		if (!result.success || !result.data) {
			throw new Error('Failed to generate video concept');
		}

		return this.parseVideoConcept(result.data);
	}

	private async generateAssets(concept: VideoConcept): Promise<Map<string, string>> {
		const assetMap = new Map<string, string>();
		
		for (const scene of concept.scenes) {
			for (const asset of scene.assets) {
				if (asset.source) {
					assetMap.set(asset.description, asset.source);
					continue;
				}

				try {
					switch (asset.type) {
						case 'image':
							const imageResult = await this.openai.generateImage({
								prompt: `${asset.description}, ${concept.style}`,
								size: "1024x1024",
								quality: "standard"
							});
							if (imageResult.success && imageResult.data) {
								assetMap.set(asset.description, imageResult.data);
							}
							break;
							
						case 'video':
							const videoResult = await this.replicateService.generateVideo({
								prompt: asset.description,
								num_frames: 24,
								fps: 8
							});
							if (videoResult.success && videoResult.data) {
								assetMap.set(asset.description, videoResult.data);
							}
							break;
							
						case 'audio':
							// Handle audio generation or sourcing
							break;
					}
				} catch (error) {
					console.error(`Failed to generate asset: ${asset.description}`, error);
				}
			}
		}
		
		return assetMap;
	}

	private async createComposition(concept: VideoConcept, assets: Map<string, string>): Promise<VideoComposition> {
		const composition: VideoComposition = {
			timeline: {
				scenes: concept.scenes.map(scene => ({
					assets: scene.assets.map(asset => ({
						url: assets.get(asset.description) || '',
						type: asset.type
					})),
					text: scene.text,
					duration: scene.duration,
					transition: {
						type: 'fade',
						direction: 'right',
						duration: 1,
						smoothness: 0.5
					}
				}))
			},
			style: {
				visualEffects: [],
				audioEffects: []
			}
		};

		return composition;
	}

	private async renderVideo(composition: VideoComposition, params: AutoCreateRequest): Promise<ServiceResponse<Uint8Array>> {
		try {
			const segments = composition.timeline.scenes.map((scene, index) => ({
				startTime: index * scene.duration,
				endTime: (index + 1) * scene.duration,
				input: scene.assets[0].url,
				settings: {
					input: scene.assets[0].url,
					output: `segment_${index}.mp4`,
					format: params.outputFormat || 'mp4',
					resolution: '1080p',
					fps: 30,
					quality: 80,
					effects: scene.transition ? [scene.transition] : []
				}
			}));

			const settings: RenderSettings = {
				hardwareAcceleration: true,
				format: {
					format: params.outputFormat || 'mp4',
					quality: 'high',
					codec: 'h264',
					bitrateRange: {
						min: 2000000,
						max: 8000000
					}
				},
				qualityPreset: {
					name: 'hd',
					resolution: {
						width: 1920,
						height: 1080
					},
					fps: 30,
					videoBitrate: '8000k',
					audioBitrate: '320k',
					twoPass: true
				},
				audioNormalization: true,
				denoising: true,
				twoPassEncoding: true
			};

			return await this.renderService.renderProject(segments, settings);
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to render video'
			};
		}
	}


    private async createComposition(concept: VideoConcept, assets: Map<string, string>, params: AutoCreateRequest): Promise<VideoComposition> {
        const composition: VideoComposition = {
            timeline: {
                scenes: concept.scenes.map(scene => ({
                    assets: scene.assets.map(asset => ({
                        url: assets.get(asset.description) || '',
                        type: asset.type
                    })),
                    text: scene.text,
                    duration: scene.duration,
                    transition: {
                        type: 'fade',
                        direction: 'right',
                        duration: 1,
                        smoothness: 0.5
                    }
                }))
            },
            style: {
                visualEffects: [],
                audioEffects: []
            }
        };

        return composition;
    }

    private parseVideoConcept(conceptText: string): VideoConcept {
		// Parse the LLM response into a structured concept
		const scenes = conceptText.split('\n\n')
			.filter(section => section.trim().startsWith('Scene'))
			.map(scene => {
				const lines = scene.split('\n');
				return {
					description: lines[0].replace('Scene:', '').trim(),
					duration: parseFloat(lines[1].match(/\d+/)?.[0] || '5'),
					assets: lines
						.filter(line => line.includes('Asset:'))
						.map(asset => {
							const [type, description] = asset.replace('Asset:', '').split(':').map(s => s.trim());
							return { type: type.toLowerCase() as 'video' | 'image' | 'audio', description };
						}),
					text: lines.find(line => line.includes('Text:'))?.replace('Text:', '').trim()
				};
			});

		const styleMatch = conceptText.match(/Style:(.*)/);
		const soundtrackMatch = conceptText.match(/Soundtrack:(.*)/);

		return {
			scenes,
			style: styleMatch?.[1].trim() || 'modern',
			soundtrack: soundtrackMatch?.[1].trim()
		};
	}
}

// Update the singleton instance to accept projectId
export const createAutonomousService = (projectId: string) => new AutonomousService(projectId);