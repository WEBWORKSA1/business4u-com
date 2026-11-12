# Business4U.com

**Business, built around you.** A free small-business launchpad: 16 calculators and builders, 13 in-depth guides, a funding finder, a video academy, an auto-updating news feed, and a matched-help lead engine.

## Stack
Static HTML + CSS + vanilla JavaScript. No build step. Hosted on GitHub Pages (branch `main`, folder `/`).

## Structure
```
index.html              Home (path picker + personalised plan)
get-matched/            Lead generation (multi-step)
tools/                  16 free tools
guides/                 13 long-form guides
funding/ videos/ news/  Directories (data/*.json)
contests/ careers/ support/ advertise/   Community & monetization
about/ contact/ legal/  Trust & compliance pages
assets/css, assets/js   Shared design system and scripts
data/                   JSON data (news auto-updated)
scripts/                Node scripts run by GitHub Actions
.github/workflows/      Scheduled automation (news, sitemap, search index)
```

## Configuration
Edit `assets/js/config.js`:
- `adSlots` — paste AdSense ad-unit slot IDs to enable manual units (empty = Auto ads only).
- `donate` — PayPal hosted button ID, Stripe Payment Link or Buy Me a Coffee handle.
- `contest` — current prize and sponsor text.

The owner inbox is stored obfuscated in `config.js` and decoded only at submit time. It is never written into page text.

## Publish
Settings → Pages → Build and deployment → Source: *Deploy from a branch* → `main` / `(root)`.
Custom domain: add `business4u.com`, point DNS A records to 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153 and `www` CNAME to `webworksa1.github.io`, then enable *Enforce HTTPS*.

## Trademark & copyright
"Business4U" is used descriptively as this site's domain name. No trademark rights are claimed in the term, and the site is not affiliated with any other business using a similar name. Site content © Business4U.com. All third-party names and marks belong to their respective owners.
