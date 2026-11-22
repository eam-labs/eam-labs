# EAM

Developer working on tooling, web systems and automation — usually the unglamorous kind
that takes a repeated manual task and makes it disappear.

- **GitHub:** [@eam-labs](https://github.com/eam-labs)
- **Contact:** [open an issue](https://github.com/eam-labs/eam-labs/issues) — no email published

## What is public

One complete system: this page builds itself.

| piece | what it does | where |
|---|---|---|
| Renderer | GitHub REST API → filtered commit data → SVG card | [`scripts/render.mjs`](scripts/render.mjs) |
| Scheduled workflow | renders nightly, commits assets, re-pins image URLs | [`render.yml`](.github/workflows/render.yml) |
| Identity banner | hand-authored animated vector | [`assets/hero.svg`](assets/hero.svg) |

No client, employer or third-party work is described here, because none of it is mine to publish.

## Tools, with evidence

| tool | use | evidence |
|---|---|---|
| Node.js | dependency-free fetch and SVG generation | [`scripts/render.mjs`](scripts/render.mjs) |
| GitHub REST API | commit feed | [`scripts/render.mjs`](scripts/render.mjs) |
| GitHub Actions | scheduled commits | [`render.yml`](.github/workflows/render.yml) |
| SVG · SMIL | hand-authored vectors | [`assets/hero.svg`](assets/hero.svg) |
| Markdown · HTML | semantic layout | [`README.md`](README.md) |

## Open to

Developer-tooling work, collaborations, and code review.

---

```
 /\_/\
( o.o )  mew.
 > ^ <
```
