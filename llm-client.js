require('dotenv').config();

class LLMClient {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    this.baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
  }

  isEnabled() {
    return Boolean(this.apiKey);
  }

  async chat(messages, opts = {}) {
    if (!this.isEnabled()) {
      return { ok: false, error: 'LLM not configured. Set OPENAI_API_KEY.' };
    }
    const body = {
      model: this.model,
      messages,
      temperature: opts.temperature ?? 0.2,
      max_tokens: opts.max_tokens ?? 800
    };

    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: `LLM error ${res.status}: ${text}` };
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    return { ok: true, content };
  }
}

module.exports = LLMClient;
