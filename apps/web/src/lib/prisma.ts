import 'server-only';

// Load Prisma from the workspace database package (serverExternalPackages).
// Avoid createRequire here — it breaks under Turbopack with "require is not a function".
export { prisma } from '@pazaryonetimi/database';
