'use strict';

const PREFIX = 'rocks.orz';
const HASH = '0x2b'; // Computed at build time.
const OFFLINE_CACHE = `${PREFIX}-${HASH}`;

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(OFFLINE_CACHE).then((cache) => {
			return cache.addAll([
				'./',
				'./favicon.ico',
				'./img/avatar.png',
				'./img/bg-about.jpg',
				'./img/bg-archive.jpg',
				'./img/bg-contact.jpg',
				'./img/bg-main.jpg',
				'./img/bg-post.jpg',
				'./img/bg-tags.jpg'
			]).then(self.skipWaiting()).catch((error) => {
				console.log(error);
			});
		})
	);
});

self.addEventListener('activate', (event) => {
	// Delete old asset caches.
	event.waitUntil(
		caches.keys().then(function(keys) {
			return Promise.all(
				keys.map(function(key) {
					if (
						key != OFFLINE_CACHE &&
						key.startsWith(`${PREFIX}-`)
					) {
						return caches.delete(key);
					}
				})
			);
		})
	);
});

self.addEventListener('fetch', (event) => {
    console.log('Handling fetch event for', event.request.url);
	if (event.request.mode == 'navigate') {
		console.log('if Handling fetch event for', event.request.url);
		event.respondWith(
			fetch(event.request).catch((exception) => {
				// The `catch` is only triggered if `fetch()` throws an exception,
				// which most likely happens due to the server being unreachable.
				console.error(
					'Fetch failed; returning offline page instead.',
					exception
				);
				return caches.open(OFFLINE_CACHE).then((cache) => {
					return cache.match('/');
				});
			})
		);
	} else {
		// It’s not a request for an HTML document, but rather for a CSS or SVG
		// file or whatever…
		event.respondWith(
			caches.match(event.request).then((response) => {
				return response || fetch(event.request);
			}).catch( (error) => {
				console.log( error )
			})
		);
	}
});
