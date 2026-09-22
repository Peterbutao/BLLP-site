import adapter from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => filename.split(/[/\\]/).includes('node_modules') ? undefined : true
	},
	kit: {
		// adapter-cloudflare for Cloudflare Pages / Workers with static assets
		// Works with `prerender = true` (src/routes/+layout.ts) — fully static site
		// but deployed via Cloudflare's Workers runtime for edge caching & headers
		adapter: adapter({
			// https://svelte.dev/docs/kit/adapter-cloudflare
			// default handles both Pages + Workers; no extra config needed for static
		})
	}
};

export default config;
