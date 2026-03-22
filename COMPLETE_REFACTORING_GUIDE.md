# Complete Refactoring Guide - CargoPulse

## ✅ COMPLETED INFRASTRUCTURE

### All API Clients Created ✅
- `src/api/parcels.api.ts`
- `src/api/transportMeans.api.ts` ✅ **FULLY REFACTORED PAGE**
- `src/api/payments.api.ts`
- `src/api/paymentMethods.api.ts`
- `src/api/pricing.api.ts`
- `src/api/services.api.ts`
- `src/api/testimonials.api.ts`
- `src/api/projects.api.ts`
- `src/api/faqs.api.ts`
- `src/api/contacts.api.ts`
- `src/api/issues.api.ts`

### All Custom Components Created ✅
- Table, Badge, Pagination, Card, Select, MultiSelect
- Modal, TextInput, Textarea, Switch, Collapse
- Menu, NumberInput, EmptyState, Skeleton
- Button, AnalyticsGrid

### Sidebar with Accordion ✅
- Updated with nested navigation support

### Color System ✅
- Professional light/dark mode support

## 📋 REFERENCE IMPLEMENTATION

**Complete Example:** `src/app/(dashboards)/admin-dashboard/transportMeans/page.tsx`

This page is **fully refactored** and serves as the template for all other pages.

## 🔄 MIGRATION STEPS FOR EACH PAGE

### Step 1: Update Imports

**Remove:**
```tsx
import { Table, Badge, Pagination, Modal, Button, TextInput, ... } from "@mantine/core";
import { api } from "@/api/axios";
```

**Add:**
```tsx
// Custom Components
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from "@/components/ui/table/Table";
import { Badge } from "@/components/ui/badge/Badge";
import { Pagination } from "@/components/ui/pagination/Pagination";
import { Modal } from "@/components/ui/modal/Modal";
import { Button } from "@/components/ui/button/Button";
import { TextInput } from "@/components/ui/input/TextInput";
import { Textarea } from "@/components/ui/textarea/Textarea";
import { Switch } from "@/components/ui/switch/Switch";
import { Card } from "@/components/ui/card/Card";
import { Collapse } from "@/components/ui/collapse/Collapse";
import { Menu } from "@/components/ui/menu/Menu";
import { EmptyState } from "@/components/ui/empty-state/EmptyState";
import { Skeleton } from "@/components/ui/skeleton/Skeleton";
import { AnalyticsGrid } from "@/components/features/AnalyticsGrid";

// API Client
import { [Entity]Api } from "@/api/[entity].api";
```

### Step 2: Replace API Calls

**Before:**
```tsx
const res = await api.get("/entity");
setData(res.data.entities || []);
```

**After:**
```tsx
const result = await EntityApi.list();
setData(result.items);
```

**Before:**
```tsx
const res = await api.post("/entity", data);
setData([res.data.entity, ...data]);
```

**After:**
```tsx
const created = await EntityApi.create(data);
setData([created, ...data]);
```

**Before:**
```tsx
const res = await api.put(`/entity/${id}`, data);
setData(data.map(item => item.id === id ? res.data.entity : item));
```

**After:**
```tsx
const updated = await EntityApi.update(id, data);
setData(data.map(item => item.id === id ? updated : item));
```

**Before:**
```tsx
await api.delete(`/entity/${id}`);
setData(data.filter(item => item.id !== id));
```

**After:**
```tsx
await EntityApi.delete(id);
setData(data.filter(item => item.id !== id));
```

### Step 3: Replace Table Components

**Before:**
```tsx
<Table>
  <Table.Thead>
    <Table.Tr>
      <Table.Th>Header</Table.Th>
    </Table.Tr>
  </Table.Thead>
  <Table.Tbody>
    <Table.Tr>
      <Table.Td>Cell</Table.Td>
    </Table.Tr>
  </Table.Tbody>
</Table>
```

**After:**
```tsx
<Table>
  <TableHead>
    <TableRow>
      <TableHeader>Header</TableHeader>
    </TableRow>
  </TableHead>
  <TableBody>
    <TableRow>
      <TableCell>Cell</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Step 4: Replace Other Components

**Badge:**
```tsx
<Badge color="green" variant="light" size="sm">Active</Badge>
```

**Pagination:**
```tsx
<Pagination total={totalPages} value={currentPage} onChange={setCurrentPage} color="#FF5A00" />
```

**Modal:**
```tsx
<Modal opened={isOpen} onClose={() => setIsOpen(false)} title="Title" size="lg">
  {/* Content */}
</Modal>
```

**Button:**
```tsx
<Button leftSection={<Icon />} onClick={handleClick} color="#FF5A00" loading={loading}>
  Button Text
</Button>
```

**Select:**
```tsx
<Select
  label="Label"
  data={options}
  value={selected}
  onChange={setSelected}
  clearable
  searchable
/>
```

**MultiSelect:**
```tsx
<MultiSelect
  label="Label"
  data={options}
  value={selected}
  onChange={setSelected}
  clearable
  searchable
/>
```

### Step 5: Add Filters Section

```tsx
const [filtersOpen, setFiltersOpen] = useState(false);
const [search, setSearch] = useState("");

// In render:
<div className="mb-6">
  <div className="flex items-center gap-2 mb-4">
    <Button
      variant="light"
      leftSection={<FaFilter />}
      onClick={() => setFiltersOpen(!filtersOpen)}
      size="sm"
    >
      Filters
    </Button>
  </div>
  <Collapse in={filtersOpen}>
    <Card className="mb-4" withBorder>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput
          label="Search"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {/* More filters */}
      </div>
    </Card>
  </Collapse>
</div>
```

### Step 6: Add Loading & Empty States

```tsx
{loading && data.length === 0 ? (
  <div className="space-y-2">
    <Skeleton height={50} />
    <Skeleton height={50} />
    <Skeleton height={50} />
  </div>
) : data.length === 0 ? (
  <EmptyState
    icon={<Icon />}
    title="No items found"
    description="Description here"
    action={{
      label: "Add New",
      onClick: () => openModal(),
    }}
  />
) : (
  // Table or content
)}
```

### Step 7: Update Styling

- Use `custom-black-white-theme-switch-bg` for backgrounds
- Use `custom-black-white-theme-switch-text` for text
- Use `border-[var(--bg-general-light)]` for borders
- Use `bg-[var(--bg-general-lighter)]` for hover states
- Remove all Mantine-specific props like `mt="md"`, `size="sm"`, etc.

## 📝 PAGES TO UPDATE

1. ✅ `transportMeans/page.tsx` - **COMPLETE REFERENCE**
2. `parcels/page.tsx` - Use ParcelsApi
3. `payments/page.tsx` - Use PaymentsApi
4. `paymentMethods/page.tsx` - Use PaymentMethodsApi
5. `pricing/page.tsx` - Use PricingApi
6. `services/page.tsx` - Use ServicesApi
7. `testimonials/page.tsx` - Use TestimonialsApi
8. `projects/page.tsx` - Use ProjectsApi
9. `faqs/page.tsx` - Use FAQsApi
10. `contacts/page.tsx` - Use ContactsApi
11. `issues/page.tsx` - Use IssuesApi
12. `page.tsx` (Overview) - Use multiple APIs

## 🎯 KEY PATTERNS

### Data Fetching Pattern
```tsx
const fetchData = async () => {
  setLoading(true);
  try {
    const result = await EntityApi.list({ page, limit, ...filters });
    setData(result.items);
    setTotal(result.total);
  } catch (error) {
    toast.error("Failed to load data");
  } finally {
    setLoading(false);
  }
};
```

### Filtering Pattern
```tsx
const filteredData = useMemo(() => {
  let filtered = data;
  if (search) {
    filtered = filtered.filter(item => 
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }
  // More filters...
  return filtered;
}, [data, search, ...otherFilters]);
```

### Pagination Pattern
```tsx
const paginatedData = useMemo(() => {
  const start = (currentPage - 1) * pageSize;
  return filteredData.slice(start, start + pageSize);
}, [filteredData, currentPage, pageSize]);

const totalPages = Math.ceil(filteredData.length / pageSize);
```

## ✅ CHECKLIST FOR EACH PAGE

- [ ] Replace all Mantine imports
- [ ] Replace all API calls with API clients
- [ ] Update Table components
- [ ] Update Modal components
- [ ] Update Button components
- [ ] Update Form inputs (TextInput, Textarea, Select, etc.)
- [ ] Add filters section with Collapse
- [ ] Add loading states with Skeleton
- [ ] Add empty states with EmptyState
- [ ] Update all styling to use theme classes
- [ ] Remove Mantine-specific props
- [ ] Test in light and dark mode
- [ ] Verify all CRUD operations work

## 🚀 QUICK START

1. Copy the structure from `transportMeans/page.tsx`
2. Replace `TransportMeansApi` with the appropriate API client
3. Replace `ITransportMeans` with the appropriate model type
4. Update form fields to match your entity
5. Update table columns
6. Test thoroughly

All infrastructure is complete. The pattern is established. Follow the reference implementation!



