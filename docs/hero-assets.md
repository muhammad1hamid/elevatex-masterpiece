# Hero artwork

Prepared on 2026-10-07 with the built-in `image_gen` tool using the user-supplied 1536 × 864 reference, `ChatGPT Image Oct 6, 2026, 11_22_48 PM.png`. The image-generation skill was used in built-in mode; no external image API, stock assets, or runtime image service is required.

The laptop, pedestal, and smoke are independent transparent images. An independent opaque polished-stone floor texture was added after visual review found the original CSS floor too regular. The reference screenshot is not shipped as a hero image or background. Navigation, heading, supporting copy, and conversion links remain real HTML. The halo and platform rim are separate vectors/CSS in the implementation.

## Files and sizing

| Asset                | Intrinsic size | AVIF bytes | WebP bytes |
| -------------------- | -------------- | ---------: | ---------: |
| `hero-laptop-640`    | 640 × 281      |     14,961 |     30,936 |
| `hero-laptop-1200`   | 1200 × 526     |     31,956 |     74,090 |
| `hero-pedestal-800`  | 800 × 120      |     20,155 |     37,874 |
| `hero-pedestal-1600` | 1600 × 241     |     58,536 |    120,348 |
| `smoke-small.webp`   | 384 × 109      |          — |     15,832 |
| `smoke.webp`         | 768 × 217      |          — |     47,330 |
| `hero-floor-800`     | 800 × 155      |     10,467 |     16,830 |
| `hero-floor-1600`    | 1600 × 309     |     34,397 |     55,562 |

All runtime images are under `public/images/hero/`. The largest laptop, pedestal, floor and one smoke file total **172,219 bytes (168.2 KiB)** with AVIF, or **297,330 bytes (290.4 KiB)** with WebP. The smallest responsive selection totals **61,415 bytes (60.0 KiB)** with AVIF, or **101,472 bytes (99.1 KiB)** with WebP. Reusing the smoke image in multiple layers downloads the same URL once through the browser cache. The floor alone is 33.6/54.3 KiB desktop and 10.2/16.4 KiB mobile (AVIF/WebP).

These are encoded-file totals, not complete page weight, LCP measurements, or production performance claims. A browser with a high device pixel ratio can select the larger responsive candidate.

## Placement

- Laptop: natural ratio about 2.28:1. At the desktop cap of 590 CSS pixels its natural height is about 259 pixels. The visible silhouette fills the canvas with only 4 source pixels of alpha padding around its bounds.
- Pedestal: the generated crop has a ratio around 5.26:1. Export resizing applies the approved 6.65:1 composition ratio, so the browser displays the final image at its natural dimensions without runtime stretching. The untouched generated PNG remains available. This deliberately reduces the stone's height to match the reference silhouette.
- Smoke: natural ratio about 3.54:1. Reuse at low opacity for rear and foreground haze. A soft CSS mask can fade the perimeter further where the texture would otherwise expose its outer silhouette; do not animate a large blur.
- Floor: natural ratio about 5.17:1. Use as a static floor material beneath the independent pedestal, reflection, and light layers, with a top fade and restrained opacity. The file contains no laptop, platform, ring, smoke, text, or complete scene. Its irregular subtle warm reflections are part of the generated material.

`docs/hero-assets/manifest.json` records exact original dimensions, visible alpha bounds, packaging crops, transparency counts, and every output size. Transparency was preserved for transparent assets. The build script trims empty canvas margins, crops the useful center strip of the opaque floor, resizes (including the approved pedestal ratio), and encodes formats.

## Source and reproducibility

The selected generated PNG sources are retained in `docs/hero-assets/`, outside the public directory:

- `laptop-source.png`: 1918 × 820; 1,408,949 bytes.
- `pedestal-source.png`: 2172 × 724; 1,456,436 bytes.
- `smoke-source.png`: 2172 × 724; 1,772,923 bytes.
- `floor-source.png`: 2172 × 724; 2,540,497 bytes. The packaging crop is x=0, y=120, width=2172, height=420.

`docs/hero-assets/prompts.json` contains the exact three built-in generation prompts, reference identity, date, and transparency setting. Each asset was requested in its own tool call. Generated output is a reconstruction guided by the reference, so rerunning the prompts will not reproduce identical pixels.

`docs/hero-assets/floor-prompt.json` records the additional floor prompt with the same reference and date, using `transparent_background: false`. One built-in call generated this separate floor surface. Only resizing, a wide crop, and format compression were applied afterward; it is not extracted from a full-screen screenshot.

Rebuild responsive files from the retained sources with:

```sh
node scripts/optimize-hero-assets.mjs
```

The script uses the existing Sharp dependency in the locked project environment and writes the asset manifest. No runtime dependency was added for image optimization.

## Visual review and remaining differences

The optimized WebP laptop, pedestal, smoke, and floor were opened and visually inspected. The source alpha channels of the first three assets were inspected: each has fully transparent exterior pixels, and the smoke also has extensive partial transparency. The floor is intentionally opaque. The visible screen wording is correctly rendered and the source reference's unverified `+92%` result and chart have been omitted.

The art follows the reference perspective, dark metal, champagne lighting, black mineral texture, and warm smoke. It is not an exact extraction: the laptop has a camera notch and a simplified screen composition, the metallic sculpture differs in its folds, the stone veins and top-surface lighting differ, and the smoke pattern differs. Exact pixel identity would require original separated scene layers or the original 3D model/materials/camera setup from the reference creator. Desktop, tablet and mobile browser compositions were reviewed; screenshots are reproducible through `scripts/capture-hero.mjs`.

All four images are decorative, not factual client work, service results, or interactive device interfaces. Use empty alt text and hide the decorative scene from assistive technology.
