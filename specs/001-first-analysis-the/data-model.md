# Data Model: Bank Statement UI Fixes

**Feature**: Bank Statement UI Fixes  
**Date**: 2025-01-27  
**Phase**: 1 - Design & Contracts

## Entities

### UITheme
Represents the visual styling and theming for bank statement components.

**Fields**:
- `backgroundColor`: String (CSS color value, e.g., '#152251')
- `textColor`: String (CSS color value, e.g., 'white')
- `primaryColor`: String (CSS color value, e.g., '#0ab377')
- `cardBackground`: String (CSS color value, e.g., 'white')
- `borderColor`: String (CSS color value, e.g., '#e0e0e0')
- `shadow`: String (CSS box-shadow value)

**Validation Rules**:
- `backgroundColor`: Required, valid CSS color
- `textColor`: Required, valid CSS color
- `primaryColor`: Required, valid CSS color
- `cardBackground`: Required, valid CSS color

### ComponentStyle
Represents styling configuration for individual components.

**Fields**:
- `componentName`: String (e.g., 'TransactionTable', 'BankStatementDashboard')
- `theme`: UITheme (references UITheme)
- `customStyles`: Object (component-specific overrides)
- `responsiveBreakpoints`: Object (mobile, tablet, desktop styles)

**Validation Rules**:
- `componentName`: Required, must match existing component names
- `theme`: Required, must reference valid UITheme
- `customStyles`: Optional, must be valid CSS properties

### DataDisplayConfig
Represents configuration for data display in components.

**Fields**:
- `dateFormat`: String (e.g., 'DD/MM/YYYY')
- `currencyFormat`: String (e.g., '₹{amount}')
- `numberFormat`: String (e.g., 'en-IN')
- `maxTextLength`: Number (for truncation)
- `showTooltips`: Boolean (for hover information)

**Validation Rules**:
- `dateFormat`: Required, valid date format string
- `currencyFormat`: Required, valid currency format string
- `numberFormat`: Required, valid locale string

## Relationships

### UITheme → ComponentStyle
- **Type**: One-to-Many
- **Description**: One theme can be applied to multiple components
- **Foreign Key**: `ComponentStyle.theme` → `UITheme.id`

### ComponentStyle → DataDisplayConfig
- **Type**: One-to-One
- **Description**: Each component can have specific data display configuration
- **Foreign Key**: `DataDisplayConfig.componentName` → `ComponentStyle.componentName`

## Data Storage Strategy

### CSS Custom Properties
- Store theme values as CSS custom properties in root
- Use existing `:root` variables from App.css
- Override specific values for bank statement components

### Component-Specific Styles
- Store component styles in individual CSS files
- Use CSS modules or scoped styles
- Maintain separation of concerns

## Integration with Existing System

### Theme Integration
- Extend existing CSS custom properties
- Maintain backward compatibility
- Use existing color scheme and typography

### Component Integration
- Follow existing component patterns
- Use existing utility classes
- Maintain responsive design principles

## Performance Considerations

### CSS Optimization
- Minimize CSS specificity conflicts
- Use efficient selectors
- Leverage CSS custom properties for theming

### Component Rendering
- Ensure data display fixes don't impact performance
- Maintain existing pagination and virtualization
- Optimize chart rendering with dark theme

## UI Fix Requirements

### Theme Consistency
- Apply dark blue background (`--secondary-color: #152251`)
- Use white text for readability
- Maintain existing primary color (`--primary-color: #0ab377`)
- Apply consistent card styling with shadows

### Data Visibility
- Fix transaction table data display
- Ensure proper date formatting
- Show complete narration text
- Display transaction types correctly
- Show balance information

### Filter Alignment
- Align date range filters horizontally
- Use consistent input styling
- Apply proper spacing and gaps
- Maintain responsive behavior

### Chart Theming
- Apply dark theme to Chart.js components
- Use high contrast colors for data series
- Ensure text readability on dark background
- Maintain accessibility standards