# Senja di Taman — Cari Bedanya

[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/DLiiMaGaming/spot-the-difference-20261121/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/DLiiMaGaming/spot-the-difference-20261121/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

A spot-the-difference game for [make.fun's "Make the best spot the difference game" bounty](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451). Two near-identical pictures side by side, 7 hidden differences per level, 3 original hand-drawn scenes — a dusk park, a morning coffee stall, and a morning beach — all drawn in code with Canvas 2D. No images, no libraries, no network requests.

## How to play

- **Mouse:** click a difference on either picture. Found differences get a numbered gold ring on both panels.
- **Keyboard:** arrow keys move the crosshair, **Enter** selects, **Tab** switches pictures.
- **H:** hint (3 per level, rings the next unfound difference). **R:** restart level. **M:** sound on/off.
- A wrong click costs 5 seconds. Find all 7 before the timer runs out; leftover time becomes bonus points and stars.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Screenshot states (deterministic, timer frozen): `?shot=start`, `?shot=play`, `?shot=play2`, `?shot=win`.

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `game/` and `screenshots/` to `/output` and writes `/output/dossier.json` with the vendored make.fun library (`vendor/makefun-game.ts`).

## License

MIT — see [LICENSE](LICENSE).
