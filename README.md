# Monopoly Project

> A modern web-based Monopoly-inspired portfolio project with a minimal architectural interface, interactive pages, local account flow, admin tools, and a playable bot-match prototype.

## About

`Monopoly Project` is a personal portfolio project by **Westernoff**, created as a modern reinterpretation of the classic Monopoly formula with visual inspiration from **MonopolyOne**.

This is **not a commercial product** and **not an official Monopoly release**.  
It was built as a showcase piece for portfolio purposes and is being expanded into a larger interactive browser experience over time.

## Why This Project Exists

This repository is meant to demonstrate:

- product-oriented frontend thinking
- interface design systems for a game website
- multi-page UX structure
- browser-based account/session behavior
- admin tools for internal content management
- early game systems for a Monopoly-style experience

## Highlights

- cinematic landing intro
- local login flow with saved session
- admin mode via `admin / admin`
- floating `Debug Menu`
- editable profile page
- editorial feed with admin-created posts
- friends page with local request flow
- inventory page with empty-state UX
- market placeholder flow
- playable bot game prototype

## Gameplay Prototype

The current bot-match implementation already includes:

- turn order
- two-dice rolling
- player movement across the board
- start reward
- property purchase
- rent collection
- utility and railroad cells
- tax cells
- chance events
- jail / go-to-jail behavior
- skip-turn handling
- bankruptcy
- win condition
- basic bot decisions

## Pages

| Page | Purpose |
|---|---|
| `index.html` | Landing page, intro, login, start flow |
| `game.html` | Playable match against bots |
| `profile.html` | Editable profile with nickname and avatar |
| `friends.html` | Friend request prototype |
| `inventory.html` | Inventory empty-state and search UI |
| `market.html` | Market placeholder |
| `editorial.html` | Public editorial page |
| `debug.html` | Admin panel and editorial publishing |

## Admin Access

Use the built-in test account:

- Login: `admin`
- Password: `admin`

Admin mode unlocks:

- `Debug Menu`
- access to registered users list
- editorial post publishing
- admin notification state

## Stack

This version is intentionally framework-free and lightweight:

- `HTML`
- `CSS`
- `JavaScript`
- `localStorage`

## Local Run

You can open `index.html` directly in a browser.

If you prefer running it through a local static server:

```bash
npx serve .
```

or

```bash
python -m http.server 3000
```

Then open the local URL in your browser.

## Project Structure

```text
index.html
game.html
profile.html
friends.html
inventory.html
market.html
editorial.html
debug.html

script.js
game.js
profile.js
friends.js
editorial.js
debug.js
styles.css
```

## Current State

This project is already beyond a static mockup.  
It includes working UI flows, local persistence, admin tooling, and a playable browser game loop.

Still, it remains a **prototype** and is actively evolving.

## Roadmap

Planned next steps include:

- richer Monopoly rules
- property groups and full ownership strategy
- houses and hotels
- better bot behavior
- real inventory/market integration
- persistent player economy
- friend system between actual accounts
- online matchmaking
- improved game save/load
- stronger responsive polish for all pages

## Reference

- Author: **Westernoff**
- Visual reference: **MonopolyOne**

## Portfolio Note

This repository is published as a **portfolio example** and a **development showcase**.

It is intended to highlight design direction, interface architecture, interaction flow, and browser-based gameplay systems rather than serve as a finished commercial game.
