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

	let countdownInterval: ReturnType<typeof setInterval> | undefined;
	let map: any = null;
	let userMarker: any = null;
	let userLine: any = null;

	const CHURCH_LAT = -13.975334;
	const CHURCH_LNG = 33.7634107;
	const MAPS_SHORT_URL = 'https://maps.app.goo.gl/yGSBEXCcB2UogxH27';
	const whatsappUrl =
		'https://wa.me/265882066860?text=Hello%20Jemimah%20Mhango%2C%20I%20would%20like%20more%20details%20about%20the%20Worship%20Night%20on%204th%20Oct%202026%20at%20Living%20Waters%20Church%20International.';

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
				html: '<div style="background:linear-gradient(135deg,#F26522,#F7C948);width:36px;height:36px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center"><span style="transform:rotate(45deg);font-size:18px;line-height:1">✝</span></div>',
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

		return () => {
			if (countdownInterval) clearInterval(countdownInterval);
			window.removeEventListener('scroll', onScroll);
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
				{#if locating}Locating...{:else}◉ {locateText}{/if}
			</button>
			<a href={MAPS_SHORT_URL} target="_blank" rel="noopener" class="map-btn secondary"> Open in Google Maps </a>
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
