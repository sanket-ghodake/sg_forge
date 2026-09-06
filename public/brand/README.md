# Public Static Brand Assets

Canonical repository location for brand emblems, icons, and logos dynamically referenced via environment configurations (`.env`).

## Assets Matrix
- `logo.png`: Primary brand emblem/logo (transparent PNG, 175x194) featuring the 3D isometric cubes chevron cluster and "SG" typographic emblem in ocean slate blue, configured via `NEXT_PUBLIC_BRAND_LOGO_URL="/brand/logo.png"`.
- `logo.svg`: Self-contained vector wrapper with embedded high-resolution asset.
- `source-screenshot.png`: Canonical reference source screenshot used by `scripts/generate-logo.ts` for clean reproducible regeneration.

## Organization Custom Logo Support (Zero Git Drift)

Organizations deploying or forking SG Forge can customize their brand logo without causing Git merge conflicts or showing the working tree as "dirty" during `git pull`:

### Approach 1: Git-Ignored Custom Override File (Recommended)
Simply drop your organization's custom logo file into this directory:
- `public/brand/custom-logo.png` (or `.svg`, `.webp`)
- OR inside a `public/brand/custom/` folder: `public/brand/custom/logo.png`

**How it works:**
- All `custom-*`, `*.custom.*`, and `custom/` paths are globally ignored in Git across all toolchains.
- The Caddy gateway and `@forge/sdk` automatically detect and serve your custom logo with priority over the default `logo.png`.
- You can run `git pull origin main` to pull upstream updates at any time with zero merge conflicts.

### Approach 2: In-Place Editing with Git Skip-Worktree
If your organization prefers to overwrite `public/brand/logo.png` directly in place:
1. Lock the logo files so Git stops tracking local modifications:
   ```bash
   rtk ./run.sh lock-logo
   ```
2. Replace `public/brand/logo.png` (and `logo.svg`) with your company's assets.
3. `git status` will remain completely clean ("clean — nothing to commit").
4. To check or restore upstream tracking:
   ```bash
   rtk ./run.sh logo-status   # Check status
   rtk ./run.sh unlock-logo   # Resume tracking upstream
   ```

## Asset Regeneration
To regenerate the default brand assets from the reference screenshot:
```bash
rtk bun scripts/generate-logo.ts
```
