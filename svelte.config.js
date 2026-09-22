import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => filename.split(/[/\\]/).includes('node_modules') ? undefined : true
	},
	kit: {
		// adapter-static is perfect for Cloudflare Pages (static hosting)
		// All routes are prerendered (see src/routes/+layout.ts: prerender = true)
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: undefined, // no SPA fallback - 404 for unknown routes
			precompress: false,
			strict: true
		})
	}
};

export default config;
