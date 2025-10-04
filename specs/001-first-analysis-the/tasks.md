# Tasks: Bank Statement UI Fixes

**Input**: Design documents from `/specs/001-first-analysis-the/`
**Prerequisites**: plan.md (required), research.md, data-model.md, quickstart.md

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → research.md: Extract decisions → setup tasks
   → quickstart.md: Extract scenarios → integration tasks
3. Generate tasks by category:
   → Setup: theme variables, component structure
   → Core: data display fixes, filter alignment
   → Integration: chart theming, responsive design
   → Polish: testing, validation, performance
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Theme fixes before component fixes
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All UI issues have fix tasks?
   → All components have theme tasks?
   → All scenarios have validation tasks?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Frontend-only**: `client/src/` at repository root
- All components in `client/src/components/`
- Pages in `client/src/pages/`
- Styles in component-specific CSS files

## Phase 3.1: Theme Setup
- [x] T001 Update BankStatement page CSS to use dark theme
- [x] T002 [P] Update BankStatementDashboard component styling
- [x] T003 [P] Update TransactionTable component styling
- [x] T004 [P] Update TransactionFilters component styling
- [x] T005 [P] Update StatementCharts component styling
- [x] T006 [P] Update BankStatementUpload component styling

## Phase 3.2: Data Display Fixes
- [ ] T007 Fix transaction table data visibility issues
- [ ] T008 Fix date formatting in transaction table
- [ ] T009 Fix narration text display and truncation
- [ ] T010 Fix transaction type detection and display
- [ ] T011 Fix balance formatting and display

## Phase 3.3: Filter Alignment Fixes
- [x] T012 Fix date range filter alignment
- [x] T013 Align filter inputs with existing FilterComponent patterns
- [x] T014 Fix responsive filter layout on mobile
- [x] T015 Ensure consistent filter styling across components
- [x] T037 Improve filter UI layout and spacing

## Phase 3.4: Chart Integration
- [ ] T016 Apply dark theme to Chart.js components
- [ ] T017 Fix chart text colors for dark background
- [ ] T018 Update chart grid lines and legends for visibility
- [ ] T019 Ensure chart accessibility on dark theme
- [x] T036 Add Narration grouping option to charts

## Phase 3.5: Component Integration
- [ ] T020 Integrate all components with consistent theme
- [ ] T021 Ensure responsive design works with new theme
- [ ] T022 Test component interactions with dark theme
- [ ] T023 Verify mobile responsiveness with new styling

## Phase 3.6: Transaction Table Updates
- [x] T030 Remove Reference column from transaction table
- [x] T031 Add Actions column with Add button
- [x] T032 Integrate Form component for expense tracking
- [x] T033 Pre-fill form with transaction data
- [x] T034 Update responsive design for new column
- [x] T035 Remove pagination and sort by date (recent first)

## Phase 3.7: Polish and Validation
- [ ] T024 [P] Test all UI fixes across different screen sizes
- [ ] T025 [P] Verify accessibility with dark theme
- [ ] T026 [P] Test performance with new styling
- [ ] T027 [P] Validate cross-browser compatibility
- [ ] T028 [P] Test complete user workflow
- [ ] T029 [P] Fix any remaining visual inconsistencies

## Dependencies
- T001-T006: Theme setup tasks (T001 must complete first, T002-T006 can run in parallel)
- T007-T011: Data display fixes (can run in parallel after theme setup)
- T012-T015: Filter alignment fixes (can run in parallel after theme setup)
- T016-T019: Chart integration (can run in parallel after theme setup)
- T020-T023: Component integration (sequential, depends on all previous phases)
- T024-T029: Polish tasks (all can run in parallel after integration)

## Parallel Examples

### Phase 3.1 Theme Setup (T002-T006)
```
# Launch T002-T006 together:
Task: "Update BankStatementDashboard component styling"
Task: "Update TransactionTable component styling"
Task: "Update TransactionFilters component styling"
Task: "Update StatementCharts component styling"
Task: "Update BankStatementUpload component styling"
```

### Phase 3.2 Data Display Fixes (T007-T011)
```
# Launch T007-T011 together:
Task: "Fix transaction table data visibility issues"
Task: "Fix date formatting in transaction table"
Task: "Fix narration text display and truncation"
Task: "Fix transaction type detection and display"
Task: "Fix balance formatting and display"
```

### Phase 3.6 Polish Tasks (T024-T029)
```
# Launch T024-T029 together:
Task: "Test all UI fixes across different screen sizes"
Task: "Verify accessibility with dark theme"
Task: "Test performance with new styling"
Task: "Validate cross-browser compatibility"
Task: "Test complete user workflow"
Task: "Fix any remaining visual inconsistencies"
```

## Task Details

### T001: Update BankStatement page CSS to use dark theme
**File**: `client/src/pages/BankStatement.css`
**Description**: Apply dark blue background and white text to match existing app theme
**Dependencies**: None
**Implementation**: 
- Change background from light grey to dark blue (`var(--secondary-color)`)
- Update text colors to white
- Apply existing card styling patterns
- Use existing color variables from App.css

### T002: Update BankStatementDashboard component styling
**File**: `client/src/components/BankStatementDashboard/style.css`
**Description**: Apply dark theme to dashboard component
**Dependencies**: T001 (page theme)
**Implementation**:
- Update card backgrounds to white with shadows
- Apply dark theme colors to text and icons
- Use existing primary color for accents
- Ensure proper contrast for readability

### T003: Update TransactionTable component styling
**File**: `client/src/components/TransactionTable/style.css`
**Description**: Apply dark theme to transaction table
**Dependencies**: T001 (page theme)
**Implementation**:
- Update table background and text colors
- Apply dark theme to table headers and cells
- Ensure proper contrast for data visibility
- Use existing styling patterns for buttons and inputs

### T004: Update TransactionFilters component styling
**File**: `client/src/components/TransactionFilters/style.css`
**Description**: Apply dark theme and fix alignment issues
**Dependencies**: T001 (page theme)
**Implementation**:
- Apply dark theme to filter components
- Fix date range filter alignment
- Use existing FilterComponent styling patterns
- Ensure proper spacing and alignment

### T005: Update StatementCharts component styling
**File**: `client/src/components/StatementCharts/style.css`
**Description**: Apply dark theme to charts component
**Dependencies**: T001 (page theme)
**Implementation**:
- Update component background and text colors
- Apply dark theme to chart controls
- Ensure proper contrast for chart elements
- Use existing styling patterns

### T006: Update BankStatementUpload component styling
**File**: `client/src/components/BankStatementUpload/style.css`
**Description**: Apply dark theme to upload component
**Dependencies**: T001 (page theme)
**Implementation**:
- Update upload area styling for dark theme
- Apply proper contrast for text and icons
- Use existing button and input styling
- Ensure proper visual feedback

### T007: Fix transaction table data visibility issues
**File**: `client/src/components/TransactionTable/index.js`
**Description**: Fix data display logic in transaction table
**Dependencies**: T003 (table styling)
**Implementation**:
- Debug data mapping from parsed transactions to table display
- Ensure all transaction fields are properly rendered
- Fix any data truncation or formatting issues
- Add error handling for malformed data

### T008: Fix date formatting in transaction table
**File**: `client/src/components/TransactionTable/index.js`
**Description**: Ensure proper date formatting and display
**Dependencies**: T007 (data visibility)
**Implementation**:
- Fix date parsing and formatting logic
- Use consistent date format (DD/MM/YYYY)
- Handle different date input formats
- Add error handling for invalid dates

### T009: Fix narration text display and truncation
**File**: `client/src/components/TransactionTable/index.js`
**Description**: Ensure complete narration text is displayed
**Dependencies**: T007 (data visibility)
**Implementation**:
- Fix text truncation issues
- Ensure proper text wrapping
- Handle long narration text appropriately
- Maintain inline editing functionality

### T010: Fix transaction type detection and display
**File**: `client/src/components/TransactionTable/index.js`
**Description**: Fix transaction type logic and display
**Dependencies**: T007 (data visibility)
**Implementation**:
- Fix debit/credit detection logic
- Ensure proper type display in table
- Handle edge cases for transaction types
- Apply proper styling for different types

### T011: Fix balance formatting and display
**File**: `client/src/components/TransactionTable/index.js`
**Description**: Fix balance formatting and display
**Dependencies**: T007 (data visibility)
**Implementation**:
- Fix currency formatting for balance
- Ensure proper number formatting
- Handle negative balances correctly
- Apply consistent formatting across all amounts

### T012: Fix date range filter alignment
**File**: `client/src/components/TransactionFilters/index.js`
**Description**: Fix horizontal alignment of date range inputs
**Dependencies**: T004 (filter styling)
**Implementation**:
- Fix flexbox alignment for date inputs
- Ensure proper spacing between inputs
- Align "to" label correctly
- Use consistent input sizing

### T013: Align filter inputs with existing FilterComponent patterns
**File**: `client/src/components/TransactionFilters/style.css`
**Description**: Use existing FilterComponent styling patterns
**Dependencies**: T012 (filter alignment)
**Implementation**:
- Copy styling patterns from existing FilterComponent
- Ensure consistent input styling
- Apply proper spacing and gaps
- Maintain responsive behavior

### T014: Fix responsive filter layout on mobile
**File**: `client/src/components/TransactionFilters/style.css`
**Description**: Ensure filters work properly on mobile devices
**Dependencies**: T013 (filter patterns)
**Implementation**:
- Fix mobile layout for filter components
- Ensure proper stacking on small screens
- Maintain touch-friendly sizing
- Test on various mobile devices

### T015: Ensure consistent filter styling across components
**File**: `client/src/components/TransactionFilters/style.css`
**Description**: Maintain consistent styling with other filter components
**Dependencies**: T014 (mobile layout)
**Implementation**:
- Compare with existing FilterComponent styling
- Ensure color scheme consistency
- Apply consistent border and shadow styles
- Maintain typography consistency

### T016: Apply dark theme to Chart.js components
**File**: `client/src/components/StatementCharts/index.js`
**Description**: Configure Chart.js for dark theme
**Dependencies**: T005 (chart styling)
**Implementation**:
- Update chart options for dark background
- Configure text colors for readability
- Set proper grid line colors
- Ensure legend visibility

### T017: Fix chart text colors for dark background
**File**: `client/src/components/StatementCharts/index.js`
**Description**: Ensure all chart text is readable on dark background
**Dependencies**: T016 (chart dark theme)
**Implementation**:
- Set white/light colors for all text elements
- Configure axis labels and titles
- Update tooltip colors
- Ensure proper contrast ratios

### T018: Update chart grid lines and legends for visibility
**File**: `client/src/components/StatementCharts/index.js`
**Description**: Make chart elements visible on dark background
**Dependencies**: T017 (text colors)
**Implementation**:
- Set light colors for grid lines
- Update legend colors and background
- Ensure data series are clearly visible
- Maintain accessibility standards

### T019: Ensure chart accessibility on dark theme
**File**: `client/src/components/StatementCharts/index.js`
**Description**: Maintain accessibility with dark theme
**Dependencies**: T018 (chart visibility)
**Implementation**:
- Test color contrast ratios
- Ensure keyboard navigation works
- Verify screen reader compatibility
- Test with accessibility tools

### T020: Integrate all components with consistent theme
**File**: `client/src/pages/BankStatement.js`
**Description**: Ensure all components work together with new theme
**Dependencies**: T001-T019 (all component fixes)
**Implementation**:
- Test component integration
- Ensure consistent styling across all components
- Fix any theme conflicts
- Verify proper data flow

### T021: Ensure responsive design works with new theme
**File**: Multiple component CSS files
**Description**: Test responsive behavior with dark theme
**Dependencies**: T020 (component integration)
**Implementation**:
- Test all breakpoints with new theme
- Ensure mobile layout works correctly
- Verify tablet and desktop layouts
- Fix any responsive issues

### T022: Test component interactions with dark theme
**File**: `client/src/pages/BankStatement.js`
**Description**: Ensure all interactions work with new theme
**Dependencies**: T021 (responsive design)
**Implementation**:
- Test all user interactions
- Verify hover states and transitions
- Ensure form elements work correctly
- Test chart interactions

### T023: Verify mobile responsiveness with new styling
**File**: Multiple component CSS files
**Description**: Ensure mobile experience is optimal
**Dependencies**: T022 (component interactions)
**Implementation**:
- Test on various mobile devices
- Ensure touch targets are appropriate
- Verify scrolling and navigation
- Fix any mobile-specific issues

### T024: Test all UI fixes across different screen sizes
**File**: All component files
**Description**: Comprehensive testing across screen sizes
**Dependencies**: T023 (mobile responsiveness)
**Implementation**:
- Test on desktop, tablet, and mobile
- Verify all components render correctly
- Check for layout issues
- Document any remaining issues

### T025: Verify accessibility with dark theme
**File**: All component files
**Description**: Ensure accessibility standards are met
**Dependencies**: T024 (screen size testing)
**Implementation**:
- Test with screen readers
- Verify color contrast ratios
- Check keyboard navigation
- Test with accessibility tools

### T026: Test performance with new styling
**File**: All component files
**Description**: Ensure performance is maintained
**Dependencies**: T025 (accessibility)
**Implementation**:
- Measure rendering performance
- Check for CSS performance issues
- Test with large datasets
- Optimize if necessary

### T027: Validate cross-browser compatibility
**File**: All component files
**Description**: Ensure compatibility across browsers
**Dependencies**: T026 (performance)
**Implementation**:
- Test on Chrome, Firefox, Safari, Edge
- Check for CSS compatibility issues
- Verify JavaScript functionality
- Fix any browser-specific issues

### T028: Test complete user workflow
**File**: `client/src/pages/BankStatement.js`
**Description**: End-to-end testing of complete workflow
**Dependencies**: T027 (browser compatibility)
**Implementation**:
- Test file upload workflow
- Test data display and filtering
- Test chart interactions
- Test expense tracking integration

### T029: Fix any remaining visual inconsistencies
**File**: All component files
**Description**: Address any remaining visual issues
**Dependencies**: T028 (workflow testing)
**Implementation**:
- Identify and fix visual inconsistencies
- Ensure perfect theme alignment
- Polish final details
- Verify complete implementation

## Notes
- [P] tasks = different files, no dependencies
- Theme fixes must complete before component fixes
- Data display fixes can run in parallel after theme setup
- All polish tasks can run in parallel after integration
- Focus on maintaining existing functionality while fixing UI issues
- Ensure accessibility and performance are not compromised

## Validation Checklist
*GATE: Checked by main() before returning*

- [x] All UI issues have fix tasks
- [x] All components have theme tasks
- [x] All scenarios have validation tasks
- [x] Theme fixes before component fixes
- [x] Parallel tasks truly independent
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task