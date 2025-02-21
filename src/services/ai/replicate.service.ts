import { ReplicateModel, ReplicateInput, ReplicateModelSchema } from './replicate.types';

export class ReplicateService {
	private readonly apiUrl = 'https://api.replicate.com/v1';
	private readonly apiKey: string;

	constructor() {
		const apiKey = process.env.NEXT_PUBLIC_REPLICATE_API_KEY;
		if (!apiKey) {
			throw new Error('Replicate API key not found');
		}
		this.apiKey = apiKey;
	}

	async predict({ modelVersion, input }: ReplicateInput): Promise<ReplicateModel> {
		const response = await fetch(`${this.apiUrl}/predictions`, {
			method: 'POST',
			headers: {
				'Authorization': `Token ${this.apiKey}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				version: modelVersion,
				input,
			}),
		});

		if (!response.ok) {
			throw new Error(`Replicate API error: ${response.statusText}`);
		}

		const prediction = await response.json();
		return ReplicateModelSchema.parse(prediction);
	}

	async getPrediction(id: string): Promise<ReplicateModel> {
		const response = await fetch(`${this.apiUrl}/predictions/${id}`, {
			headers: {
				'Authorization': `Token ${this.apiKey}`,
			},
		});

		if (!response.ok) {
			throw new Error(`Replicate API error: ${response.statusText}`);
		}

		const prediction = await response.json();
		return ReplicateModelSchema.parse(prediction);
	}

	async waitForCompletion(id: string, pollInterval = 1000): Promise<ReplicateModel> {
		let prediction = await this.getPrediction(id);
		
		while (prediction.status === 'starting' || prediction.status === 'processing') {
			await new Promise(resolve => setTimeout(resolve, pollInterval));
			prediction = await this.getPrediction(id);
		}

		if (prediction.status === 'failed') {
			throw new Error(`Prediction failed: ${prediction.error}`);
		}

		return prediction;
	}
}

export const replicateService = new ReplicateService();