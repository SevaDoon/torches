/*
 * The self-check, headless: `npm run check`. The engine uses only what both a
 * browser and Node ship (DecompressionStream, Blob, TextDecoder), so the same
 * suite that prints to the dev console can gate a build.
 */
import { runSelfCheck } from './selfcheck';

const problems = await runSelfCheck();
if (problems.length) (globalThis as unknown as { process: { exitCode: number } }).process.exitCode = 1;
