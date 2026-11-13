# Header config handoff

The picture knobs live in the header engine. The site has a second set. An engine edit does nothing on the homepage until the wasm is copied here and the cache string moves. A scale or quiet-box edit does nothing in the engine.

Header repo: `../rust/pesty-header` (GitHub `pesty-sh/prototype-pesty-header`).
Site repo: this one. Local page: `http://127.0.0.1:3000`. Leave the existing server on port 3000 alone.

## Engine knobs

File: `engine/src/config.rs`. Rebuild with `scripts/ship-header-wasm.sh` from this repo. Then bump `?v=` in both site loaders.

| Ask | Constant | Now | Unit |
| --- | --- | --- | --- |
| Wanderer size | `DRIFT_GLOW_REACH_CELLS` | 12 | letter-cells, radius of the ball |
| Wanderer density | `DRIFT_GLOW` | 0.276 | glow strength; higher lights more squares inside the ball |
| Magnetic range | `NOISE_WELL_CELLS` | 13.8 | letter-cells; speckles inside slide toward the cursor |
| Magnetic pull | `NOISE_WELL_PULL` | 0.88 | 0 leaves points put; keep under 1 |
| Quiet fade | `QUIET_REACH_CELLS` | 7 | letter-cells past a quiet box before the field returns |

`DRIFT_GLOW_DIM` (0.7) fades the ball while the pointer is strong. The ball is still a glow, not an icon.

The engine package version stays 0.1.7 until someone bumps it on purpose. The site query `engine.wasm?v=0.1.14` is only a cache buster. Raise both copies together:

- `lib/rust-header-boot.ts` — the script that actually paints
- `components/feature-header.tsx` — the fallback loader

## Site knobs

These are not in `config.rs`.

**Pixel scale.** `components/feature-header.tsx`, the `[data-rust-mark]` button:

`w-[min(calc(92vw*80/110),calc(56rem*80/110))]`

The base box is `min(92vw, 56rem)`. The `80/110` factor zooms out so 15 squares of the new size sit on each side of that base. Every field square uses the same cell: wordmark width / 80. Grow the wordmark to zoom in. Shrink it to zoom out. To add N squares on each side of the current box, multiply the current width by `80 / (80 + 2N)`.

**Quiet box.** A `w-fit` wrapper with `data-rust-quiet` around the panel tile. The rect is that box, then inset 5% on each edge, centered. The nav (`data-rust-nav`) is quiet at its own box, with no inset. The tile fill is `color-mix(in srgb, var(--background) 92%, transparent)`. Do not put `data-rust-quiet` on a full-width wrapper. That blanks the field below the word.

**Colours.** After the wasm loads, kind 0 is `#c900c4` and kind 1 is `#fafafa`. Those override the baked palette. The first paint fills the canvas `#fafafa` before the wasm arrives. Do not swap the baked word for a font raster. That restarts the appear.

## Rebuild

`scripts/ship-header-wasm.sh` unsets `CARGO_TARGET_DIR`, puts `~/.cargo/bin` first on `PATH`, builds `wasm32-unknown-unknown` release, and copies `pesty_engine.wasm` to both `public/engine.wasm` files.

`/usr/local/bin/rustc` is Homebrew and does not see the wasm32 target. If `CARGO_TARGET_DIR` points at a sandbox cache, a green build writes the wasm somewhere else and the copy keeps the old file. Confirm the new float is in `public/engine.wasm` before reloading. Two different builds can share the same byte length.
