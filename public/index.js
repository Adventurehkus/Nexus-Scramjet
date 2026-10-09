"use strict";

const params = new URLSearchParams(window.location.search);
const theme = params.get("theme");
if (theme === "nexus" || theme === "midnight" || theme === "light") {
	document.documentElement.setAttribute("data-theme", theme);
}
/**
 * @type {HTMLFormElement}
 */
const form = document.getElementById("sj-form");
/**
 * @type {HTMLInputElement}
 */
const address = document.getElementById("sj-address");
/**
 * @type {HTMLInputElement}
 */
const searchEngine = document.getElementById("sj-search-engine");
/**
 * @type {HTMLParagraphElement}
 */
const error = document.getElementById("sj-error");
/**
 * @type {HTMLPreElement}
 */
const errorCode = document.getElementById("sj-error-code");

const { ScramjetController } = $scramjetLoadController();

const scramjet = new ScramjetController({
	files: {
		wasm: "/scram/scramjet.wasm.wasm",
		all: "/scram/scramjet.all.js",
		sync: "/scram/scramjet.sync.js",
	},
});

scramjet.init();

const connection = new BareMux.BareMuxConnection("/baremux/worker.js");

// The most recently opened Scramjet browsing frame.
let activeScramjetFrame = null;

// Accept navigation commands only from the parent window that embeds this app.
window.addEventListener("message", (event) => {
	if (event.source !== window.parent) return;

	const message = event.data;
	if (
		!message ||
		message.type !== "NEXUS_BROWSER_NAVIGATE" ||
		!["back", "forward", "refresh"].includes(message.action)
	) {
		return;
	}

	const browsingWindow = activeScramjetFrame?.frame?.contentWindow;
	if (!browsingWindow) return;

	try {
		switch (message.action) {
			case "back":
				browsingWindow.history.back();
				break;
			case "forward":
				browsingWindow.history.forward();
				break;
			case "refresh":
				browsingWindow.location.reload();
				break;
		}
	} catch (err) {
		console.warn("Nexus-Scramjet: Navigation command failed.", err);
	}
});

async function launch(url) {
	try {
		await registerSW();
	} catch (err) {
		error.textContent = "Failed to register service worker.";
		errorCode.textContent = err.toString();
		throw err;
	}

	let wispUrl =
		(location.protocol === "https:" ? "wss" : "ws") +
		"://" +
		location.host +
		"/wisp/";
	if ((await connection.getTransport()) !== "/libcurl/index.mjs") {
		await connection.setTransport("/libcurl/index.mjs", [
			{ websocket: wispUrl },
		]);
	}

	const frame = scramjet.createFrame();
	activeScramjetFrame = frame;
	frame.frame.id = "sj-frame";
	document.body.appendChild(frame.frame);
	frame.go(url);
}

form.addEventListener("submit", async (event) => {
	event.preventDefault();

	const url = search(address.value, searchEngine.value);
	await launch(url);
});

// Support direct-launch URLs such as:
// https://nexus-scramjet.onrender.com/?url=https%3A%2F%2Fopen.spotify.com%2F
const directUrl = params.get("url");
if (directUrl) {
	try {
		const parsedUrl = new URL(directUrl);
		if (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") {
			launch(parsedUrl.toString());
		} else {
			error.textContent = "Invalid direct-launch URL.";
			errorCode.textContent = "Only HTTP and HTTPS URLs are supported.";
		}
	} catch (err) {
		error.textContent = "Invalid direct-launch URL.";
		errorCode.textContent = err.toString();
	}
}
