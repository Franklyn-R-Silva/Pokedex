// Baixa uma imagem por URL (blob) com fallback de abrir em nova aba.
export async function downloadImage(url: string, name: string): Promise<void> {
  if (!url) return;
  const extension = url.split('.').pop()?.split('?')[0] || 'png';
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = `${name}.${extension}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(url, '_blank');
  }
}
