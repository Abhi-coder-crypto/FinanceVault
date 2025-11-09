# Design Guidelines: Financial Document Management System

## Design Approach

**Selected Approach:** Design System-Based (inspired by Material Design and modern SaaS dashboards)

**Rationale:** This is a utility-focused application where security, efficiency, and data accessibility are paramount. Users need to quickly find, upload, and manage sensitive financial documents. The interface should inspire trust and professionalism while maintaining clarity and ease of use.

**Core Principles:**
- Professional trustworthiness over visual flair
- Information clarity and scanability
- Efficient task completion
- Role-based interface differentiation (Admin vs. Client views)

---

## Typography

**Font Family:**
- Primary: Inter (Google Fonts) - clean, professional, excellent readability
- Monospace: JetBrains Mono - for phone numbers, document IDs

**Hierarchy:**
- Page Headers: text-3xl font-bold (Admin), text-2xl font-semibold (Client portal)
- Section Headers: text-xl font-semibold
- Card Titles: text-lg font-medium
- Body Text: text-base font-normal
- Secondary/Meta: text-sm text-gray-600
- Captions/Labels: text-xs font-medium uppercase tracking-wide

---

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-4 or p-6
- Section spacing: space-y-6 or space-y-8
- Card gaps: gap-4
- Page margins: px-4 md:px-8 lg:px-12

**Grid Structure:**
- Admin Dashboard: Sidebar (w-64) + Main content area
- Client Portal: Centered max-w-6xl with side margins
- Document Grid: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4
- Form Layouts: Single column max-w-md for login, max-w-2xl for document upload

**Container Max-widths:**
- Forms: max-w-md
- Document lists: max-w-6xl
- Settings pages: max-w-4xl

---

## Component Library

### Navigation

**Admin Sidebar:**
- Fixed left sidebar (w-64 h-screen)
- Logo/company name at top (p-6)
- Navigation items with icons (p-4, rounded-lg)
- Active state with subtle background treatment
- Logout at bottom

**Client Portal Header:**
- Horizontal navbar (sticky top-0)
- Logo left, user info + logout right
- Phone number display with monospace font
- Clean divider border-b

### Cards & Document Items

**Document Card:**
- Rounded corners (rounded-lg)
- Subtle border (border)
- Padding p-6
- Icon representing file type (PDF icon from Heroicons)
- Document name (text-lg font-medium)
- Upload date (text-sm text-gray-600)
- Client phone number (for admin view, monospace)
- Download button (primary action)
- Delete button (admin only, secondary/danger)

**Stats Cards (Admin Dashboard):**
- Grid of 3-4 cards
- Large number (text-4xl font-bold)
- Label (text-sm uppercase tracking-wide)
- Icon in corner (from Heroicons)

### Forms

**Login Form:**
- Centered card (max-w-md mx-auto mt-20)
- Company logo/name at top (mb-8)
- Phone number input with country code prefix
- Password input with show/hide toggle
- Primary button full width
- "Remember me" checkbox
- Error messages below inputs (text-sm text-red-600)

**Document Upload Form (Admin):**
- Two-column layout (md:grid-cols-2)
- Left: Client phone number search/select, Document name input
- Right: File upload dropzone (border-2 border-dashed, p-8, rounded-lg)
- File preview after selection
- Upload progress indicator
- Submit button (w-full md:w-auto)

**Search/Filter Bar:**
- Full width input with search icon (Heroicons magnifying-glass)
- Placeholder: "Search by phone number..."
- Monospace font for phone number input
- Clear button when text entered
- Results count display

### Tables

**Document List Table (Alternative to cards):**
- Full width with horizontal scroll on mobile
- Columns: Icon, Name, Client, Upload Date, Size, Actions
- Hover state on rows
- Sticky header
- Empty state with icon and message

### Buttons

**Primary Button:**
- px-6 py-3 rounded-lg font-medium
- Used for: Login, Upload Document, Download

**Secondary Button:**
- px-4 py-2 rounded-md font-medium
- Border variant
- Used for: Cancel, View Details

**Danger Button:**
- Used for: Delete Document
- Similar sizing to secondary

**Icon Buttons:**
- Download, Delete, View actions
- p-2 rounded hover states

### Empty States

**No Documents Found:**
- Centered icon (document icon, size-16)
- Heading (text-xl font-semibold)
- Message (text-gray-600)
- Action button (if applicable)

### Modals/Overlays

**Document Preview Modal:**
- Full screen overlay (fixed inset-0)
- PDF viewer embedded (max-h-screen)
- Close button (top-right, absolute)
- Download button in header
- Navigation arrows if multiple documents

**Delete Confirmation:**
- Centered modal (max-w-md)
- Icon (warning triangle from Heroicons)
- Clear message about irreversibility
- Two buttons: Cancel + Delete (danger)

### Loading States

**Document Upload:**
- Progress bar (h-2 rounded-full)
- Percentage display
- Spinner for processing

**Page Load:**
- Skeleton screens matching content structure
- Pulsing animation

---

## Icons

**Library:** Heroicons (via CDN)

**Usage:**
- Document: document-icon
- Upload: cloud-arrow-up
- Download: arrow-down-tray
- Search: magnifying-glass
- User: user-circle
- Dashboard: squares-2x2
- Logout: arrow-right-on-rectangle
- Delete: trash
- View: eye
- Warning: exclamation-triangle

---

## Images

**No hero images** - This is a utility application. Focus is on efficiency and clarity.

**File Type Icons:** Use Heroicons' document variants to represent PDFs and other file types throughout the interface.

---

## Accessibility

- All form inputs have associated labels
- Phone number inputs use type="tel" with pattern validation
- Focus states clearly visible on all interactive elements
- Skip navigation link for keyboard users
- Error messages associated with form fields via aria-describedby
- Loading states announced to screen readers
- Sufficient contrast ratios throughout (will be ensured with final color selection)

---

## Responsive Behavior

**Mobile (<768px):**
- Sidebar becomes hamburger menu
- Document cards stack (grid-cols-1)
- Tables scroll horizontally
- Forms full width

**Tablet (768px-1024px):**
- 2-column document grid
- Sidebar remains visible or collapsible

**Desktop (>1024px):**
- 3-column document grid
- Full sidebar always visible
- Multi-column forms where appropriate