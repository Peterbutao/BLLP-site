<script lang="ts">
	import favicon from '$lib/assets/favicon.png';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/fontsource-inter@5.0.0/index.min.css" />
	<title>Worship Night (Live Recording) — Living Waters Church International — 4 Oct 2026</title>
	<meta name="description" content="Join us for Worship Night (Live Recording) at Living Waters Church International — Bwaila City of Eagles, Lilongwe. Sunday 4th Oct 2026, 5:30PM – 9:00PM. Let everything that has breath praise the Lord!" />
	<meta name="keywords" content="Worship Night, Living Waters Church, Bwaila, Lilongwe, Malawi, Live Recording, Gospel, Choir" />
	<meta name="author" content="Living Waters Church International" />
	<meta name="theme-color" content="#1A3A8F" />
	<link rel="canonical" href="https://worshipnight-livingwaters.pages.dev/" />

	<!-- Open Graph / Facebook / WhatsApp -->
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Living Waters Church International" />
	<meta property="og:locale" content="en_MW" />
	<meta property="og:url" content="https://worshipnight-livingwaters.pages.dev/" />
	<meta property="og:title" content="Worship Night (Live Recording) — Living Waters Church International" />
	<meta property="og:description" content="Sunday 4th Oct 2026, 5:30PM – 9:00PM at Bwaila City of Eagles, Lilongwe. Join the choir for a powerful Worship Night live recording." />
	<meta property="og:image" content="https://worshipnight-livingwaters.pages.dev/og-image.jpg" />
	<meta property="og:image:secure_url" content="https://worshipnight-livingwaters.pages.dev/og-image.jpg" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="Worship Night choir at Living Waters Church International — Bwaila City of Eagles" />
	<meta property="og:image:type" content="image/jpeg" />

	<!-- Twitter / X -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Worship Night (Live Recording) — Living Waters Church International" />
	<meta name="twitter:description" content="Sunday 4th Oct 2026, 5:30PM – 9:00PM • Bwaila City of Eagles, Lilongwe • Contact Jemimah Mhango +265 882 06 68 60" />
	<meta name="twitter:image" content="https://worshipnight-livingwaters.pages.dev/og-image.jpg" />
	<meta name="twitter:image:alt" content="Worship Night choir — Living Waters Church International" />

	<!-- Additional social -->
	<meta name="apple-mobile-web-app-title" content="Worship Night" />
	<link rel="apple-touch-icon" href="/logo.png" />

	<!-- Structured Data: Event -->
	{@html `<script type="application/ld+json">${JSON.stringify({
		"@context": "https://schema.org",
		"@type": "MusicEvent",
		name: "Worship Night (Live Recording)",
		description: "Worship Night live recording at Living Waters Church International — Bwaila City of Eagles",
		startDate: "2026-10-04T17:30:00+02:00",
		endDate: "2026-10-04T21:00:00+02:00",
		eventStatus: "https://schema.org/EventScheduled",
		eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
		location: {
			"@type": "Place",
			name: "Living Waters Church International — Bwaila City of Eagles",
			address: {
				"@type": "PostalAddress",
				addressLocality: "Lilongwe",
				addressRegion: "Central Region",
				addressCountry: "MW"
			},
			geo: {
				"@type": "GeoCoordinates",
				latitude: -13.975334,
				longitude: 33.7634107
			},
			url: "https://maps.app.goo.gl/yGSBEXCcB2UogxH27"
		},
		image: ["https://worshipnight-livingwaters.pages.dev/og-image.jpg", "https://worshipnight-livingwaters.pages.dev/DSC_0888.jpg-Photoroom.png"],
		organizer: {
			"@type": "Organization",
			name: "Living Waters Church International",
			url: "https://worshipnight-livingwaters.pages.dev/"
		},
		performer: {
			"@type": "MusicGroup",
			name: "Living Waters Choir"
		},
		offers: {
			"@type": "Offer",
			price: "0",
			priceCurrency: "MWK",
			availability: "https://schema.org/InStock",
			url: "https://worshipnight-livingwaters.pages.dev/"
		}
	})}<\/script>`}
</svelte:head>

{@render children()}
