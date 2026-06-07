import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');
const PT = 'pt-[calc(5.25rem+env(safe-area-inset-top,0px))]';
const BG = 'bg-[#FAFAF9] dark:bg-[#0B1120]';

const REPLACEMENTS = [
  [/dark:bg-\[#02040a\]/g, 'dark:bg-[#0B1120]'],
  [/dark:bg-\[#020617\]/g, 'dark:bg-[#0B1120]'],
  [/dark:bg-\[#03060f\]/g, 'dark:bg-[#0B1120]'],
  [/dark:bg-\[#0F172A\]/g, 'dark:bg-[#0B1120]'],
  [/bg-white dark:bg-\[#0B1120\]/g, BG],
  [/bg-slate-50 dark:bg-\[#0B1120\]/g, BG],
  [/min-h-screen pt-32 pb-24/g, `min-h-screen ${PT} pb-24`],
  [/min-h-screen pt-32/g, `min-h-screen ${PT}`],
  [/min-h-screen pt-28/g, `min-h-screen ${PT}`],
  [/min-h-screen pt-20/g, `min-h-screen ${PT}`],
  [/relative pt-32 pb-/g, 'relative pt-8 sm:pt-12 pb-'],
  [/relative pt-32 overflow/g, 'relative pt-8 sm:pt-12 overflow'],
  [/min-h-screen pt-40/g, `min-h-screen ${PT}`],
];

const BG_EFFECTS_BLOCK =
  /\{\/\* Background Effects \*\/\}\s*<div className="absolute inset-0 pointer-events-none overflow-hidden">[\s\S]*?<\/div>\s*/g;

const BG_BLOCK =
  /\{\/\* Background \*\/\}\s*<div className="fixed inset-0 pointer-events-none">[\s\S]*?<\/div>\s*/g;

const IMPORT_LINE = "import MarketingPageShell from '@/components/landing/MarketingPageShell';";
const OLD_SECTION =
  /<section className="min-h-screen pt-\[calc\(5\.25rem\+env\(safe-area-inset-top,0px\)\)\] pb-24 relative overflow-hidden bg-\[#FAFAF9\] dark:bg-\[#0B1120\] transition-colors duration-500">/g;
const OLD_SECTION_ALT =
  /<section className="min-h-screen pt-\[calc\(5\.25rem\+env\(safe-area-inset-top,0px\)\)\] pb-24 relative overflow-hidden bg-\[#FAFAF9\] dark:bg-\[#0B1120\]">/g;

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.next'].includes(entry.name)) walk(full, files);
    } else if (/\.(tsx|ts|jsx|js)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

const targets = walk(root).filter((f) =>
  f.includes(`${path.sep}app${path.sep}(landing)${path.sep}`) ||
  f.includes(`${path.sep}components${path.sep}`) && !f.includes(`${path.sep}admin${path.sep}`),
);

let changed = 0;
for (const file of targets) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  for (const [pattern, replacement] of REPLACEMENTS) {
    content = content.replace(pattern, replacement);
  }

  if (file.includes(`${path.sep}app${path.sep}(landing)${path.sep}`)) {
    content = content.replace(BG_EFFECTS_BLOCK, '');
    content = content.replace(BG_BLOCK, '');

    if (
      (content.includes('min-h-screen pt-[calc(5.25rem+env(safe-area-inset-top,0px))] pb-24 relative overflow-hidden bg-[#FAFAF9] dark:bg-[#0B1120]') ||
        content.includes('min-h-screen pt-[calc(5.25rem+env(safe-area-inset-top,0px))] pb-24 relative overflow-hidden bg-[#FAFAF9] dark:bg-[#0B1120] transition-colors duration-500')) &&
      content.includes('<section className="min-h-screen')
    ) {
      if (!content.includes(IMPORT_LINE)) {
        const useClient = content.startsWith('"use client"') || content.startsWith("'use client'");
        if (useClient) {
          content = content.replace(/^(["']use client["'];\s*\n)/, `$1\n${IMPORT_LINE}\n`);
        } else {
          content = `import MarketingPageShell from '@/components/landing/MarketingPageShell';\n${content}`;
        }
      }
      content = content.replace(
        OLD_SECTION,
        '<MarketingPageShell as="section" className="pb-24" padded={false}>',
      );
      content = content.replace(
        OLD_SECTION_ALT,
        '<MarketingPageShell as="section" className="pb-24" padded={false}>',
      );
      content = content.replace(
        /<section className="min-h-screen pt-\[calc\(5\.25rem\+env\(safe-area-inset-top,0px\)\)\] pb-24 relative overflow-hidden bg-\[#FAFAF9\] dark:bg-\[#0B1120\] transition-colors duration-500">/g,
        '<MarketingPageShell as="section" className="pb-24" padded={false}>',
      );
      content = content.replace(
        /<section className="min-h-screen pt-\[calc\(5\.25rem\+env\(safe-area-inset-top,0px\)\)\] pb-24 bg-\[#FAFAF9\] dark:bg-\[#0B1120\]">/g,
        '<MarketingPageShell as="section" className="pb-24" padded={false}>',
      );
      content = content.replace(
        /<section className="min-h-screen pt-\[calc\(5\.25rem\+env\(safe-area-inset-top,0px\)\)\] pb-24 bg-slate-50 dark:bg-\[#0B1120\]">/g,
        '<MarketingPageShell as="section" className="pb-24" padded={false}>',
      );
      // close tag — only last section close in simple pages
      if (content.includes('<MarketingPageShell as="section"') && content.includes('</section>')) {
        const parts = content.split('</section>');
        if (parts.length === 2) {
          content = parts[0] + '</MarketingPageShell>' + parts[1];
        }
      }
    }
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changed += 1;
    console.log('updated:', path.relative(root, file));
  }
}

console.log(`Done. ${changed} files updated.`);
