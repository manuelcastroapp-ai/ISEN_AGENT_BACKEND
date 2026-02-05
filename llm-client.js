require('dotenv').config();

class LLMClient {
  constructor() {
    this.provider = (process.env.LLM_PROVIDER || 'auto').toLowerCase();
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    this.baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

    this.localUrl = process.env.LOCAL_LLM_URL || 'http://127.0.0.1:11434';
    this.localModel = process.env.LOCAL_LLM_MODEL || '';
    this.localType = (process.env.LOCAL_LLM_TYPE || 'ollama').toLowerCase();
    this.localApiKey = process.env.LOCAL_LLM_API_KEY || '';
    this.localModelResolved = null;
  }

  isEnabled() {
    if (this.provider === 'openai') return Boolean(this.apiKey);
    if (this.provider === 'ollama' || this.provider === 'local' || this.provider === 'openai-compat') return true;
    if (this.provider === 'auto') return true;
    return false;
  }

  async health() {
    if (this.provider === 'openai') {
      return { ok: Boolean(this.apiKey), provider: 'openai', model: this.model };
    }

    const localProvider = this.localType === 'openai-compat' ? 'openai-compat' : 'ollama';
    try {
      const info = localProvider === 'openai-compat'
        ? await this.fetchJson(`${this.normalizeOpenAIBase(this.localUrl)}/models`)
        : await this.fetchJson(`${this.normalizeBaseUrl(this.localUrl)}/api/tags`);
      return {
        ok: true,
        provider: localProvider,
        model: await this.resolveLocalModel(),
        detail: info?.models ? `${info.models.length} models` : 'ok'
      };
    } catch (error) {
      return { ok: false, provider: localProvider, model: this.localModel || null, error: error.message };
    }
  }

  async chat(messages, opts = {}) {
    if (!this.isEnabled()) {
      return { ok: false, error: 'LLM not configured.', provider: null, model: null };
    }

    if (this.provider === 'openai') {
      return this.chatOpenAI(messages, opts);
    }

    if (this.provider === 'openai-compat') {
      return this.chatOpenAICompat(messages, opts);
    }

    if (this.provider === 'ollama' || this.provider === 'local') {
      return this.chatOllama(messages, opts);
    }

    // auto: try local first, then OpenAI if configured
    const localAttempt = this.localType === 'openai-compat'
      ? await this.chatOpenAICompat(messages, opts)
      : await this.chatOllama(messages, opts);
    if (localAttempt.ok) return localAttempt;
    if (this.apiKey) {
      return this.chatOpenAI(messages, opts);
    }
    return localAttempt;
  }

  async chatOllama(messages, opts = {}) {
    const base = this.normalizeBaseUrl(this.localUrl);
    const model = await this.resolveLocalModel();
    if (!model) {
      return {
        ok: false,
        error: 'Local LLM not available. Start Ollama and pull a model (e.g., ollama pull llama3.1:8b).',
        provider: 'ollama',
        model: null
      };
    }

    const body = {
      model,
      messages,
      stream: false,
      options: {
        temperature: opts.temperature ?? 0.2,
        num_predict: opts.max_tokens ?? 800
      }
    };

    const res = await this.fetchWithTimeout(`${base}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }, opts.timeoutMs);

    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: `Local LLM error ${res.status}: ${text}`, provider: 'ollama', model };
    }

    const data = await res.json();
    const content = data?.message?.content || data?.response || '';
    return { ok: true, content, provider: 'ollama', model };
  }

  async chatOpenAICompat(messages, opts = {}) {
    const base = this.normalizeOpenAIBase(this.localUrl);
    const model = this.localModel || 'local-model';
    const body = {
      model,
      messages,
      temperature: opts.temperature ?? 0.2,
      max_tokens: opts.max_tokens ?? 800
    };

    const headers = { 'Content-Type': 'application/json' };
    if (this.localApiKey) {
      headers.Authorization = `Bearer ${this.localApiKey}`;
    }

    const res = await this.fetchWithTimeout(`${base}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    }, opts.timeoutMs);

    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: `Local LLM error ${res.status}: ${text}`, provider: 'openai-compat', model };
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    return { ok: true, content, provider: 'openai-compat', model };
  }

  async chatOpenAI(messages, opts = {}) {
    if (!this.apiKey) {
      return { ok: false, error: 'LLM not configured. Set OPENAI_API_KEY.', provider: 'openai', model: this.model };
    }
    const base = this.normalizeOpenAIBase(this.baseUrl);
    const body = {
      model: this.model,
      messages,
      temperature: opts.temperature ?? 0.2,
      max_tokens: opts.max_tokens ?? 800
    };

    const res = await this.fetchWithTimeout(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(body)
    }, opts.timeoutMs);

    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: `LLM error ${res.status}: ${text}`, provider: 'openai', model: this.model };
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    return { ok: true, content, provider: 'openai', model: this.model };
  }

  async resolveLocalModel() {
    if (this.localModel) return this.localModel;
    if (this.localModelResolved) return this.localModelResolved;
    if (this.localType !== 'ollama') return '';
    try {
      const data = await this.fetchJson(`${this.normalizeBaseUrl(this.localUrl)}/api/tags`);
      const name = data?.models?.[0]?.name || '';
      if (name) this.localModelResolved = name;
      return name;
    } catch {
      return '';
    }
  }

  normalizeBaseUrl(value) {
    return String(value || '').replace(/\/+$/, '');
  }

  normalizeOpenAIBase(value) {
    const base = this.normalizeBaseUrl(value);
    if (base.endsWith('/v1')) return base;
    return `${base}/v1`;
  }

  async fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(timeout);
    }
  }

  async fetchJson(url, timeoutMs = 8000) {
    const res = await this.fetchWithTimeout(url, { method: 'GET' }, timeoutMs);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`LLM health error ${res.status}: ${text}`);
    }
    return res.json();
  }
}

module.exports = LLMClient;
