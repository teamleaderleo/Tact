import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
if (!process.env.ELATURA_ROOT) throw new Error('Set ELATURA_ROOT to the pinned, built Elatura checkout');
const core = process.env.ELATURA_CORE_DIST ?? resolve(process.env.ELATURA_ROOT, 'packages/core/dist');
export const { ApplicationLaneRuntimeV1 } = await import(pathToFileURL(`${core}/application-lane-runtime.js`));
export const lifecycle = await import(pathToFileURL(`${core}/application-lane-lifecycle.js`));
