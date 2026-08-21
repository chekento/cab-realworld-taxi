# Original prototype archive status

The CAB v1 migration baseline is the user-supplied archive `cab___interactive_taxi_play_by_KoSch.zip`.

Its canonical SHA-256 is:

`f938d7f4e199e1200288ac28ed958a2eb5a8085c9ff7e3371b1e0110430f3571`

`index.html` and `style.css` are preserved in this directory unchanged. `SOURCE-MANIFEST.md` records the exact size and SHA-256 of every file in the original archive, including `script.js`, both PNG assets and all MP3 files.

The current ChatGPT GitHub connector supports UTF-8 repository writes but does not expose a direct local binary-file upload action. Therefore the binary assets are intentionally not replaced, transcoded or approximated. The source archive and its checksums remain the integrity baseline for the v2 migration.

No CAB v2 implementation should overwrite files in `prototype/websim-v1/`.
