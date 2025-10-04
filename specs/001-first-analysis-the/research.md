# Research: Bank Statement UI Fixes

**Feature**: Bank Statement UI Fixes  
**Date**: 2025-01-27  
**Phase**: 0 - Research & Analysis

## Research Tasks & Findings

### 1. Theme Consistency Analysis

**Task**: Research existing application theme and identify inconsistencies

**Decision**: Apply existing dark blue theme (`--secondary-color: #152251`) with white text to all bank statement components

**Rationale**: 
- Existing app uses dark blue background with white text consistently
- Bank statement page currently uses light backgrounds (white/grey) which breaks visual consistency
- Users expect consistent theming across all pages in the application

**Current Theme Variables**:
- `--primary-color: #0ab377` (green)
- `--secondary-color: #152251` (dark blue)
- `--font-color: white`
- `--box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)`

**Alternatives considered**:
- Keep light theme: Would create jarring user experience
- Create new theme: Would add complexity and inconsistency

### 2. Transaction Table Data Visibility Issues

**Task**: Research why transaction table data is not displaying properly

**Decision**: Fix data parsing and display logic in TransactionTable component

**Rationale**:
- Transaction data is being parsed but not properly displayed in table cells
- Date, narration, type, and balance columns are showing empty or partial data
- Need to ensure proper data mapping from parsed transactions to table display

**Issues Identified**:
- Date formatting may be incorrect
- Narration text may be truncated or not rendered
- Transaction type detection logic may be flawed
- Balance display may have formatting issues

**Alternatives considered**:
- Server-side parsing: Not applicable for frontend-only approach
- Different data structure: Would require major refactoring

### 3. Filter Alignment Issues

**Task**: Research date range filter alignment problems

**Decision**: Align filter components with existing FilterComponent styling

**Rationale**:
- Current date range filters are not properly aligned vertically
- Existing FilterComponent has proven alignment patterns
- Need to maintain consistency with other filter components in the app

**Current FilterComponent Patterns**:
- Uses flexbox with gap for spacing
- Input fields have consistent padding and border styling
- Responsive design with proper mobile breakpoints

**Alternatives considered**:
- Custom alignment: Would create inconsistency
- Grid layout: More complex than needed

### 4. Chart Integration with Dark Theme

**Task**: Research Chart.js theming for dark backgrounds

**Decision**: Apply dark theme colors to Chart.js components

**Rationale**:
- Charts need to be visible and readable on dark backgrounds
- Text colors, grid lines, and legends need dark theme adaptation
- Maintain accessibility and readability standards

**Chart.js Dark Theme Requirements**:
- White/light text for labels and legends
- Light grid lines for visibility
- High contrast colors for data series
- Proper background transparency

**Alternatives considered**:
- Light chart on dark background: Poor contrast
- Custom chart library: Unnecessary complexity

### 5. Component Styling Consistency

**Task**: Research component styling patterns in existing application

**Decision**: Apply consistent styling patterns from existing components

**Rationale**:
- Existing components use specific patterns for cards, buttons, inputs
- Need to maintain visual hierarchy and spacing consistency
- Users expect familiar interaction patterns

**Existing Patterns**:
- Cards use `box-shadow: var(--box-shadow)` and white backgrounds
- Buttons use `--primary-color` background with white text
- Inputs have consistent border and padding styles
- Responsive design with mobile-first approach

**Alternatives considered**:
- Completely custom styling: Would break consistency
- Minimal styling: Would look unfinished

## Technical Decisions Summary

| Component | Issue | Solution | Rationale |
|-----------|-------|----------|-----------|
| Theme | Light backgrounds | Apply dark blue theme | Visual consistency |
| Table Data | Empty/partial data | Fix parsing/display logic | Data visibility |
| Filter Alignment | Misaligned inputs | Use existing FilterComponent patterns | UI consistency |
| Charts | Light theme | Apply dark theme colors | Readability on dark background |
| Components | Inconsistent styling | Apply existing patterns | User experience consistency |

## Integration Points

1. **Theme Variables**: Use existing CSS custom properties from App.css
2. **Component Patterns**: Follow existing FilterComponent, Dashboard styling
3. **Responsive Design**: Maintain mobile-first approach with existing breakpoints
4. **Color Scheme**: Use existing primary/secondary colors consistently
5. **Typography**: Follow existing font family and sizing patterns

## Risk Mitigation

1. **Data Loss**: Ensure data parsing fixes don't break existing functionality
2. **Theme Conflicts**: Test all components with dark theme thoroughly
3. **Responsive Issues**: Verify mobile layout with new styling
4. **Chart Readability**: Ensure sufficient contrast for accessibility
5. **Performance**: Maintain existing performance with new styling

## Next Steps

1. Update all component CSS files to use dark theme
2. Fix transaction table data display logic
3. Align filter components with existing patterns
4. Apply dark theme to Chart.js components
5. Test all components for consistency and functionality