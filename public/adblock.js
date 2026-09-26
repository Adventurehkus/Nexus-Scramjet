"use strict";

const NEXUS_ADBLOCK_HOSTS = [
	"doubleclick.net",
	"googlesyndication.com",
	"googleadservices.com",
	"adservice.google.com",
	"amazon-adsystem.com",
	"adsrvr.org",
	"adnxs.com",
	"criteo.com",
	"rubiconproject.com",
	"pubmatic.com",
	"openx.net",
	"quantserve.com",
	"scorecardresearch.com",
	"taboola.com",
	"outbrain.com",
	"adsafeprotected.com",
	"demdex.net",
	"omnitagjs.com",
	"33across.com",
	"casalemedia.com",
	"yieldmo.com",
	"bidswitch.net",
	"smartadserver.com",
	"media.net",
	"adroll.com",
	"mathtag.com",
	"rlcdn.com",
	"lijit.com",
	"sharethrough.com",
];

function nexusAdBlockMatches(url) {
	try {
		const hostname = new URL(url).hostname.toLowerCase();
		return NEXUS_ADBLOCK_HOSTS.some(
			(domain) => hostname === domain || hostname.endsWith("." + domain)
		);
	} catch {
		return false;
	}
}

window.NexusAdBlock = {
	matches: nexusAdBlockMatches,
};
