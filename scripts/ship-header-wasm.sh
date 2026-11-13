#!/bin/sh
# Rebuild the header engine and copy engine.wasm into the header repo and this site.
set -e
SITE="$(cd "$(dirname "$0")/.." && pwd)"
HEADER="$(cd "$SITE/../rust/pesty-header" && pwd)"
unset CARGO_TARGET_DIR
export PATH="$HOME/.cargo/bin:$PATH"
cargo build --release --manifest-path "$HEADER/engine/Cargo.toml" --target wasm32-unknown-unknown
cp "$HEADER/engine/target/wasm32-unknown-unknown/release/pesty_engine.wasm" "$HEADER/public/engine.wasm"
cp "$HEADER/public/engine.wasm" "$SITE/public/engine.wasm"
echo "shipped $(wc -c < "$SITE/public/engine.wasm" | tr -d ' ') bytes"
