# CargoPulse Refactoring Guide

## Overview
This document outlines the comprehensive refactoring completed to make CargoPulse a professional, maintainable application with custom components, API clients, and improved design patterns.

## ✅ Completed Changes

### 1. API Clients Created
- **`src/api/parcels.api.ts`** - Complete API client for parcel operations
- **`src/api/transportMeans.api.ts`** - Complete API client for transport means operations
- **Pattern**: All API clients follow the same structure with:
  - `list()` - Paginated list with query support
  - `getById()` - Get single item
  - `create()` - Create new item
  - `update()` - Update existing item
  - `delete()` - Delete item
  - Helper functions for response parsing

### 2. Custom UI Components Created
All components are located in `src/components/ui/`:

- **Table** (`table/Table.tsx`) - Custom table with head, body, row, cell components
- **Badge** (`badge/Badge.tsx`) - Custom badge with color variants and sizes
- **Pagination** (`pagination/Pagination.tsx`) - Custom pagination component
- **Card** (`card/Card.tsx`) - Custom card component
- **Select** (`select/Select.tsx`) - Custom dropdown select
- **MultiSelect** (`multi-select/MultiSelect.tsx`) - Custom multi-select dropdown
- **Modal** (`modal/Modal.tsx`) - Custom modal component
- **TextInput** (`input/TextInput.tsx`) - Custom text input
- **Textarea** (`textarea/Textarea.tsx`) - Custom textarea
- **Switch** (`switch/Switch.tsx`) - Custom toggle switch
- **Collapse** (`collapse/Collapse.tsx`) - Custom collapsible component

### 3. Sidebar with Accordion
- **Updated** `src/components/ui/sidebar/Sidebar1.tsx`
- Supports nested navigation items with accordion functionality
- Auto-expands when child route is active
- Smooth animations and transitions

### 4. Color System Improvements
- **Updated** `src/app/globals.css`
- Professional light/dark mode color variables
- Consistent color usage across components
- Smooth transitions between themes

### 5. Analytics Grid Component
- **Created** `src/components/features/AnalyticsGrid.tsx`
- Reusable analytics display component
- Supports icons, colors, and custom styling

## 📋 Migration Pattern

### Replacing Mantine Components

#### Before (Mantine):
```tsx
import { Table, Badge, Pagination } from "@mantine/core";

<Table>
  <Table.Thead>...</Table.Thead>
  <Table.Tbody>...</Table.Tbody>
</Table>
```

#### After (Custom):
```tsx
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from "@/components/ui/table/Table";
import { Badge } from "@/components/ui/badge/Badge";
import { Pagination } from "@/components/ui/pagination/Pagination";

<Table>
  <TableHead>
    <TableRow>
      <TableHeader>...</TableHeader>
    </TableRow>
  </TableHead>
  <TableBody>
    <TableRow>
      <TableCell>...</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Using API Clients

#### Before (Direct API calls):
```tsx
import { api } from "@/api/axios";

const fetchData = async () => {
  const res = await api.get("/transportMeans");
  setData(res.data.transportMeans);
};
```

#### After (API Client):
```tsx
import { TransportMeansApi } from "@/api/transportMeans.api";

const fetchData = async () => {
  const result = await TransportMeansApi.list();
  setData(result.items);
};
```

## 🎨 Design Pattern

### Page Structure
```tsx
export default function ExamplePage() {
  // 1. State management
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // 2. Data fetching with API client
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await ExampleApi.list();
      setData(result.items);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };
  
  // 3. Filtering logic
  const filteredData = useMemo(() => {
    // Filter logic here
  }, [data, filters]);
  
  // 4. Render
  return (
    <div className="custom-black-white-theme-switch-bg custom-side-padding">
      {/* Header */}
      {/* Filters (Collapsible) */}
      {/* Analytics Grid */}
      {/* Table/Cards */}
      {/* Pagination */}
      {/* Modals */}
    </div>
  );
}
```

## 📝 Remaining Tasks

### High Priority
1. **Create remaining API clients**:
   - `src/api/payments.api.ts`
   - `src/api/paymentMethods.api.ts`
   - `src/api/pricing.api.ts`
   - `src/api/services.api.ts`
   - `src/api/testimonials.api.ts`
   - `src/api/projects.api.ts`
   - `src/api/faqs.api.ts`
   - `src/api/contacts.api.ts`
   - `src/api/issues.api.ts`

2. **Update all dashboard pages** to use:
   - Custom components instead of Mantine
   - API clients instead of direct API calls
   - New design pattern with filters, analytics, and tables

3. **Create additional custom components** if needed:
   - NumberInput
   - DatePicker
   - Menu/Dropdown
   - Tooltip

### Medium Priority
1. Add loading skeletons
2. Improve error handling
3. Add empty states consistently
4. Enhance mobile responsiveness

## 🔧 Component Usage Examples

### Badge
```tsx
<Badge color="green" variant="light" size="sm">
  Active
</Badge>
```

### Pagination
```tsx
<Pagination
  total={totalPages}
  value={currentPage}
  onChange={setCurrentPage}
  color="#FF5A00"
/>
```

### Modal
```tsx
<Modal
  opened={isOpen}
  onClose={() => setIsOpen(false)}
  title="Edit Item"
  size="lg"
>
  {/* Modal content */}
</Modal>
```

### Select
```tsx
<Select
  label="Status"
  data={statusOptions}
  value={selectedStatus}
  onChange={setSelectedStatus}
  clearable
  searchable
/>
```

## 🎯 Key Principles

1. **Always use API clients** - Never call `api.get/post/put/delete` directly
2. **Use custom components** - Replace all Mantine components
3. **Consistent styling** - Use `custom-black-white-theme-switch-*` classes
4. **Professional design** - Follow the transaction history page pattern
5. **Type safety** - Use TypeScript types from models
6. **Error handling** - Always wrap API calls in try-catch
7. **Loading states** - Show loading indicators during operations

## 📚 Reference Files

- **Design Pattern**: `src/app/(dashboards)/admin-dashboard/transportMeans/page.tsx` (needs updating)
- **API Client Example**: `src/api/parcels.api.ts`
- **Component Examples**: `src/components/ui/`
- **Color System**: `src/app/globals.css`

## 🚀 Next Steps

1. Review the created components and API clients
2. Update one page completely as a reference (e.g., transportMeans)
3. Apply the pattern to remaining pages systematically
4. Test thoroughly in both light and dark modes
5. Ensure all API calls use API clients



