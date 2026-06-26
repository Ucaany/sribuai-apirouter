export type Model = {
  name: string
  provider: string
  contextWindow: string
  badge: 'Free' | 'Pro'
  description: string
}

export const models: Model[] = [
  { name: 'Claude Sonnet 4.5', provider: 'Anthropic', contextWindow: '200K', badge: 'Pro', description: 'Model terbaru Anthropic dengan kemampuan reasoning tinggi' },
  { name: 'Claude Opus 4.7', provider: 'Anthropic', contextWindow: '200K', badge: 'Pro', description: 'Model paling powerful dari Anthropic' },
  { name: 'Claude 3.5 Haiku', provider: 'Anthropic', contextWindow: '200K', badge: 'Free', description: 'Model cepat dan efisien untuk tugas ringan' },
  { name: 'GPT-4o', provider: 'OpenAI', contextWindow: '128K', badge: 'Pro', description: 'Model flagship OpenAI dengan multimodal' },
  { name: 'GPT-4o Mini', provider: 'OpenAI', contextWindow: '128K', badge: 'Free', description: 'Versi ringan GPT-4o, cepat dan murah' },
  { name: 'GPT-4', provider: 'OpenAI', contextWindow: '128K', badge: 'Pro', description: 'GPT-4 dengan performa tinggi' },
  { name: 'GPT-3.5 Turbo', provider: 'OpenAI', contextWindow: '16K', badge: 'Free', description: 'Cepat dan hemat untuk tugas ringan' },
  { name: 'Gemini Pro', provider: 'Google', contextWindow: '32K', badge: 'Pro', description: 'Model Google Gemini Pro' },
  { name: 'Gemini 1.5 Pro', provider: 'Google', contextWindow: '1M', badge: 'Pro', description: 'Model Google dengan context window 1M token' },
  { name: 'Gemini Flash', provider: 'Google', contextWindow: '1M', badge: 'Free', description: 'Model cepat dari Google untuk tugas ringan' },
  { name: 'DeepSeek V3', provider: 'DeepSeek', contextWindow: '128K', badge: 'Free', description: 'Model open-source dengan performa tinggi' },
  { name: 'DeepSeek R1', provider: 'DeepSeek', contextWindow: '128K', badge: 'Pro', description: 'Model reasoning dari DeepSeek' },
  { name: 'Llama 3.1 70B', provider: 'Meta', contextWindow: '128K', badge: 'Free', description: 'Model open-source dari Meta' },
  { name: 'Llama 3.1 8B', provider: 'Meta', contextWindow: '128K', badge: 'Free', description: 'Model ringan untuk deployment lokal' },
  { name: 'Mistral Large', provider: 'Mistral', contextWindow: '128K', badge: 'Pro', description: 'Model flagship dari Mistral AI' },
  { name: 'Mistral Medium', provider: 'Mistral', contextWindow: '128K', badge: 'Free', description: 'Model seimbang dari Mistral AI' },
  { name: 'Qwen 2.5 72B', provider: 'Alibaba', contextWindow: '128K', badge: 'Free', description: 'Model dari Alibaba Cloud' },
  { name: 'Yi Large', provider: 'Yi', contextWindow: '200K', badge: 'Pro', description: 'Model dari Yi dengan context panjang' },
]

export const providers = ['All', 'Anthropic', 'OpenAI', 'Google', 'DeepSeek', 'Meta', 'Mistral', 'Alibaba', 'Yi']
