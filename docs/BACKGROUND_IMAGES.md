# Swift Bank - Background Images Usage

## Background Images Implementation

This document describes how the clbg1-clbg7 background images are used throughout the Swift Bank application.

### Image Locations

All background images are stored in: `src/assets/images/`

- clbg1.jpg through clbg7.jpg

### Current Usage

#### Dashboard Page (`DashboardPage.jsx`)

- **Main background**: `clbg1.jpg` - Used as the page background with overlay
- **Main Account Card**: `clbg7.jpg` - Used as the account card background

#### Landing Page (`LandingPage.jsx`)

- **Main background**: `clbg2.jpg` - Used as the hero section background
- **About Section**: `clbg3.jpg` - Used with light overlay for better text readability
- **Premium Banking Cards Section**: `clbg6.jpg` - Used with dark overlay

#### Login Page (`LoginPage.jsx`)

- **Main background**: `clbg4.jpg` - Used as the full page background

#### Transactions Page (`TransactionsPage.jsx`)

- **Main background**: `clbg1.jpg` - Shared with dashboard for consistency

#### Header Component (`Header.jsx`)

- **Navigation background**: `clbg5.jpg` - Used in the header with overlay

### Implementation Details

#### CSS Properties Used:

```css
style={{
  backgroundImage: `url(${imageVariable})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed' // For parallax effect
}}
```

#### Overlay Patterns:

- **Light sections**: `bg-gradient-to-br from-white/95 via-gray-50/90 to-blue-50/95`
- **Dark sections**: `bg-gradient-to-br from-slate-900/90 via-blue-900/80 to-slate-900/90`

### Performance Considerations

1. **Image Optimization**: All images should be optimized for web (compressed JPEG format)
2. **Lazy Loading**: Consider implementing lazy loading for non-critical sections
3. **Progressive Enhancement**: Fallback colors are provided for slow connections
4. **Mobile Optimization**: `background-attachment: fixed` is disabled on mobile for better performance

### Accessibility

- All background images have sufficient contrast overlays
- Text remains readable across all background combinations
- No critical information relies solely on background images

### Future Enhancements

- Consider WebP format for better compression
- Implement responsive images for different screen sizes
- Add loading states for background images
- Consider CSS-in-JS solution for dynamic theming

### File Structure

```
src/
├── assets/
│   └── images/
│       ├── clbg1.jpg  (Dashboard, Transactions)
│       ├── clbg2.jpg  (Landing Page Hero)
│       ├── clbg3.jpg  (Landing Page About)
│       ├── clbg4.jpg  (Login Page)
│       ├── clbg5.jpg  (Header Navigation)
│       ├── clbg6.jpg  (Landing Page Cards)
│       └── clbg7.jpg  (Dashboard Account Card)
├── styles/
│   └── custom.css     (Custom animations and effects)
└── pages/
    ├── DashboardPage.jsx
    ├── LandingPage.jsx
    ├── LoginPage.jsx
    └── TransactionsPage.jsx
```
