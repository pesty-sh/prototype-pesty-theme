---
name: header-tune
description: >-
  Tune the pesty.sh homepage pixel header and ship its wasm. Use when the user
  changes the wanderer, magnetic range, quiet area, pixel scale, wordmark size,
  or engine.wasm on the prototype-pesty-theme site.
---

# Header tune

The live painter is `lib/rust-header-boot.ts`. `components/feature-header.tsx` is the markup and the fallback. Change a knob in both places when it appears in both. The knob table and the current numbers are in [docs/header-handoff.md](../../../docs/header-handoff.md). Read that before editing.

Engine source is the sibling repo `../rust/pesty-header`. Do not edit `engine.wasm` by hand.

## Which file

- Wanderer size, wanderer density, magnetic radius, quiet fade: `engine/src/config.rs` in the header repo, then ship the wasm.
- Pixel scale / zoom: the wordmark `className` in `components/feature-header.tsx` only. No wasm rebuild.
- Quiet box behind the panel: the `0.05` inset in `lib/rust-header-boot.ts` and the matching inset in `components/feature-header.tsx`. No wasm rebuild.

Cell size is the wordmark CSS width divided by 80. A bigger wordmark zooms in. A smaller wordmark zooms out. To put N extra squares on each side of the previous box, multiply that box by `80 / (80 + 2N)`.

## Ship an engine change

1. Edit the one constant.
2. Run `scripts/ship-header-wasm.sh`. It unsets `CARGO_TARGET_DIR`, uses `~/.cargo/bin`, and copies the wasm into both `public/` folders. Homebrew `rustc` cannot build this target.
3. Bump the `?v=` string in `lib/rust-header-boot.ts` and `components/feature-header.tsx` to the same new value. The string is a cache buster. It is not the engine package version.
4. Check the float landed: `python3 -c "import struct; d=open('public/engine.wasm','rb').read(); print(d.count(struct.pack('<f', VALUE)))"` with the new value. Expect a count above zero, and zero for the value you replaced when that bit pattern was unique.

The page is already at `http://127.0.0.1:3000`. Do not start another server. Reload and confirm the document requested the new `engine.wasm?v=` URL.

Commit only when asked. An engine change is two repos: the header repo (`config.rs` and its `public/engine.wasm`) and this site (its `public/engine.wasm` plus the cache string).
