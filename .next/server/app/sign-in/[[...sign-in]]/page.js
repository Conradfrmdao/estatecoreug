const CHUNK_PUBLIC_PATH = "server/app/sign-in/[[...sign-in]]/page.js";
const runtime = require("../../../chunks/ssr/[turbopack]_runtime.js");
runtime.loadChunk("server/chunks/ssr/node_modules_next_9f14e2._.js");
runtime.loadChunk("server/chunks/ssr/_812e8e._.js");
runtime.loadChunk("server/chunks/ssr/node_modules_@clerk_backend_dist_ba645c._.js");
runtime.loadChunk("server/chunks/ssr/node_modules_d7a773._.js");
runtime.loadChunk("server/chunks/ssr/app_e33d29._.js");
runtime.getOrInstantiateRuntimeModule("[project]/.next-internal/server/app/sign-in/[[...sign-in]]/page/actions.js { ACTIONS_MODULE0 => \"[project]/node_modules/@clerk/nextjs/dist/esm/app-router/server-actions.js [app-rsc] (ecmascript, action, ecmascript)\" } [app-rsc] (ecmascript)", CHUNK_PUBLIC_PATH);
module.exports = runtime.getOrInstantiateRuntimeModule("[project]/node_modules/next/dist/esm/build/templates/app-page.js?page=/sign-in/[[...sign-in]]/page { COMPONENT_0 => \"[project]/app/layout.tsx [app-rsc] (ecmascript, Next.js server component)\", COMPONENT_1 => \"[project]/node_modules/next/dist/client/components/not-found-error.js [app-rsc] (ecmascript, Next.js server component)\", COMPONENT_2 => \"[project]/app/sign-in/[[...sign-in]]/page.tsx [app-rsc] (ecmascript, Next.js server component)\" } [app-rsc] (ecmascript) <facade>", CHUNK_PUBLIC_PATH).exports;
