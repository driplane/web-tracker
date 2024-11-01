import UAParser from 'ua-parser-js';

const ua = new UAParser();

const parseUrl = (url) => new URL(url);

const defaultDriplaneServer = 'https://data.driplane.io';
const CONTENT_TYPE = 'text/plain';

const eventQueue = new Set<{endpoint: string, event:string, body: Object}>();

class Driplane {
  server: string;
  token: string;

  constructor(token: string, server: string) {
    this.token = token;
    this.server = server;
  }
  
  async trackEvent(event, tags: (() => object) | object = {}) {
    if (typeof tags === 'function') {
      tags = await tags();
    }

    const { href: url, host: url_host, pathname: url_path, protocol: url_prot } = parseUrl(location.href);
    const { href: ref, host: ref_host } = document.referrer ? parseUrl(document.referrer) : { href: '', host: ''};

    const { getClientId } = await import('./client-id');
    const [ cid, cid_st ] = await getClientId();

    const {
      browser: { name: ua_br, version: ua_br_v },
      os: { name: ua_os, version: ua_os_v },
      device: { model: ua_dv, type: ua_dv_t = 'desktop', vendor: ua_dv_v }
    } = ua.getResult();

    const { width: sw, height: sh } = screen;

    const commonTags = {
      ua_br,
      ua_br_v,
      ua_os,
      ua_os_v,
      ua_dv,
      ua_dv_t,
      ua_dv_v,
      url,
      url_host,
      url_path,
      url_prot,
      lang: navigator.language,
      sh,
      sw,
      ref,
      ref_host,
      ref_ext: url_host !== ref_host ? 1 : 0,
      cid,
      cid_st,
      beacon: 0,
    };

    const body = {
      ...commonTags,
      ...tags
    };

    const endpoint = `${this.server}/events/${event}?api_key=${this.token}`;

    eventQueue.add({ endpoint, event, body });
  }

  async trackPageview(tags = {}) {
    await this.trackEvent('page_view', tags);
  }

}

const sendBeacon = (endpoint, body) => {
  if (window &&
      window.navigator &&
      typeof window.navigator.sendBeacon === "function" &&
      typeof window.Blob === "function") {

    const blob = new Blob([JSON.stringify({ ...body, beacon: 1 })], { type: CONTENT_TYPE });

    return navigator.sendBeacon(endpoint, blob);
  }

  return false;
}

const sendXhr = (endpoint, body) => {
  return fetch(endpoint, {
    method: 'POST',
    keepalive: true,
    headers: {
      'Content-Type': CONTENT_TYPE
    },
    body: JSON.stringify(body)
  });
}

function flushQueue() {
  if (eventQueue.size > 0) {
    eventQueue.forEach(({ endpoint, event, body }) => {
      sendBeacon(endpoint, body) || sendXhr(endpoint, body);
    });

    eventQueue.clear();
  }
}

// Report all available metrics whenever the page is backgrounded or unloaded.
addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    flushQueue();
  }
});

// NOTE: Safari does not reliably fire the `visibilitychange` event when the
// page is being unloaded. As a workaround, we also listen for `pagehide`.
addEventListener('pagehide', flushQueue);


export const init = function (token: string, server = defaultDriplaneServer) {
  const driplane = new Driplane(token, server);
  return {
    trackPageview: async (tags = {}) => {
      await driplane.trackPageview(tags);
      // Send pageview events immediately
      flushQueue();
    },
    trackEvent: (event, tags = {}) => {
      driplane.trackEvent(event, tags);
    }
  }
}
