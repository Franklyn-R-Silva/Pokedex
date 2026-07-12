// Tradução EN → PT-BR do conteúdo da PokéAPI (que não tem português).
// Usa a API pública do MyMemory e faz cache em memória + localStorage.

const LS_KEY = 'pokedex-translations';
const memory = new Map<string, string>();

const lsCache: Record<string, string> = load();

function load(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? '{}') as Record<string, string>;
  } catch {
    return {};
  }
}

function persist(): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(lsCache));
  } catch {
    /* ignora falha ao gravar cache */
  }
}

/** Traduz um texto EN → PT-BR (retorna o original em caso de falha). */
export async function translateToPt(text: string): Promise<string> {
  const clean = text.trim();
  if (!clean) return text;

  const cached = memory.get(clean) ?? lsCache[clean];
  if (cached) {
    memory.set(clean, cached);
    return cached;
  }

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean)}&langpair=en|pt-BR`;
    const response = await fetch(url);
    if (!response.ok) return text;
    const data = (await response.json()) as { responseData?: { translatedText?: string } };
    const translated = data.responseData?.translatedText;

    // Descarta avisos de cota/erro do MyMemory.
    if (!translated || /mymemory warning|invalid|quota/i.test(translated)) return text;

    memory.set(clean, translated);
    lsCache[clean] = translated;
    persist();
    return translated;
  } catch {
    return text;
  }
}
