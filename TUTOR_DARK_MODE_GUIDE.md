# Tutor Pages - Dark Mode & UI Guide

## Dark Mode Color Scheme

### Light Mode
- **Background**: `bg-gray-50` (page background)
- **Cards**: `bg-white` (content cards)
- **Text Primary**: `text-gray-900` (headings)
- **Text Secondary**: `text-gray-600` (descriptions)
- **Borders**: `border-gray-300`

### Dark Mode
- **Background**: `bg-gray-900` (page background)
- **Cards**: `bg-gray-800` (content cards)
- **Text Primary**: `text-white` (headings)
- **Text Secondary**: `text-gray-300` (descriptions)
- **Borders**: `border-gray-600`

## Component-Specific Colors

### Badges & Status Indicators

#### Subject Badges
- Light: `bg-blue-100 text-blue-800`
- Dark: `bg-blue-900 text-blue-200`

#### Difficulty Badges
- **Easy**
  - Light: `bg-green-100 text-green-800`
  - Dark: `bg-green-900 text-green-200`
- **Medium**
  - Light: `bg-yellow-100 text-yellow-800`
  - Dark: `bg-yellow-900 text-yellow-200`
- **Hard**
  - Light: `bg-red-100 text-red-800`
  - Dark: `bg-red-900 text-red-200`

#### Active/Inactive Status
- **Active**
  - Light: `bg-green-100 text-green-800`
  - Dark: `bg-green-900 text-green-200`
- **Inactive**
  - Light: `bg-gray-100 text-gray-800`
  - Dark: `bg-gray-700 text-gray-300`

### Form Elements

#### Input Fields
- Light: `bg-white border-gray-300 text-gray-900`
- Dark: `bg-gray-700 border-gray-600 text-white`

#### Buttons
- **Primary (Blue)**: `bg-blue-600 text-white hover:bg-blue-700`
- **Success (Green)**: `bg-green-600 text-white hover:bg-green-700`
- **Secondary**
  - Light: `bg-gray-200 hover:bg-gray-300`
  - Dark: `bg-gray-700 hover:bg-gray-600`

### Tables

#### Headers
- Light: `bg-gray-50 text-gray-500`
- Dark: `bg-gray-700 text-gray-300`

#### Rows
- Light: `hover:bg-gray-50`
- Dark: `hover:bg-gray-700`

#### Dividers
- Light: `divide-gray-200`
- Dark: `divide-gray-700`

## Responsive Breakpoints

- **Mobile**: Default (< 640px)
- **Tablet**: `sm:` (≥ 640px)
- **Desktop**: `md:` (≥ 768px)
- **Large Desktop**: `lg:` (≥ 1024px)

## Typography Scale

### Headings
- **H1**: `text-2xl md:text-3xl font-bold`
- **H2**: `text-lg md:text-xl font-bold`
- **H3**: `text-base md:text-lg font-semibold`

### Body Text
- **Primary**: `text-sm md:text-base`
- **Secondary**: `text-xs md:text-sm`

## Spacing Guidelines

### Padding
- **Page Container**: `p-4 md:p-6`
- **Cards**: `p-4 md:p-6`
- **Buttons**: `px-3 md:px-4 py-2`

### Gaps
- **Grid Gaps**: `gap-3 md:gap-4` or `gap-4 md:gap-6`
- **Flex Gaps**: `gap-2 md:gap-3`

## Accessibility Features

1. **Color Contrast**: All text meets WCAG AA standards
2. **Focus States**: Visible focus rings on interactive elements
3. **Hover States**: Clear hover feedback on buttons and links
4. **Responsive Text**: Scales appropriately for readability
5. **Semantic HTML**: Proper heading hierarchy and structure

## Testing Checklist

- [ ] Toggle dark mode - all pages should adapt
- [ ] Test on mobile device (< 640px)
- [ ] Test on tablet (640px - 1024px)
- [ ] Test on desktop (> 1024px)
- [ ] Verify all text is readable in both modes
- [ ] Check all buttons are clickable and visible
- [ ] Ensure forms are usable in both modes
- [ ] Verify tables scroll properly on mobile

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Notes

- Uses Tailwind CSS utility classes (no custom CSS)
- Minimal JavaScript for theme switching
- No layout shifts when toggling dark mode
- Optimized for fast rendering
