import { defineConfig, globalIgnores } from 'eslint/config';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextCoreWebVitals,
  ...nextTypeScript,
  globalIgnores(['.next/**', 'node_modules/**', 'dist/**', 'coverage/**']),
  {
    files: ['**/*.{ts,tsx,js,mjs,cjs}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
      'react-hooks/static-components': 'warn',
      'react-hooks/use-memo': 'warn',
      '@typescript-eslint/no-namespace': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/error-boundaries': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/rules-of-hooks': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react/no-unescaped-entities': 'warn',
      'react/jsx-no-undef': 'warn',
      '@next/next/no-html-link-for-pages': 'warn',
      'prefer-const': 'warn',
    },
  },
  {
    files: [
      'src/lib/admin-api.ts',
      'src/lib/hooks.ts',
      'src/components/dashboard/DynamicDashboard.tsx',
      'src/app/analiz/page.tsx',
      'src/components/admin/BlogEditorWithAI.tsx',
      'src/components/landing/VoiceSearch.tsx',
      'src/app/admin/notifications/page.tsx',
      'src/app/dashboard/ai-tools/content-studio/page.tsx',
      'src/lib/api-client.ts',
      'src/app/dashboard/security/page.tsx',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
]);
