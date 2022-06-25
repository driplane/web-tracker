const script = document.querySelector('script[data-driplane-auth]');
let config = {
  driplaneServer: 'https://driplane.io',
  driplaneToken: ''
};

if (script) {
  config = {
    ...config,
    ...script.dataset
  }
  // const baseUrl = script.src.split('/').slice(0, -1).join('/');
}

if (!config.driplaneToken) {
  console.warn('Missing token for Driplane!');
}

const headers = new Headers();

headers.append('Content-Type', 'application/json');
headers.append('Authorization', `Basic ${config.driplaneToken}`);

const commonTags = {
  ua: navigator.userAgent,
  url: location.href,
  lang: navigator.language,
  sh: screen.height,
  sw: screen.width
};

fetch(`${config.driplaneServer}/events/page_view`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    ...commonTags
  })
});

console.log(config);
