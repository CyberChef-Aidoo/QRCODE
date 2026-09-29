# Stay Connected

A page where students open your YouTube channel and your WhatsApp channel.

The buttons only open those channels. Students still tap **Subscribe** or **Follow** on YouTube or WhatsApp. This site cannot do that for them, and it cannot tell whether they did. A button click is not a subscription.

There is no student login, no personal information, and no database.

## Customise

Edit **`src/site.config.js`** only:

1. Set `organisationName` to your school or organisation.
2. Optional: put a logo in the `public` folder and set `logoUrl` to `"/logo.png"`.
3. Paste the YouTube channel link into `youtubeChannelUrl`.
4. Paste the WhatsApp channel link into `whatsappChannelUrl`.

Leave a link as `""` until you have it. That button stays disabled. A link must start with `https://`.

Examples of the kind of address to paste:

- YouTube: `https://www.youtube.com/@YourChannel`
- WhatsApp: `https://www.whatsapp.com/channel/your-channel-id`

## Count QR visits

Tracking stays off until you add a Plausible site and set `VITE_PLAUSIBLE_DOMAIN` in `.env`. Copy `.env.example`. No extra package is installed, and no consent banner is shown, because this setup stores no cookie and sends no name, email, or device fingerprint.

Put the campaign on the landing-page address in the QR code, not on the YouTube or WhatsApp links:

`https://your-domain/?utm_source=qr&utm_medium=offline&utm_campaign=poster`

Use a different `utm_campaign` value for each poster or classroom. In Plausible, add three custom-event goals with these exact names: `qr_landing_view`, `youtube_channel_click`, and `whatsapp_channel_click`. Leave the outbound-link option off.

`qr_landing_view` counts a tagged visit once per page load. The two click goals count button clicks only. Compare those clicks with channel growth using `reporting/daily-channel-totals.csv`. Subscriber and follower totals come from YouTube and WhatsApp. This site cannot fill in verified subscriptions.

## Run on your computer

```bash
npm install
npm run dev
```

Open the address Vite prints, usually `http://localhost:5173`.

Check the links:

```bash
npm test
```

## Build

```bash
npm run build
npm run preview
```

The finished files are in the `dist` folder.

## Deploy

**Netlify, Cloudflare Pages, or Vercel:** build command `npm run build`, output folder `dist`.

**Any static host:** upload the contents of `dist`.

If the site is not served from the domain root, set `base` in `vite.config.js` before you build. Example: `base: "/stay-connected/"`.
