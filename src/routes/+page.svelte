<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let days = $state('00');
	let hours = $state('00');
	let minutes = $state('00');
	let seconds = $state('00');
	let rsvpText = $state('Join Us');
	let rsvpActive = $state(false);
	let locateText = $state('Use My Location');
	let locating = $state(false);
	let showCalendar = $state(false);

	let countdownInterval: ReturnType<typeof setInterval> | undefined;
	let map: any = null;
	let userMarker: any = null;
	let userLine: any = null;

	const CHURCH_LAT = -13.975334;
	const CHURCH_LNG = 33.7634107;
	const MAPS_SHORT_URL = 'https://maps.app.goo.gl/yGSBEXCcB2UogxH27';
	const whatsappUrl =
		'https://wa.me/265882066860?text=Hello%20Jemimah%20Mhango%2C%20I%20would%20like%20more%20details%20about%20the%20Worship%20Night%20on%204th%20Oct%202026%20at%20Living%20Waters%20Church%20International.';
	const EVENT_TITLE = 'Worship Night (Live Recording) — Living Waters Church International';
	const EVENT_LOCATION = 'Living Waters Church International — Bwaila City of Eagles, Lilongwe, Malawi';
	const EVENT_DESCRIPTION =
		'Join us for Worship Night (Live Recording) at Living Waters Church International — Bwaila City of Eagles, Lilongwe. Sunday 4th Oct 2026, 5:30PM – 9:00PM. Let everything that has breath praise the Lord!';

	// Calendar helpers — Malawi is CAT (UTC+2)
	const EVENT_START_UTC = '20261004T153000Z';
	const EVENT_END_UTC = '20261004T190000Z';
	const EVENT_START_OUTLOOK = '2026-10-04T15:30:00Z';
	const EVENT_END_OUTLOOK = '2026-10-04T19:00:00Z';

	function getGoogleCalendarUrl() {
		const params = new URLSearchParams({
			action: 'TEMPLATE',
			text: EVENT_TITLE,
			dates: `${EVENT_START_UTC}/${EVENT_END_UTC}`,
			details: EVENT_DESCRIPTION,
			location: EVENT_LOCATION
		});
		return `https://calendar.google.com/calendar/render?${params.toString()}`;
	}

	function getOutlookCalendarUrl() {
		const params = new URLSearchParams({
			path: '/calendar/action/compose',
			rrule: '',
			subject: EVENT_TITLE,
			body: EVENT_DESCRIPTION,
			location: EVENT_LOCATION,
			startdt: EVENT_START_OUTLOOK,
			enddt: EVENT_END_OUTLOOK
		});
		return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
	}

	function getYahooCalendarUrl() {
		// Yahoo expects UTC times without Z but with duration
		const params = new URLSearchParams({
			v: '60',
			title: EVENT_TITLE,
			st: '20261004T153000Z',
			et: '20261004T190000Z',
			desc: EVENT_DESCRIPTION,
			in_loc: EVENT_LOCATION
		});
		return `https://calendar.yahoo.com/?${params.toString()}`;
	}

	function downloadICS() {
		const ics = [
			'BEGIN:VCALENDAR',
			'VERSION:2.0',
			'PRODID:-//Living Waters Church//Worship Night 2026//EN',
			'CALSCALE:GREGORIAN',
			'BEGIN:VEVENT',
			`UID:worship-night-2026@worshipnight-livingwaters.pages.dev`,
			`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
			`DTSTART:${EVENT_START_UTC}`,
			`DTEND:${EVENT_END_UTC}`,
			`SUMMARY:${EVENT_TITLE}`,
			`DESCRIPTION:${EVENT_DESCRIPTION.replace(/\n/g, '\\n')}`,
			`LOCATION:${EVENT_LOCATION}`,
			'STATUS:CONFIRMED',
			'END:VEVENT',
			'END:VCALENDAR'
		].join('\r\n');

		const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'Worship-Night-2026-10-04.ics';
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
		showCalendar = false;
	}

	function updateCountdown() {
		const eventDate = new Date('2026-10-04T17:30:00');
		const now = new Date();
		const diff = eventDate.getTime() - now.getTime();
		if (diff <= 0) {
			days = hours = minutes = seconds = '00';
			return;
		}
		const d = Math.floor(diff / (1000 * 60 * 60 * 24));
		const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
		const s = Math.floor((diff % (1000 * 60)) / 1000);
		days = String(d).padStart(2, '0');
		hours = String(h).padStart(2, '0');
		minutes = String(m).padStart(2, '0');
		seconds = String(s).padStart(2, '0');
	}

	function handleRSVP(e: Event) {
		e.preventDefault();
		rsvpText = '✓ See You There!';
		rsvpActive = true;
		setTimeout(() => {
			rsvpText = 'Join Us';
			rsvpActive = false;
		}, 2500);
	}

	async function initMap() {
		if (!browser) return;
		const mapEl = document.getElementById('interactive-map');
		if (!mapEl) return;
		try {
			const L = await import('leaflet');
			// Fix default icon paths for SvelteKit
			// @ts-ignore
			delete (L.Icon.Default.prototype as any)._getIconUrl;
			L.Icon.Default.mergeOptions({
				iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
				iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
				shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
			});

			map = L.map('interactive-map', {
				center: [CHURCH_LAT, CHURCH_LNG],
				zoom: 16,
				scrollWheelZoom: true,
				dragging: true,
				zoomControl: true
			});

			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
				maxZoom: 19
			}).addTo(map);

			const churchIcon = L.divIcon({
				className: 'custom-marker',
				html: '<div style="background:linear-gradient(135deg,#F26522,#F7C948);width:36px;height:36px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center"><span style="transform:rotate(45deg);display:flex;align-items:center;justify-content:center"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v16M8 8h8"/></svg></span></div>',
				iconSize: [36, 36],
				iconAnchor: [18, 36],
				popupAnchor: [0, -36]
			});

			const popupHtml = `
				<div class="map-popup">
					<h4>Living Waters Church</h4>
					<p>City Of Eagles &mdash; Bwaila<br>Lilongwe, Malawi</p>
					<p style="font-size:0.75rem;color:#999;">Sun, 4 Oct 2026 &middot; 5:30PM - 9:00PM</p>
					<a href="${MAPS_SHORT_URL}" target="_blank" rel="noopener">Get Directions →</a>
				</div>`;

			L.marker([CHURCH_LAT, CHURCH_LNG], { icon: churchIcon }).addTo(map).bindPopup(popupHtml).openPopup();

			L.circle([CHURCH_LAT, CHURCH_LNG], {
				radius: 80,
				color: '#1A3A8F',
				fillColor: '#1ABFBF',
				fillOpacity: 0.15,
				weight: 2
			}).addTo(map);

			setTimeout(() => map.invalidateSize(), 300);
			const mapObserver = new IntersectionObserver(
				(entries) => {
					entries.forEach((e) => {
						if (e.isIntersecting) setTimeout(() => map.invalidateSize(), 200);
					});
				},
				{ threshold: 0.1 }
			);
			mapObserver.observe(mapEl);
		} catch (e) {
			console.error('Leaflet failed', e);
		}
	}

	function handleLocate() {
		if (!browser || !map) {
			window.open(MAPS_SHORT_URL, '_blank');
			return;
		}
		if (!navigator.geolocation) {
			alert('Geolocation not supported. Opening directions...');
			window.open(MAPS_SHORT_URL, '_blank');
			return;
		}
		locating = true;
		locateText = 'Locating...';
		navigator.geolocation.getCurrentPosition(
			async (pos) => {
				const lat = pos.coords.latitude;
				const lng = pos.coords.longitude;
				locateText = '✓ Located — Navigate';
				locating = false;

				const L = await import('leaflet');
				if (userMarker) map.removeLayer(userMarker);
				if (userLine) map.removeLayer(userLine);

				userMarker = L.marker([lat, lng], {
					icon: L.divIcon({
						className: 'user-marker',
						html: '<div style="background:#1A3A8F;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>',
						iconSize: [16, 16],
						iconAnchor: [8, 8]
					})
				})
					.addTo(map)
					.bindPopup('You are here')
					.openPopup();

				userLine = L.polyline(
					[
						[lat, lng],
						[CHURCH_LAT, CHURCH_LNG]
					],
					{
						color: '#F26522',
						weight: 4,
						opacity: 0.7,
						dashArray: '8, 10'
					}
				).addTo(map);

				map.fitBounds(L.latLngBounds([[lat, lng], [CHURCH_LAT, CHURCH_LNG]]).pad(0.3));

				const dirUrl = `https://www.google.com/maps/dir/?api=1&origin=${lat},${lng}&destination=${CHURCH_LAT},${CHURCH_LNG}`;
				window.open(dirUrl, '_blank', 'noopener');
			},
			(err) => {
				locateText = 'Use My Location';
				locating = false;
				alert('Could not get location: ' + err.message + '\nOpening directions...');
				window.open(MAPS_SHORT_URL, '_blank');
			},
			{ enableHighAccuracy: true, timeout: 8000 }
		);
	}

	onMount(() => {
		updateCountdown();
		countdownInterval = setInterval(updateCountdown, 1000);

		// Scroll reveal
		const reveals = document.querySelectorAll('.reveal');
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) entry.target.classList.add('visible');
				});
			},
			{ threshold: 0.1 }
		);
		reveals.forEach((el) => observer.observe(el));

		// Parallax
		const onScroll = () => {
			const scrolled = window.pageYOffset;
			const banner = document.querySelector('.worship-banner') as HTMLElement | null;
			if (banner) banner.style.transform = `translateX(${scrolled * 0.02}px)`;
		};
		window.addEventListener('scroll', onScroll);

		// Leaflet
		initMap();

		const onDocClick = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			if (!target.closest('.calendar-actions')) showCalendar = false;
		};
		document.addEventListener('click', onDocClick);

		return () => {
			if (countdownInterval) clearInterval(countdownInterval);
			window.removeEventListener('scroll', onScroll);
			document.removeEventListener('click', onDocClick);
			observer.disconnect();
			if (map) map.remove();
		};
	});
</script>

<svelte:head>
	<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
</svelte:head>

<div class="grid-bg" aria-hidden="true"></div>
<div class="particles">
	<div class="particle"></div>
	<div class="particle"></div>
	<div class="particle"></div>
	<div class="particle"></div>
	<div class="particle"></div>
	<div class="particle"></div>
</div>

<div class="container">
	<!-- Header -->
	<header class="header">
		<div class="logo">
			<img src="/logo.png" alt="Living Waters Church Logo" />
		</div>
		<div class="header-text">
			<h1>Living Waters Church<br />International</h1>
			<p>Bwaila City of Eagles</p>
		</div>
	</header>

	<!-- Worship Title -->
	<section class="worship-section">
		<div class="worship-banner">
			<h2>Worship</h2>
		</div>
		<div class="night-text">night</div>
		<br>
		<br>
		<div class="live-recording">(Live Recording)</div>
		<div class="livestream-hero" aria-label="Livestream links">
			<div class="livestream-label">
				<span class="live-dot" aria-hidden="true"></span>
				<span>Livestream — Watch live</span>
			</div>
			<div class="livestream-links">
				<a
					href="https://www.youtube.com/channel/UCYMH5vl1X_HMJWklswB47kA"
					target="_blank"
					rel="noopener"
					class="livestream-btn youtube"
					aria-label="Watch livestream on YouTube"
				>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.5 12.2c0-1.35-.11-2.35-.33-3.02a2.72 2.72 0 0 0-1.9-1.9C20.48 7.06 16.5 7 12 7s-8.48.06-9.27.28a2.72 2.72 0 0 0-1.9 1.9C.61 9.85.5 10.85.5 12.2s.11 2.35.33 3.02a2.72 2.72 0 0 0 1.9 1.9c.79.22 4.77.28 9.27.28s8.48-.06 9.27-.28a2.72 2.72 0 0 0 1.9-1.9c.22-.67.33-1.67.33-3.02Zm-13.1 3.1V8.9L16 12.2Z"/></svg>
					YouTube
				</a>
				<a
					href="https://www.facebook.com/lwcmediacityofeagles/"
					target="_blank"
					rel="noopener"
					class="livestream-btn facebook"
					aria-label="Watch livestream on Facebook"
				>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-7h2.3l.35-2.7h-2.65V9.1c0-.78.22-1.31 1.34-1.31h1.42V5.4c-.25-.03-1.08-.11-2.05-.11-2.03 0-3.42 1.24-3.42 3.52v1.96H7.5V14h2.99v7h3.01Z"/></svg>
					Facebook
				</a>
			</div>
		</div>
	</section>

	<!-- Choir Section -->
	<section class="choir-section reveal visible">
		<div class="choir-image-wrapper">
			<img
				src="/DSC_0888.jpg-Photoroom.png"
				alt="Choir - Living Waters Church Worship Night"
				loading="eager"
				onerror={(e) => {
					const t = e.target as HTMLImageElement;
					t.style.display = 'none';
					const n = t.nextElementSibling as HTMLElement | null;
					if (n) n.style.display = 'block';
				}}
			/>
			<div
				style="display:none; padding:40px; text-align:center; background:#fff; color:#1A3A8F; font-weight:700;"
			>
				Choir Image
			</div>
		</div>
		<div class="choir-divider"></div>
	</section>

	<!-- Event Details -->
	<section class="event-details">
		<div class="detail-card">
			<span class="detail-label">Date</span>
			<div class="detail-value">
				<span class="orange">Sunday</span>
				<span class="blue small">4th Oct<br />2026</span>
			</div>
			<div class="calendar-actions">
				<button
					type="button"
					class="add-calendar-btn"
					onclick={(e) => { e.stopPropagation(); showCalendar = !showCalendar; }}
					aria-expanded={showCalendar}
					aria-haspopup="menu"
				>
					<svg class="cal-btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><path d="M16 2v4"></path><path d="M8 2v4"></path><path d="M3 10h18"></path><path d="M12 14v6"></path><path d="M9 17h6"></path></svg>
					Add to Calendar
					<svg class="cal-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="opacity:0.6; transform: rotate({showCalendar ? '180deg' : '0deg'}); transition: transform 0.2s ease;"><path d="m6 9 6 6 6-6"></path></svg>
				</button>
				{#if showCalendar}
					<div class="calendar-dropdown" role="menu">
						<a
							href={getGoogleCalendarUrl()}
							target="_blank"
							rel="noopener"
							class="cal-option"
							role="menuitem"
							onclick={() => (showCalendar = false)}
						>
							<svg class="cal-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><path d="M16 2v4"></path><path d="M8 2v4"></path><path d="M3 10h18"></path></svg>
							<span>Google Calendar</span>
							<svg class="cal-external" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7"></path><path d="M7 7h10v10"></path></svg>
						</a>
						<a
							href={getOutlookCalendarUrl()}
							target="_blank"
							rel="noopener"
							class="cal-option"
							role="menuitem"
							onclick={() => (showCalendar = false)}
						>
							<svg class="cal-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><path d="M16 2v4"></path><path d="M8 2v4"></path><path d="M3 10h18"></path></svg>
							<span>Outlook.com</span>
							<svg class="cal-external" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7"></path><path d="M7 7h10v10"></path></svg>
						</a>
						<a
							href={getYahooCalendarUrl()}
							target="_blank"
							rel="noopener"
							class="cal-option"
							role="menuitem"
							onclick={() => (showCalendar = false)}
						>
							<svg class="cal-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><path d="M16 2v4"></path><path d="M8 2v4"></path><path d="M3 10h18"></path></svg>
							<span>Yahoo Calendar</span>
							<svg class="cal-external" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7"></path><path d="M7 7h10v10"></path></svg>
						</a>
						<button type="button" class="cal-option" role="menuitem" onclick={downloadICS}>
							<svg class="cal-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V3"></path><path d="M9 12 12 15 15 12"></path><path d="M3 17v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2"></path></svg>
							<span>Apple / .ics Download</span>
						</button>
					</div>
				{/if}
			</div>
		</div>
		<div class="detail-card">
			<div class="detail-label">From</div>
			<div class="detail-value">
				<span class="orange">5:30PM</span>
				<span class="teal small">to</span>
				<span class="orange small">9:00PM</span>
			</div>
		</div>
	</section>

	<!-- Countdown -->
	<div class="countdown" id="countdown">
		<div class="countdown-item">
			<div class="number">{days}</div>
			<div class="label">Days</div>
		</div>
		<div class="countdown-item">
			<div class="number">{hours}</div>
			<div class="label">Hours</div>
		</div>
		<div class="countdown-item">
			<div class="number">{minutes}</div>
			<div class="label">Mins</div>
		</div>
		<div class="countdown-item">
			<div class="number">{seconds}</div>
			<div class="label">Secs</div>
		</div>
	</div>

	<!-- CTA -->
	<div class="cta-section">
		<a
			href="#"
			class="cta-btn"
			onclick={handleRSVP}
			style:background={rsvpActive ? 'linear-gradient(135deg, #1ABFBF, #1A3A8F)' : undefined}
			>{rsvpText}</a
		>
	</div>

	<!-- Map / Directions -->
	<section class="map-section reveal visible" id="location">
		<div class="map-header">
			<h3>Find Us</h3>
			<p>Living Waters Church International &mdash; Bwaila City of Eagles</p>
			<p style="font-size:0.8rem;color:#999;margin-top:4px">-13.975334, 33.763411 &middot; Lilongwe, Malawi</p>
		</div>
		<div
			id="interactive-map"
			role="application"
			aria-label="Interactive map showing Living Waters Church location"
		></div>
		<div class="map-hint">Drag to pan &bull; Scroll to zoom &bull; Tap marker for directions</div>
		<div class="map-actions">
			<button type="button" class="map-btn secondary" onclick={handleLocate} disabled={locating} style="cursor:pointer; border:2px solid var(--blue);">
				{#if locating}
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="animation: spin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
					Locating...
				{:else}
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="M2 12h2"></path><path d="M20 12h2"></path></svg>
					{locateText}
				{/if}
			</button>
			<a href={MAPS_SHORT_URL} target="_blank" rel="noopener" class="map-btn secondary">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
				Open in Google Maps
			</a>
		</div>
	</section>

	<!-- Contact for more details -->
	<section class="contact-section reveal visible" id="contact">
		<div class="contact-card">
			<div class="contact-left">
				<div class="contact-text">
					<span class="contact-label">For more details contact</span>
					<a href={whatsappUrl} target="_blank" rel="noopener" class="contact-number">+265 882 06 68 60</a>
					<span class="contact-name">Jemimah Mhango</span>
				</div>
			</div>
			<a
				href={whatsappUrl}
				target="_blank"
				rel="noopener"
				class="contact-btn"
				aria-label="Chat with Jemimah Mhango on WhatsApp"
			>
				<span><img src="/chat.png" alt="chat" width="25" /></span>
			</a>
		</div>
	</section>

	<!-- Footer Quote -->
	<footer class="footer-quote">Let everything that has breath praise the Lord. Praise the Lord!</footer>
</div>
