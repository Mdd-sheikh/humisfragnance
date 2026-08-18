---
name: Ethereal Essence
colors:
  surface: '#fbf9f9'
  surface-dim: '#dbdad9'
  surface-bright: '#fbf9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#e9e8e7'
  surface-container-highest: '#e3e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#4d4635'
  inverse-surface: '#303031'
  inverse-on-surface: '#f2f0f0'
  outline: '#7f7663'
  outline-variant: '#d1c5af'
  surface-tint: '#755b00'
  primary: '#755b00'
  on-primary: '#ffffff'
  primary-container: '#c9a227'
  on-primary-container: '#4b3a00'
  inverse-primary: '#ecc246'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2dfde'
  on-secondary-container: '#636262'
  tertiary: '#5d5f5f'
  on-tertiary: '#ffffff'
  tertiary-container: '#a6a7a7'
  on-tertiary-container: '#3b3d3d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffe08e'
  primary-fixed-dim: '#ecc246'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#584400'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#fbf9f9'
  on-background: '#1b1c1c'
  surface-variant: '#e3e2e2'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md-mobile:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style

The design system is engineered for a high-end olfactory experience, emphasizing exclusivity, purity, and tactile luxury. The brand personality is poised and sophisticated, targeting a discerning audience that values craftsmanship over clutter. 

The visual direction follows a **Minimalist-Luxury** hybrid. It leverages generous white space (macro-typography) to allow high-resolution product photography to serve as the primary visual anchor. The emotional response is one of "quiet luxury"—calm, expensive, and meticulously curated. High-contrast elements ensure readability and a sense of authority, while subtle transitions provide a fluid, premium feel.

## Colors

The palette is restricted to a classic tri-color harmony to maintain a premium editorial feel. 

- **Primary Background (#FAFAFA):** A warm off-white that prevents the clinical starkness of pure white, providing a soft canvas for product glass and liquid textures.
- **Accent Gold (#C9A227):** Reserved strictly for high-priority calls to action (CTAs), focus states, and premium badges. It represents quality and value.
- **Deep Charcoal (#1A1A1A):** Used for all primary typography and iconography to ensure maximum legibility and a grounded, authoritative presence.
- **Neutral/Muted:** Utilized for secondary information and hairline borders to maintain the minimal aesthetic without distracting from the main content.

## Typography

This design system utilizes a classic serif/sans-serif pairing. **Playfair Display** provides the editorial "fashion-magazine" feel for headlines and product names. **Inter** handles all functional and long-form text, ensuring clarity and modern utility.

For a luxury feel, use `label-caps` for small descriptors like "Top Notes" or "Scent Profile." Increase line-height on body text to 1.6x to enhance the feeling of "breathable" content. Headlines should use slightly tighter letter-spacing to feel more intentional and cohesive.

## Layout & Spacing

The layout philosophy follows a **Fixed-Fluid Grid**. On desktop, content is contained within a 1280px max-width to maintain focus, centered with generous 64px outer margins. Mobile layouts utilize a 16px safety margin.

Spacing follows a strict 8px base unit. To achieve the "premium" feel, prioritize "Large" spacing (48px+) between distinct sections. Product grids should favor 1-column on mobile and 2-to-3 columns on desktop to ensure photography remains large and detailed. Negative space is not "empty"—it is a design element used to frame the products.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Ambient Shadows**. 

- **Surfaces:** All main cards and containers use the background color (#FAFAFA) or a pure white (#FFFFFF) to create a subtle lift.
- **Shadows:** Avoid heavy, dark shadows. Use extremely soft, high-diffusion shadows (Blur: 30px, Opacity: 4%, Color: #1A1A1A) for product images to make them appear as if they are sitting on a physical surface.
- **Outlines:** Use 1px borders in a very light grey (#E0E0E0) for input fields and UI separators to maintain structure without introducing visual noise.

## Shapes

The shape language is **Soft-Refined**. A consistent 8px (`rounded-md`) radius is applied to all primary containers, product cards, and input fields. This softens the high-contrast color palette, making the interface feel approachable yet modern. 

CTAs and high-level buttons may use the same 8px radius or a full pill-shape for specific "Add to Cart" actions to differentiate them from structural elements.

## Components

- **Buttons:** Primary CTAs use the Accent Gold (#C9A227) with white or deep charcoal text. Use a subtle scale-down effect (98%) on press to simulate tactile feedback.
- **Product Cards:** Minimalist design with no visible borders. Use the soft ambient shadow on the product image itself. Text is center-aligned below the image.
- **Quantity Steppers:** Minimalist "Minus / Number / Plus" design with thin 1px dividers. No background fill for the stepper container; keep it transparent with a border.
- **Status Badges:** Use `label-caps` typography. Badges for "Limited Edition" or "New Arrival" should use a thin gold border or light gold background with 0.5 opacity.
- **Input Fields:** Bottom-border only or very light 4-sided borders. Labels should float or disappear on focus to maintain the clean aesthetic.
- **Order Status:** A clean horizontal stepper for tracking, using a thin gold line to indicate progress, keeping the iconography minimal.