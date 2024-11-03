import UAParser from 'ua-parser-js';
import { getClientId } from './client-id';

const ua = new UAParser();

const parseUrl = (url) => new URL(url);

const defaultDriplaneServer = 'https://data.driplane.io';
const CONTENT_TYPE = 'text/plain';

class Driplane {
  server: string;
  token: string;

  constructor(token: string, server: string) {
    this.token = token;
    this.server = server;
  }
  
  async trackEvent(event: string, tags: object = {}) {
    const { href: url, host: url_host, pathname: url_path, protocol: url_prot } = parseUrl(location.href);
    const { href: ref, host: ref_host } = document.referrer ? parseUrl(document.referrer) : { href: '', host: ''};

    const [ cid, cid_st ] = await getClientId();

    const {
      browser: { name: ua_br, version: ua_br_v },
      os: { name: ua_os, version: ua_os_v },
      device: { model: ua_dv, type: ua_dv_t = 'desktop', vendor: ua_dv_v }
    } = ua.getResult();

    const { width: sw, height: sh } = screen;

    const body = {
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
      ...tags,
    };

    const endpoint = `${this.server}/events/${event}?api_key=${this.token}`;

    sendBeacon(endpoint, body) || sendXhr(endpoint, body);
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

export interface InitConfig {
  token: string;
  server?: string;
  modules?: string[]
}

export const init = function ({ token, server = defaultDriplaneServer, modules = [] }: InitConfig) {
  const driplane = new Driplane(token, server);

  modules.forEach(async (module) => {
    if (module === 'vitals') {
      const { initModule } = await import('./modules/vitals.ts');
      initModule(driplane);
    }
  });

  return {
    trackPageview: async (tags = {}) => {
      await driplane.trackPageview(tags);
    },
    trackEvent: async (event, tags = {}) => {
      await driplane.trackEvent(event, tags);
    }
  }
}
