# azdt-bot

The website FAQ assistant for [AZ Does Taxes](https://www.azdoestaxes.com).

This repo exists to serve one file over a CDN, because Wix caps inline custom code at
15,000 characters and the widget is larger than that.

The canonical source, the install guide and the editing notes live in the AZDT Company Brain
under `website-bot/`. Edit there, then copy the file here and push a new tag.

## Served from

```
https://cdn.jsdelivr.net/gh/azmoyer7/azdt-bot@v1/azdt-bot.min.js
```

jsDelivr minifies `azdt-bot.js` automatically when you request the `.min.js` name — there is no
build step and no minified file to keep in sync.

## Releasing a change

```bash
git add -A && git commit -m "update answers"
git tag v2 && git push origin main --tags
```

Then change `@v1` to `@v2` in the Wix snippet. Tags are immutable on jsDelivr, so a pinned tag
can never change under the live site — that's the point of using one.
