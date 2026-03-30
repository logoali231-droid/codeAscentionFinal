import { pipeline, env } from '@xenova/transformers';

// Skip local checks for models and use the Hugging Face cache
env.allowLocalModels = false;

class LocalAIWorker {
    static instance: any = null;

    static async getInstance(progress_callback?: (data: any) => void) {
        if (this.instance === null) {
            this.instance = pipeline('text-generation', 'Xenova/TinyLlama-1.1B-Coder-v1.0', {
                progress_callback,
            });
        }
        return this.instance;
    }
}

// Listen for messages from the main thread
self.onmessage = async (event) => {
    const { text, task, generation_config } = event.data;

    try {
        const generator = await LocalAIWorker.getInstance((data) => {
            // Send progress updates back to the main thread
            self.postMessage({ status: 'progress', data });
        });

        const output = await generator(text, {
            max_new_tokens: 256,
            temperature: 0.7,
            do_sample: true,
            top_k: 50,
            ...generation_config,
            // Return only the newly generated text
            return_full_text: false,
        });

        self.postMessage({
            status: 'complete',
            output: output[0].generated_text,
        });
    } catch (error: any) {
        self.postMessage({
            status: 'error',
            error: error.message,
        });
    }
};
