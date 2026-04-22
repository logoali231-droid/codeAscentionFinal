
import * as webllm from "@mlc-ai/web-llm";

// O tipo correto na versão nova é MLCEngineInterface
let engine: webllm.MLCEngineInterface | null = null;

export async function getAiEngine() {
  if (engine) return engine;

  // Se você estiver usando as versões mais novas (v0.2.x+),
  // a função correta é CreateMLCEngine
  const selectedModel = "Phi-3-mini-4k-instruct-q4f16_1-MLC";
  
  engine = await webllm.CreateMLCEngine(selectedModel, {
    initProgressCallback: (report) => console.log(report.text),
  });
  
  return engine;
}