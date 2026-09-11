# Public Static Brand Assets

Canonical repository location for brand emblems, icons, and logos dynamically referenced via environment configurations (`.env`) and served through Caddy reverse proxy `/brand/*`.

📖 **Documentation**: For the complete architectural guide, see [Dynamic White-Label Branding & Logos Documentation](file:///home/sanket/Desktop/Sanket/org_website_clone/apps/src/docs/src/content/docs/operations/branding-and-logos.mdx) or visit `http://localhost/docs/operations/branding-and-logos`.

## Assets Matrix
- `logo.png`: Primary brand emblem/logo (transparent PNG, 175x194) featuring the 3D isometric cubes chevron cluster and "SG" typographic emblem in ocean slate blue, configured via `NEXT_PUBLIC_BRAND_LOGO_URL="/brand/logo.png"`.
- `logo.svg`: Self-contained vector wrapper with embedded high-resolution asset, suitable for vector scaling.
- `source-screenshot.png`: Canonical reference source screenshot used by `scripts/generate-logo.ts` for clean reproducible regeneration.

## Multi-Format Support
The platform natively resolves and delivers all web-standard image formats:
- **Vector**: `.svg` (Scalable vector, recommended for crisp rendering on high-DPI displays and dark/light themes)
- **Raster**: `.png`, `.webp`, `.avif`, `.jpg`, `.jpeg`, `.gif`
- **Icon**: `.ico`, `.svg` (Browser favicons and shortcuts)

## Organization Custom Logo Support (Zero Git Drift)

Organizations deploying or forking SG Forge can customize their brand logo without causing Git merge conflicts or showing the working tree as "dirty" during `git pull`:

### Approach 1: Git-Ignored Custom Override File (Recommended)
Simply drop your organization's custom logo file into this directory:
- `public/brand/custom-logo.svg` (or `.png`, `.webp`, `.avif`)
- OR inside a `public/brand/custom/` folder: `public/brand/custom/logo.svg` (or `.png`, `.webp`)

**How it works:**
- All `custom-*`, `*.custom.*`, and `custom/` paths are globally ignored in `.gitignore` and `.dockerignore`.
- The Caddy gateway and `@forge/sdk` automatically detect and serve your custom logo with priority over the default `logo.png`.
- Works even if `.env` retains default `/brand/logo.png`—the gateway and asset resolver automatically serve your vector SVG or custom file.
- You can run `git pull origin main` to pull upstream updates at any time with zero merge conflicts.

### Approach 2: Git-Ignored `.env` Pointer
Set `NEXT_PUBLIC_BRAND_LOGO_URL` in your `.env` file to any local path, external CDN URL, or data URI:
```env
NEXT_PUBLIC_BRAND_LOGO_URL="/brand/custom-logo.svg"
# or external CDN:
NEXT_PUBLIC_BRAND_LOGO_URL="https://cdn.example.com/logo.svg"
```
Because `.env` is git-ignored, your working tree remains 100% clean.

### Approach 3: In-Place Editing with Git Skip-Worktree
If your organization prefers to overwrite `public/brand/logo.png` or `logo.svg` directly in place:
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

