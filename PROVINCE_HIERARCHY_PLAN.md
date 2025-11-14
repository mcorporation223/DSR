# Province-Based Data Segregation & Hierarchical Access Control

> **Status**: Planning Phase
> **Created**: 2025-11-14
> **Last Updated**: 2025-11-14

## Overview

Implement a multi-tenant data isolation system where data and users are segregated by province (North-Kivu and South-Kivu), with a hierarchical access control system that allows top-level administrators to view all data across provinces.

## Business Requirements

### Data Segregation
- Data will be divided between **North-Kivu** and **South-Kivu**
- Users assigned to North-Kivu should only see North-Kivu data
- Users assigned to South-Kivu should only see South-Kivu data
- **Users can belong to multiple provinces**
- Top-level administrators should see data from both provinces

### User Hierarchy
1. **National Level** - Can view and manage all provinces
2. **Provincial Admin Level** - Can view and manage only their assigned province(s), can create users
3. **Provincial User Level** - Can view and interact with only their assigned province(s), limited permissions

## Confirmed Decisions

✅ **Different permission levels within a province**: Yes (Admin vs User)
✅ **Users can belong to multiple provinces**: Yes
✅ **Provincial admins can create new users**: Yes

## Design Decisions to Make

### 1. Province Taxonomy

**Recommended: Option A (Enum Field)** - Since we're starting with just North-Kivu and South-Kivu

```typescript
province: "north_kivu" | "south_kivu"
```
- ✅ Simple, performant
- ✅ Type-safe
- ✅ Sufficient for current needs
- ❌ Requires code change to add new provinces (acceptable for now)

**Decision Needed**: Confirm enum approach or opt for flexible table

### 2. User Role Hierarchy

**Confirmed Role Structure**:

```typescript
role: "national_admin" | "provincial_admin" | "provincial_user"
```

| Role | Access Level | Permissions |
|------|-------------|-------------|
| **National Admin** | All provinces | ✅ View all data (North + South)<br>✅ Manage users across all provinces<br>✅ Full CRUD operations<br>✅ System configuration<br>✅ Assign users to any province |
| **Provincial Admin** | Assigned province(s) | ✅ View only their province(s) data<br>✅ Create users for their province(s)<br>✅ Manage users within their province(s)<br>✅ Full CRUD for their province(s)<br>✅ Provincial reports |
| **Provincial User** | Assigned province(s) | ✅ View only their province(s) data<br>✅ Limited CRUD operations<br>❌ Cannot manage users<br>❌ Cannot create users |

### 3. Database Schema Changes

#### Many-to-Many: User-Province Relationship

Since users can belong to multiple provinces, we need a junction table:

```typescript
// New table: user_provinces
userProvinces {
  id: uuid PRIMARY KEY
  userId: uuid NOT NULL → users(id) ON DELETE CASCADE
  province: "north_kivu" | "south_kivu" NOT NULL
  createdAt: timestamp
}

// Composite unique constraint: (userId, province)
// Index on userId for fast lookups
```

#### Users Table
```typescript
users {
  id: uuid
  email: string
  password: string
  role: "national_admin" | "provincial_admin" | "provincial_user"
  // NO province field - relationship handled via userProvinces table
  isActive: boolean
  setupToken: string | null
  setupTokenExpiry: timestamp | null
  resetToken: string | null
  resetTokenExpiry: timestamp | null
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### All Data Tables
Add `province` field to:
- ✅ `detainees`
- ✅ `employees`
- ✅ `incidents` (and cascades to `victims`)
- ✅ `seizures`
- ✅ `statements`
- ✅ `reports`

```typescript
// Example: detainees table
detainees {
  id: uuid
  province: "north_kivu" | "south_kivu" NOT NULL
  name: string
  fatherName: string
  // ... existing fields
}
```

#### Audit Logs Enhancement
```typescript
auditLogs {
  id: uuid
  userId: uuid
  province: "north_kivu" | "south_kivu" | null  // null for system-level actions
  action: string
  entityType: string
  entityId: uuid
  details: jsonb
  timestamp: timestamp
}
```

**Index Strategy**:
```sql
-- User-province relationship
CREATE UNIQUE INDEX idx_user_provinces_unique ON user_provinces(user_id, province);
CREATE INDEX idx_user_provinces_user ON user_provinces(user_id);
CREATE INDEX idx_user_provinces_province ON user_provinces(province);

-- Data tables
CREATE INDEX idx_detainees_province ON detainees(province);
CREATE INDEX idx_employees_province ON employees(province);
CREATE INDEX idx_incidents_province ON incidents(province);
CREATE INDEX idx_seizures_province ON seizures(province);
CREATE INDEX idx_audit_logs_province ON audit_logs(province);

-- Composite indexes for common queries
CREATE INDEX idx_detainees_province_status ON detainees(province, status);
CREATE INDEX idx_seizures_province_status ON seizures(province, status);
```

### 4. Access Control Implementation

#### tRPC Context Enhancement

```typescript
// server/trpc.ts - Enhanced context with provinces
export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const session = await getServerAuthSession(opts)

  let userProvinces: string[] = []

  if (session?.user) {
    if (session.user.role === "national_admin") {
      userProvinces = ["north_kivu", "south_kivu"]  // All provinces
    } else {
      // Fetch user's assigned provinces
      const provinces = await db
        .select()
        .from(userProvincesTable)
        .where(eq(userProvincesTable.userId, session.user.id))

      userProvinces = provinces.map(p => p.province)
    }
  }

  return {
    session,
    db,
    user: session?.user,
    userProvinces,  // Available in all procedures
  }
}
```

#### Province-Scoped Procedure

```typescript
// server/trpc.ts
const provinceScopedProcedure = protectedProcedure
  .use(async ({ ctx, next }) => {
    const { user, userProvinces } = ctx

    if (!userProvinces || userProvinces.length === 0) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "User has no province assigned"
      })
    }

    return next({
      ctx: {
        ...ctx,
        userProvinces,  // Array of provinces user can access
        isNationalAdmin: user.role === "national_admin",
      }
    })
  })
```

#### Query Filtering Pattern

```typescript
// Single province filter
const detainees = await db.select()
  .from(detaineesTable)
  .where(
    and(
      eq(detaineesTable.status, "in_custody"),
      inArray(detaineesTable.province, ctx.userProvinces)
    )
  )

// Example: Get detainees - user sees only provinces they have access to
getAll: provinceScopedProcedure
  .input(getAllDetaineesSchema)
  .query(async ({ ctx, input }) => {
    const detainees = await ctx.db
      .select()
      .from(detaineesTable)
      .where(inArray(detaineesTable.province, ctx.userProvinces))
      .orderBy(desc(detaineesTable.createdAt))

    return detainees
  })
```

#### Mutation Protection with Province Selection

```typescript
// Create detainee - enforce province access
create: provinceScopedProcedure
  .input(createDetaineeSchema)
  .mutation(async ({ ctx, input }) => {
    const { province } = input

    // Verify user has access to this province
    if (!ctx.userProvinces.includes(province)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `You don't have access to ${province}`
      })
    }

    const [result] = await ctx.db.insert(detaineesTable).values({
      ...input,
      province,
      createdBy: ctx.user.id,
    }).returning()

    await logAction(ctx, "create", "detainee", result.id, {
      ...input,
      province
    })

    return result
  })
```

#### User Management with Province Constraints

```typescript
// Provincial admin creating a user
createUser: protectedProcedure
  .input(createUserSchema)  // includes: email, role, provinces: string[]
  .mutation(async ({ ctx, input }) => {
    const { email, role, provinces } = input

    // Provincial admins can only create users for their own provinces
    if (ctx.user.role === "provincial_admin") {
      // Check if requested provinces are within admin's scope
      const invalidProvinces = provinces.filter(
        p => !ctx.userProvinces.includes(p)
      )

      if (invalidProvinces.length > 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `You cannot assign users to: ${invalidProvinces.join(", ")}`
        })
      }

      // Provincial admins cannot create national admins
      if (role === "national_admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Provincial admins cannot create national admins"
        })
      }
    }

    // Create user
    const [user] = await ctx.db.insert(usersTable).values({
      email,
      role,
      setupToken: generateToken(),
      setupTokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    }).returning()

    // Assign provinces
    await ctx.db.insert(userProvincesTable).values(
      provinces.map(province => ({
        userId: user.id,
        province,
      }))
    )

    // Send setup email
    await sendSetupEmail(user.email, user.setupToken)

    await logAction(ctx, "create", "user", user.id, {
      email,
      role,
      provinces
    })

    return user
  })
```

### 5. UI/UX Implementation

#### For National Admins

**Dashboard**:
Option A: Combined stats with province breakdown (Recommended)
```
┌─────────────────────────────────────┐
│ Total Detainees: 150               │
│ ├── North-Kivu: 85                 │
│ └── South-Kivu: 65                 │
│                                     │
│ Total Employees: 45                │
│ ├── North-Kivu: 25                 │
│ └── South-Kivu: 20                 │
└─────────────────────────────────────┘
```

**Data Tables**:
- Add "Province" column (with badge/color)
- Province filter dropdown: `[All] [North-Kivu] [South-Kivu]`
- Multi-select filter for users with multiple provinces

**Forms**:
- Province dropdown (required)
- Show all provinces as options
- For users with multiple provinces: checkboxes or multi-select

**User Creation Form** (National Admin):
```
Email: [________________]
Role: [National Admin ▼] [Provincial Admin] [Provincial User]
Provinces: ☑ North-Kivu  ☑ South-Kivu
```

#### For Provincial Admins

**Dashboard**:
- Show combined stats for all provinces they have access to
- If multiple provinces: breakdown by province
- Province indicator in header

**Data Tables**:
- Province column shown if admin has multiple provinces
- Province filter available if multiple provinces
- Automatic filtering to only their provinces

**Forms**:
- Province dropdown with only their provinces
- Required field
- If only one province: auto-select and disable

**User Creation Form** (Provincial Admin):
```
Email: [________________]
Role: [Provincial Admin ▼] [Provincial User]  // Cannot create National Admin
Provinces: ☑ North-Kivu  ☐ South-Kivu  // Only provinces they have access to
```

#### For Provincial Users

**Dashboard**:
- Show stats for their province(s)
- If multiple provinces: combined or tabbed view

**Data Tables**:
- Province column if multiple provinces assigned
- Automatic filtering to their provinces

**Forms**:
- Province dropdown with only their provinces
- Required field
- If only one province: auto-select and disable

### 6. Data Creation Flow Examples

```typescript
// Provincial User (only North-Kivu access) creates detainee
{
  name: "John Doe",
  province: "north_kivu"  // Only option available in dropdown
}

// Provincial Admin (North-Kivu + South-Kivu) creates detainee
{
  name: "Jane Doe",
  province: "south_kivu"  // Can choose from: north_kivu, south_kivu
}

// National Admin creates detainee
{
  name: "Bob Smith",
  province: "north_kivu"  // Can choose from: north_kivu, south_kivu
}

// Provincial Admin (North-Kivu) creates new user
{
  email: "newuser@example.com",
  role: "provincial_user",
  provinces: ["north_kivu"]  // Can only assign to north_kivu
}

// National Admin creates new user
{
  email: "newadmin@example.com",
  role: "provincial_admin",
  provinces: ["north_kivu", "south_kivu"]  // Can assign to both
}
```

### 7. Migration Strategy

#### Phase 1: Create User-Province Junction Table
```sql
-- Migration: Create user_provinces table
CREATE TABLE user_provinces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  province VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_user_provinces_unique ON user_provinces(user_id, province);
CREATE INDEX idx_user_provinces_user ON user_provinces(user_id);
CREATE INDEX idx_user_provinces_province ON user_provinces(province);
```

#### Phase 2: Add Province to Data Tables
```sql
-- Add province field (nullable initially)
ALTER TABLE detainees ADD COLUMN province VARCHAR(50);
ALTER TABLE employees ADD COLUMN province VARCHAR(50);
ALTER TABLE incidents ADD COLUMN province VARCHAR(50);
ALTER TABLE seizures ADD COLUMN province VARCHAR(50);
ALTER TABLE statements ADD COLUMN province VARCHAR(50);
ALTER TABLE reports ADD COLUMN province VARCHAR(50);
ALTER TABLE audit_logs ADD COLUMN province VARCHAR(50);
```

#### Phase 3: Data Assignment
**Decision Needed**: How to assign provinces to existing data?

**Option 1: Default to North-Kivu**
```sql
UPDATE detainees SET province = 'north_kivu' WHERE province IS NULL;
UPDATE employees SET province = 'north_kivu' WHERE province IS NULL;
-- etc.
```

**Option 2: Admin UI for manual assignment**
- Create temporary admin page
- Show all records without province
- Allow bulk or individual assignment

**Option 3: Smart assignment based on location field**
```sql
-- If location field contains clues
UPDATE detainees
SET province = CASE
  WHEN location LIKE '%Goma%' THEN 'north_kivu'
  WHEN location LIKE '%Bukavu%' THEN 'south_kivu'
  ELSE 'north_kivu'
END
WHERE province IS NULL;
```

#### Phase 4: Make Province NOT NULL
```sql
ALTER TABLE detainees ALTER COLUMN province SET NOT NULL;
ALTER TABLE employees ALTER COLUMN province SET NOT NULL;
ALTER TABLE incidents ALTER COLUMN province SET NOT NULL;
ALTER TABLE seizures ALTER COLUMN province SET NOT NULL;
ALTER TABLE statements ALTER COLUMN province SET NOT NULL;
ALTER TABLE reports ALTER COLUMN province SET NOT NULL;
-- audit_logs.province can remain nullable for system actions
```

#### Phase 5: Assign Provinces to Existing Users
```sql
-- Assign all existing admins to both provinces
INSERT INTO user_provinces (user_id, province)
SELECT id, 'north_kivu' FROM users WHERE role = 'admin';

INSERT INTO user_provinces (user_id, province)
SELECT id, 'south_kivu' FROM users WHERE role = 'admin';

-- Update role to national_admin
UPDATE users SET role = 'national_admin' WHERE role = 'admin';

-- Assign all existing regular users to North-Kivu (or ask admin to reassign)
INSERT INTO user_provinces (user_id, province)
SELECT id, 'north_kivu' FROM users WHERE role = 'user';

-- Update role to provincial_user
UPDATE users SET role = 'provincial_user' WHERE role = 'user';
```

#### Phase 6: Add Indexes
```sql
CREATE INDEX idx_detainees_province ON detainees(province);
CREATE INDEX idx_employees_province ON employees(province);
CREATE INDEX idx_incidents_province ON incidents(province);
CREATE INDEX idx_seizures_province ON seizures(province);
CREATE INDEX idx_detainees_province_status ON detainees(province, status);
CREATE INDEX idx_seizures_province_status ON seizures(province, status);
```

### 8. User Management Permissions Matrix

| Action | National Admin | Provincial Admin | Provincial User |
|--------|---------------|------------------|-----------------|
| Create National Admin | ✅ | ❌ | ❌ |
| Create Provincial Admin | ✅ | ✅ (own provinces) | ❌ |
| Create Provincial User | ✅ | ✅ (own provinces) | ❌ |
| Assign to any province | ✅ | ❌ | ❌ |
| Assign to own provinces | ✅ | ✅ | ❌ |
| View all users | ✅ | ❌ (only own provinces) | ❌ |
| Edit any user | ✅ | ❌ (only own provinces) | ❌ |
| Delete any user | ✅ | ❌ (only own provinces) | ❌ |

### 9. Cross-Province Features

#### Data Transfer Between Provinces
**Question**: Should national admins be able to transfer detainees/data between provinces?

**If Yes**:
```typescript
transferDetainee: adminProcedure  // National admin only
  .input(z.object({
    detaineeId: z.string(),
    fromProvince: z.enum(["north_kivu", "south_kivu"]),
    toProvince: z.enum(["north_kivu", "south_kivu"]),
    reason: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { detaineeId, fromProvince, toProvince, reason } = input

    await ctx.db.update(detaineesTable)
      .set({ province: toProvince })
      .where(eq(detaineesTable.id, detaineeId))

    await logAction(ctx, "transfer", "detainee", detaineeId, {
      fromProvince,
      toProvince,
      reason
    })
  })
```

#### Cross-Province Reports
**Question**: Should there be comparative/combined reports?

**If Yes**:
```typescript
getCrossProvinceStats: adminProcedure
  .query(async ({ ctx }) => {
    const stats = await ctx.db.select({
      province: detaineesTable.province,
      status: detaineesTable.status,
      count: sql<number>`count(*)`,
    })
    .from(detaineesTable)
    .groupBy(detaineesTable.province, detaineesTable.status)

    return stats
  })
```

### 10. NextAuth Session Enhancement

Update session to include provinces:

```typescript
// server/auth.ts
callbacks: {
  async session({ session, token }) {
    if (session.user) {
      session.user.id = token.sub!
      session.user.role = token.role as string

      // Fetch user's provinces
      if (token.role === "national_admin") {
        session.user.provinces = ["north_kivu", "south_kivu"]
      } else {
        const userProvinces = await db
          .select()
          .from(userProvincesTable)
          .where(eq(userProvincesTable.userId, token.sub!))

        session.user.provinces = userProvinces.map(p => p.province)
      }
    }
    return session
  },
  async jwt({ token, user }) {
    if (user) {
      token.role = user.role
    }
    return token
  }
}

// types/next-auth.d.ts
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      role: string
      provinces: string[]  // Added
    }
  }

  interface User {
    role: string
  }
}
```

## Questions Requiring Decisions

### Critical Questions

1. **Province Taxonomy**:
   - ✅ Confirm enum approach ("north_kivu" | "south_kivu")
   - Or choose flexible table for future expansion?

2. **Existing Data Migration**:
   - How should we assign provinces to existing records?
   - **Options**: Default all to North-Kivu, manual assignment UI, or smart assignment
   - **Recommendation**: Default to North-Kivu, then allow admin to reassign

3. **National Admin Dashboard**:
   - Combined stats view (recommended) or province selector?
   - **Recommendation**: Combined view with breakdown by province

4. **Cross-Province Data Transfer**:
   - Should national admins transfer detainees between provinces?
   - **Recommendation**: Yes, with audit trail

5. **User Display in Multi-Province Context**:
   - How to display users who belong to both provinces?
   - Show as "North-Kivu, South-Kivu" or separate badges?

## Implementation Phases

### Phase 1: Database Schema (Week 1)
- [x] Decisions confirmed
- [ ] Create user_provinces junction table
- [ ] Add province field to all data tables (nullable)
- [ ] Create migration scripts
- [ ] Add database indexes
- [ ] Update Drizzle schema definitions

### Phase 2: Data Migration (Week 1)
- [ ] Assign provinces to existing data
- [ ] Assign provinces to existing users
- [ ] Update user roles (admin → national_admin, user → provincial_user)
- [ ] Make province fields NOT NULL
- [ ] Verify data integrity

### Phase 3: Access Control (Week 2)
- [ ] Update NextAuth session to include provinces array
- [ ] Fetch user provinces in tRPC context
- [ ] Create province-scoped tRPC procedure
- [ ] Update all tRPC routers with province filtering
- [ ] Add province validation middleware
- [ ] Update audit logging to track province

### Phase 4: Backend Logic (Week 2-3)
- [ ] Update all queries with province filters (inArray)
- [ ] Modify create/update mutations to enforce province access
- [ ] Implement user creation with province assignment
- [ ] Add province transfer endpoints (if approved)
- [ ] Add user-province management endpoints
- [ ] Update dashboard stats queries for multi-province

### Phase 5: Frontend UI (Week 3-4)
- [ ] Update forms to include province dropdown
- [ ] Add province selection/checkboxes in user creation
- [ ] Add province column to data tables
- [ ] Add province badges/indicators
- [ ] Update dashboard with province-segmented stats
- [ ] Add province filter to tables
- [ ] Update user profile to show provinces (badges)
- [ ] Create user-province management UI

### Phase 6: Testing (Week 4)
- [ ] Test provincial user can only see their province data
- [ ] Test provincial admin can create users for their provinces
- [ ] Test provincial admin cannot create national admin
- [ ] Test multi-province user sees combined data
- [ ] Test national admin sees all data
- [ ] Test province access validation on all mutations
- [ ] Test user-province assignment/removal
- [ ] Verify audit trail accuracy

### Phase 7: Documentation & Deployment (Week 5)
- [ ] Update CLAUDE.md with new architecture
- [ ] Document province management procedures
- [ ] Create user guide for province system
- [ ] Train administrators on user-province assignment
- [ ] Deploy to staging
- [ ] User acceptance testing
- [ ] Deploy to production
- [ ] Monitor for issues

## Technical Implementation Details

### Drizzle Schema Updates

```typescript
// lib/db/schema.ts

// New: User-Province junction table
export const userProvinces = pgTable("user_provinces", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  province: text("province").notNull(),  // "north_kivu" | "south_kivu"
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueUserProvince: unique().on(table.userId, table.province),
}))

// Updated: Users table (remove province field if it exists)
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  password: text("password"),
  role: text("role").notNull(),  // "national_admin" | "provincial_admin" | "provincial_user"
  // NO province field - handled via userProvinces table
  isActive: boolean("is_active").default(true).notNull(),
  setupToken: text("setup_token"),
  setupTokenExpiry: timestamp("setup_token_expiry"),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Updated: Add province to detainees
export const detainees = pgTable("detainees", {
  id: uuid("id").primaryKey().defaultRandom(),
  province: text("province").notNull(),  // "north_kivu" | "south_kivu"
  name: text("name").notNull(),
  // ... rest of fields
})

// Similar updates for employees, incidents, seizures, statements, reports
```

### tRPC Router Example

```typescript
// server/routers/detainees.ts
export const detaineesRouter = router({
  getAll: provinceScopedProcedure
    .input(z.object({
      provinceFilter: z.enum(["north_kivu", "south_kivu"]).optional(),
      status: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      // If user provides specific province filter, verify access
      let provincesToQuery = ctx.userProvinces

      if (input.provinceFilter) {
        if (!ctx.userProvinces.includes(input.provinceFilter)) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "No access to this province"
          })
        }
        provincesToQuery = [input.provinceFilter]
      }

      const detainees = await ctx.db.select()
        .from(detaineesTable)
        .where(
          and(
            inArray(detaineesTable.province, provincesToQuery),
            input.status ? eq(detaineesTable.status, input.status) : undefined
          )
        )
        .orderBy(desc(detaineesTable.createdAt))

      return detainees
    }),
})
```

## Success Criteria

- [ ] Provincial users only see data from their assigned province(s)
- [ ] Users with multiple provinces see combined data from all assigned provinces
- [ ] National admins see all data across all provinces
- [ ] Provincial admins can create users for their provinces only
- [ ] Provincial admins cannot create national admins
- [ ] All new data is correctly tagged with province
- [ ] Existing data is migrated without loss
- [ ] Performance is maintained with province filtering
- [ ] Audit trail captures all province-related actions
- [ ] UI clearly indicates which province(s) user has access to
- [ ] No data leaks between provinces
- [ ] User-province assignments are manageable via UI

## Security Considerations

### Row-Level Security
- All queries MUST filter by user's assigned provinces
- Mutations MUST validate province access before execution
- No query should bypass province filtering

### Validation Checklist
- ✅ User cannot query data from provinces they don't have access to
- ✅ User cannot create data in provinces they don't have access to
- ✅ Provincial admin cannot assign users to provinces outside their scope
- ✅ Provincial admin cannot create national admins
- ✅ Province parameter cannot be tampered with in frontend
- ✅ All province-related actions are audited

### Audit Trail
Every action should log:
- User who performed action
- Province context (which province the data belongs to)
- Action details
- Timestamp

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data assigned to wrong province during migration | High | Manual review, rollback plan, backup before migration |
| Performance degradation with inArray queries | Medium | Proper indexing, query optimization, monitoring |
| Access control bypass vulnerability | High | Thorough testing, security review, code audit |
| User confusion about multi-province assignments | Medium | Clear UI indicators, training, documentation |
| Complex user-province management | Medium | Intuitive UI, validation, helpful error messages |
| Province filter forgotten in new queries | High | Code review checklist, linting rules, testing |

## Testing Strategy

### Unit Tests
- [ ] Province filtering logic
- [ ] User-province assignment validation
- [ ] Permission checking for user creation

### Integration Tests
- [ ] tRPC queries with different user roles
- [ ] User creation by provincial admins
- [ ] Multi-province user data access
- [ ] Cross-province operations

### E2E Tests
- [ ] Provincial user login and data access
- [ ] Provincial admin creating users
- [ ] National admin viewing all data
- [ ] Province filtering in UI
- [ ] User-province management flows

## Future Enhancements

1. **Province Management UI**
   - Add/remove provinces from system (if switching to table approach)
   - Province settings/configuration

2. **Advanced Reporting**
   - Cross-province comparative reports
   - Province performance metrics
   - Data transfer history

3. **User Bulk Operations**
   - Bulk assign users to provinces
   - Bulk province transfer
   - CSV import/export with provinces

4. **Granular Permissions**
   - Permission sets within provinces
   - Feature flags per province
   - Custom roles per province

5. **Database Partitioning**
   - Partition tables by province for performance
   - Province-specific schemas

## References

- Current system: `/CLAUDE.md`
- Database schema: `/lib/db/schema.ts`
- tRPC setup: `/server/trpc.ts`
- Authentication: `/server/auth.ts`
- User management: `/server/routers/users.ts`

---

**Next Steps**:
1. ✅ Confirm key decisions (DONE)
2. Review and approve this plan
3. Answer remaining questions
4. Begin Phase 1 implementation

**Notes**:
- Users can belong to multiple provinces (many-to-many relationship)
- Provincial admins can create users for their assigned provinces
- Different permission levels within provinces (admin vs user)
- This is a living document and will be updated as implementation progresses
