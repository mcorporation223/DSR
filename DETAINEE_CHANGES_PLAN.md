# Detainee Module Changes - Implementation Plan

## Summary of Requested Changes

1. ✅ Add detainee photos (may partially exist, needs verification)
2. ➕ Separate marital details: add distinct fields for number of children and spouse name
3. ❌ Remove arrest time field (arrestTime)
4. ❌ Remove arrival time field (arrivalTime)
5. ❌ Remove cell number field (cellNumber)

---

## Current State Analysis

### Database Schema (schema.ts)

**Existing fields to modify/remove:**
- `maritalDetails: text` (line 92) → REPLACE with 2 separate fields
- `arrestTime: timestamp` (line 106) → DELETE
- `arrivalTime: timestamp` (line 108) → DELETE
- `cellNumber: varchar` (line 111) → DELETE

**Missing fields to add:**
- `photoUrl: varchar` → ADD (for detainee photo)
- `numberOfChildren: integer` → ADD (number of children)
- `spouseName: varchar` → ADD (spouse name)

### Form (detainee-form.tsx)

**Form fields to modify:**
- Line 68: `maritalDetails` in Zod schema → REPLACE
- Lines 158-160: `arrestTime`, `arrivalTime` → DELETE
- Line 161: `cellNumber` → DELETE
- Lines 414-434: FormField maritalDetails component → REPLACE with 2 fields
- Lines 643-663: FormField arrestTime component → DELETE
- Lines 733-753: FormField arrivalTime component → DELETE
- Lines 755-771: FormField cellNumber component → DELETE

**Fields to add:**
- Photo upload field (with preview)
- numberOfChildren field (number input)
- spouseName field (text input)

---

## Detailed Implementation Plan

### Phase 1: Database Schema Modifications

**1.1 Update schema (lib/db/schema.ts)**

```typescript
// DELETE these lines:
maritalDetails: text("marital_details"),
arrestTime: timestamp("arrest_time"),
arrivalTime: timestamp("arrival_time"),
cellNumber: varchar("cell_number", { length: 50 }),

// ADD these new lines:
photoUrl: varchar("photo_url", { length: 500 }),
numberOfChildren: integer("number_of_children"),
spouseName: varchar("spouse_name", { length: 100 }),
```

**1.2 Generate and apply migration**
```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

### Phase 2: Server-side Validation Schema Updates

**2.1 Update server/schemas/detainees.ts**

```typescript
// DELETE:
maritalDetails: z.string().max(100).optional(),
arrestTime: z.string().optional(),
arrivalTime: z.string().optional(),
cellNumber: z.string().max(20).optional(),

// ADD:
photoUrl: z.string().url().max(500).optional().or(z.literal("")),
numberOfChildren: z.number().int().min(0).max(50).optional(),
spouseName: z.string().max(100).optional(),
```

### Phase 3: Form Modifications

**3.1 Update form validation schema (detainee-form.tsx)**

Around lines 48-110, update `detaineeFormSchema`:
```typescript
// DELETE:
maritalDetails: z.string().max(100, "Max 100 caractères").optional(),
arrestTime: z.string().optional(),
arrivalTime: z.string().optional(),
cellNumber: z.string().max(20, "Max 20 caractères").optional(),

// ADD:
photoUrl: z.string().optional(),
numberOfChildren: z.number().int().min(0, "Minimum 0").max(50, "Maximum 50").optional(),
spouseName: z.string().max(100, "Max 100 caractères").optional(),
```

**3.2 Update defaultValues (around lines 139-163)**

```typescript
// DELETE:
maritalDetails: "",
arrestTime: "",
arrivalTime: "",
cellNumber: "",

// ADD:
photoUrl: "",
numberOfChildren: undefined,
spouseName: "",
```

**3.3 Remove obsolete FormFields**

- Remove `maritalDetails` FormField (lines 414-434)
- Remove `arrestTime` FormField (lines 643-663)
- Remove `arrivalTime` FormField (lines 733-753)
- Remove `cellNumber` FormField (lines 755-771)

**3.4 Add new FormFields**

After `maritalStatus` field, add:

```typescript
// Number of children
<FormField
  control={form.control}
  name="numberOfChildren"
  render={({ field }) => (
    <FormItem>
      <FormLabel className="text-gray-700">Nombre d'enfants</FormLabel>
      <FormControl>
        <Input
          type="number"
          min="0"
          max="50"
          placeholder="0"
          {...field}
          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
        />
      </FormControl>
      <div className="max-h-[0.5rem]">
        <FormMessage className="text-xs" />
      </div>
    </FormItem>
  )}
/>

// Spouse name
<FormField
  control={form.control}
  name="spouseName"
  render={({ field }) => (
    <FormItem>
      <FormLabel className="text-gray-700">Nom du conjoint(e)</FormLabel>
      <FormControl>
        <Input
          placeholder="Marie Mukamba"
          maxLength={100}
          {...field}
        />
      </FormControl>
      <div className="max-h-[0.5rem]">
        <FormMessage className="text-xs" />
      </div>
    </FormItem>
  )}
/>

// Photo upload (add at top of form in "Personal Information" section)
<FormField
  control={form.control}
  name="photoUrl"
  render={({ field }) => (
    <FormItem className="md:col-span-2">
      <FormLabel className="text-gray-700">Photo du détenu</FormLabel>
      <FormControl>
        {/* TODO: Implement image upload component with preview */}
        <Input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            // Handle file upload logic here
            // Upload to server and get URL
            const file = e.target.files?.[0];
            if (file) {
              // TODO: Call upload API endpoint
              // const url = await uploadFile(file);
              // field.onChange(url);
            }
          }}
        />
      </FormControl>
      <div className="max-h-[0.5rem]">
        <FormMessage className="text-xs" />
      </div>
    </FormItem>
  )}
/>
```

### Phase 4: tRPC Router Updates

**4.1 Verify/update server/routers/detainees.ts**

Ensure new fields are handled in:
- `create` mutation
- `update` mutation
- Type validation with Zod schemas

### Phase 5: Display Updates (list/detail pages)

**5.1 Update detainee table display**

File: `app/(dashboard)/detainees/page.tsx` (likely)

- Add photo column (thumbnail)
- Remove display of arrivalTime, arrestTime, cellNumber
- Add display of numberOfChildren, spouseName if needed

**5.2 Update detainee detail page**

If a detail page exists:
- Display photo in full size
- Show number of children and spouse name
- Remove deleted fields

### Phase 6: Data Migration (optional but recommended)

**6.1 Data migration script**

If existing data has `maritalDetails`, create a script to:
1. Parse existing `maritalDetails` field
2. Extract number of children and spouse name if possible
3. Populate new fields

---

## Files to Modify

1. ✅ `lib/db/schema.ts` - Table definition
2. ✅ `server/schemas/detainees.ts` - Server-side Zod validation
3. ✅ `app/(dashboard)/detainees/components/detainee-form.tsx` - Create/edit form
4. ⚠️ `server/routers/detainees.ts` - tRPC router (verification)
5. ⚠️ `app/(dashboard)/detainees/page.tsx` - List page (if exists)
6. ⚠️ Other detainee detail display files

---

## Key Considerations

### Detainee Photos
- Decide on storage system (local filesystem vs cloud like S3/Cloudinary)
- Implement server-side upload (likely via `/api/upload`)
- Handle validation (max size, accepted types)
- Implement image preview in form
- Handle photo deletion/replacement

### Data Migration
- Existing data in `maritalDetails` will be lost if we delete the field
- Option 1: Keep `maritalDetails` read-only for historical data
- Option 2: Migrate data before deletion
- Option 3: Accept data loss (if no important data exists)

### Compatibility
- Verify all components using these fields are updated
- Test create form
- Test edit form (if exists)
- Verify display in reports/exports

---

## Questions to Clarify Before Implementation

1. **Photo**: Which storage system do you prefer? (local filesystem or cloud storage)
2. **Migration**: Is there existing data in `maritalDetails` to preserve?
3. **Number of children**: Reasonable maximum value? (suggested: 50)
4. **Photo**: Maximum file size? (suggested: 5MB)
5. **Photo**: Accepted formats? (suggested: JPEG, PNG, WebP)
6. **Edit form**: Is there a separate form for editing existing detainees?

---

## Estimated Timeline

- Phase 1 (DB): 15 minutes
- Phase 2 (Zod Schema): 10 minutes
- Phase 3 (Form): 30-45 minutes (depends on photo implementation)
- Phase 4 (Router): 10 minutes
- Phase 5 (Display): 20-30 minutes
- Phase 6 (Migration): 20-40 minutes (if needed)

**Total**: 1h45 - 2h30 (depending on photo upload complexity)

---

## Next Steps

Once this plan is validated:
1. Confirm answers to questions above
2. Start implementation phase by phase
3. Test each phase before moving to the next
4. Create data migration if necessary
