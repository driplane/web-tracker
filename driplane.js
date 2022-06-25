const script = document.querySelector('script[data-driplane]');
let config = {
  server: 'https://driplane.io',
  auth: ''
};

if (script) {
  config = {
    ...config,
    ...script.dataset
  }
  // const baseUrl = script.src.split('/').slice(0, -1).join('/');
}

if (!config.auth) {
  console.warn('Missing token for Driplane!');
}

const headers = new Headers();

headers.append('Content-Type', 'application/json');
headers.append('Authorization', `Basic ${config.auth}`);

const commonTags = {
  ua: navigator.userAgent,
  url: location.href,
  lang: navigator.language,
  sh: screen.height,
  sw: screen.width
};

fetch(`${config.server}/events/page_view`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    ...commonTags
  })
});

console.log(config);
