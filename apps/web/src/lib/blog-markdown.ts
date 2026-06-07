function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function slugifyHeading(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    || 'section';
}

function formatInline(text: string): string {
  let html = escapeHtml(text);
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="text-orange-600 hover:underline font-semibold" target="_blank" rel="noopener noreferrer">$1</a>',
  );
  return html;
}

export function markdownToHtml(markdown: string): string {
  const lines = markdown.split('\n');
  const parts: string[] = [];
  let listOpen = false;

  const closeList = () => {
    if (listOpen) {
      parts.push('</ul>');
      listOpen = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (line.startsWith('### ')) {
      closeList();
      const text = line.slice(4).trim();
      const id = slugifyHeading(text);
      parts.push(`<h3 id="${id}">${formatInline(text)}</h3>`);
      continue;
    }

    if (line.startsWith('## ')) {
      closeList();
      const text = line.slice(3).trim();
      const id = slugifyHeading(text);
      parts.push(`<h2 id="${id}">${formatInline(text)}</h2>`);
      continue;
    }

    if (line.startsWith('# ')) {
      closeList();
      const text = line.slice(2).trim();
      parts.push(`<h1>${formatInline(text)}</h1>`);
      continue;
    }

    if (line.startsWith('- ')) {
      if (!listOpen) {
        parts.push('<ul>');
        listOpen = true;
      }
      parts.push(`<li>${formatInline(line.slice(2).trim())}</li>`);
      continue;
    }

    if (!line.trim()) {
      closeList();
      continue;
    }

    closeList();
    parts.push(`<p>${formatInline(line)}</p>`);
  }

  closeList();
  return parts.join('\n');
}
