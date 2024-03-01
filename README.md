# web-tracker (WIP)

Driplane tracker library for browser clients

_This is a work-in-progress project in its early stages. Don't use it for now_

## Usage

Just import library to your page by setting your project token

```html
<script
    data-driplane-token="{YOUR_DRIPLANE_AUTH_TOKEN}"
    src="https://cdn.jsdelivr.net/npm/@driplane/web@beta/driplane.js"
    type="module"
></script>
```

Send page view event programmatically:

```html
<script type="module">
  import { init } from "https://cdn.jsdelivr.net/npm/@driplane/web@beta/driplane.js";

  const { trackPageview } = init('yourToken');

  window.addEventListener("popstate", (event) => {
    trackPageview();

    // Optionally you can add tags to pageview events like
    // trackPageview({ loggedin: '1'});
  });
</script>
```
