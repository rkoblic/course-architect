import Anthropic from '@anthropic-ai/sdk'

// Client-side: we'll make API calls through our Next.js routes
// Server-side: we use the Anthropic SDK directly

let anthropic: Anthropic | null = null

export function getAnthropicClient(): Anthropic {
  if (!anthropic) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set')
    }
    anthropic = new Anthropic({
      apiKey,
    })
  }
  return anthropic
}

export interface StreamMessage {
  type: 'content_block_delta' | 'message_stop' | 'error'
  delta?: { text?: string }
  error?: string
}

export async function* streamClaude(
  systemPrompt: string,
  userMessage: string,
  options?: {
    maxTokens?: number
    temperature?: number
  }
): AsyncGenerator<string, void, unknown> {
  const client = getAnthropicClient()

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: options?.maxTokens || 4096,
    temperature: options?.temperature ?? 0.7,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userMessage,
      },
    ],
  })

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      yield event.delta.text
    }
  }
}

export async function callClaude(
  systemPrompt: string,
  userMessage: string,
  options?: {
    maxTokens?: number
    temperature?: number
  }
): Promise<string> {
  const client = getAnthropicClient()

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: options?.maxTokens || 4096,
    temperature: options?.temperature ?? 0.7,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userMessage,
      },
    ],
  })

  const textBlock = response.content.find((block) => block.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude')
  }

  return textBlock.text
}
