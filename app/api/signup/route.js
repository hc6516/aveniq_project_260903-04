import { handleSignup } from '../../../lib/signup.mjs';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(request) { return handleSignup(request); }
