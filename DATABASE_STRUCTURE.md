# Legacy Keeper Database Structure Documentation

## Overview
This document provides a comprehensive overview of the Legacy Keeper database structure, including all tables, relationships, constraints, and policies.

## Database Schema

### Core Tables

#### 1. Users Table
**Purpose**: Stores user profile information
```sql
CREATE TABLE public.users (
    id UUID PRIMARY KEY,                    -- Matches Supabase Auth user ID
    name TEXT NOT NULL,                     -- User's full name
    email TEXT NOT NULL UNIQUE,             -- User's email address
    phone TEXT,                             -- Phone number with country code
    dob DATE,                               -- Date of birth
    gender TEXT,                            -- Gender (male/female/other)
    government_id_url TEXT,                 -- URL to uploaded government ID
    created_at TIMESTAMPTZ DEFAULT NOW(),   -- Record creation timestamp
    updated_at TIMESTAMPTZ DEFAULT NOW()    -- Last update timestamp
);
```

#### 2. Roles Table
**Purpose**: Defines available user roles in the system
```sql
CREATE TABLE public.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,              -- Role name (user, nominee, trustee)
    description TEXT                        -- Role description
);
```

#### 3. User Roles Table
**Purpose**: Junction table for user-role relationships
```sql
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    related_user_id UUID REFERENCES public.users(id), -- For nominee/trustee relationships
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role_id, related_user_id)
);
```

#### 4. Role Section Access Table
**Purpose**: Defines which sections each role can access
```sql
CREATE TABLE public.role_section_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    section TEXT NOT NULL                   -- Section name (dashboard, documents, etc.)
);
```

### Financial Tables

#### 5. Transactions Table
**Purpose**: Records all financial transactions
```sql
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,                     -- Transaction description
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,          -- Transaction amount
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('Paid', 'Received')),
    payment_mode TEXT,                      -- Payment method
    date TIMESTAMPTZ DEFAULT NOW(),         -- Transaction date
    description TEXT,                       -- Additional details
    attachment_url TEXT,                    -- Supporting document URL
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 6. Requests Table
**Purpose**: Manages financial requests between users
```sql
CREATE TABLE public.requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,                    -- Request title
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES public.users(id),
    amount DECIMAL(15,2) NOT NULL,
    comment TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    transaction_type TEXT CHECK (transaction_type IN ('Debt', 'Investment', 'Loan')),
    details TEXT,
    attachment_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 7. Debts and Loans Table
**Purpose**: Tracks debt and loan information
```sql
CREATE TABLE public.debts_loans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    person TEXT NOT NULL,                   -- Creditor/Debtor name
    amount DECIMAL(15,2) NOT NULL,          -- Principal amount
    interest DECIMAL(5,2),                  -- Interest rate
    amount_due DECIMAL(15,2),               -- Outstanding amount
    start_date DATE NOT NULL,               -- Loan start date
    due_date DATE,                          -- Due date
    payment_mode TEXT,                      -- Payment method
    security TEXT,                          -- Collateral information
    purpose TEXT,                           -- Loan purpose
    attachment_url TEXT,                    -- Supporting documents
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('Given', 'Received')),
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'Defaulted')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 8. Deposits and Investments Table
**Purpose**: Manages investment and deposit records
```sql
CREATE TABLE public.deposits_investments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,                     -- Investment name
    amount DECIMAL(15,2) NOT NULL,          -- Investment amount
    investment_type TEXT NOT NULL CHECK (investment_type IN
        ('Bank', 'Gold', 'Silver', 'Shares', 'Bond', 'Property', 'DigitalAsset', 'Other')),
    description TEXT,
    paid_to TEXT,                           -- Institution/Entity
    date DATE NOT NULL,                     -- Investment date
    maturity_date DATE,                     -- Maturity date
    interest_rate DECIMAL(5,2),             -- Interest/Return rate
    expected_returns DECIMAL(15,2),         -- Expected returns
    attachment_url TEXT,
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Matured', 'Withdrawn')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 9. Insurance Table
**Purpose**: Stores insurance policy information
```sql
CREATE TABLE public.insurance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,                     -- Policy name
    amount DECIMAL(15,2) NOT NULL,          -- Coverage amount
    insurance_type TEXT NOT NULL CHECK (insurance_type IN
        ('Life', 'Health', 'Term', 'Auto', 'Property', 'Content', 'Other')),
    description TEXT,
    date DATE NOT NULL,                     -- Policy start date
    coverage_period TEXT,                   -- Coverage duration
    attachment_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 10. Business Plans Table
**Purpose**: Records business ownership and succession plans
```sql
CREATE TABLE public.business_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    business_type TEXT NOT NULL,
    ownership_percentage TEXT,              -- Ownership stake
    investment_amount DECIMAL(15,2) NOT NULL,
    succession_plans TEXT,                  -- Succession planning details
    attachment_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Family and Health Tables

#### 11. Health Records Table
**Purpose**: Stores family health information
```sql
CREATE TABLE public.health_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    member_name TEXT NOT NULL,              -- Family member name
    dob DATE,
    gender TEXT,
    blood_group TEXT,
    contact_number TEXT,
    medical_conditions TEXT,
    allergies TEXT,
    medications TEXT,
    emergency_contact TEXT,
    attachment_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 12. Health Conditions Table
**Purpose**: Detailed health condition records
```sql
CREATE TABLE public.health_conditions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    health_record_id UUID NOT NULL REFERENCES public.health_records(id) ON DELETE CASCADE,
    condition_name TEXT NOT NULL,
    doctor_name TEXT,
    visit_date DATE,
    description TEXT,
    attachment_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 13. Family Members Table
**Purpose**: Family member information
```sql
CREATE TABLE public.family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    member_name TEXT NOT NULL,
    contact_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 14. Family Documents Table
**Purpose**: Documents related to family members
```sql
CREATE TABLE public.family_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_member_id UUID NOT NULL REFERENCES public.family_members(id) ON DELETE CASCADE,
    document_title TEXT NOT NULL,
    document_category TEXT,
    document_date DATE,
    description TEXT,
    attachment_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Personal Management Tables

#### 15. Reminders Table
**Purpose**: User reminders and notifications
```sql
CREATE TABLE public.reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    reminder_name TEXT NOT NULL,
    category TEXT,                          -- Reminder category
    start_date DATE NOT NULL,               -- Reminder start date
    frequency INTEGER,                      -- Frequency in days
    notes TEXT,
    attachment_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 16. Digital Accounts Table
**Purpose**: Digital account management
```sql
CREATE TABLE public.digital_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    account_name TEXT NOT NULL,             -- Account/Service name
    account_id_no TEXT,                     -- Account ID/Username
    password_phone TEXT,                    -- Password or recovery phone
    login_contact TEXT,                     -- Login email/contact
    description TEXT,
    government_id_url TEXT,                 -- Associated documents
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 17. Subscriptions Table
**Purpose**: Subscription management
```sql
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    subscription_name TEXT NOT NULL,
    provider TEXT,                          -- Service provider
    subscription_id TEXT,                   -- Subscription ID
    amount DECIMAL(10,2),                   -- Subscription cost
    billing_cycle TEXT,                     -- Billing frequency
    start_date DATE,
    next_payment_date DATE,
    payment_method TEXT,
    auto_renewal BOOLEAN DEFAULT false,
    notes TEXT,
    attachment_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 18. Documents Table
**Purpose**: General document storage
```sql
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    document_type TEXT NOT NULL,            -- Document category
    attachment_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Communication and Trust Tables

#### 19. Special Messages Table
**Purpose**: Special messages between users
```sql
CREATE TABLE public.special_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    recipient_ids UUID[] DEFAULT '{}',      -- Array of recipient IDs
    message TEXT NOT NULL,
    attachment_url TEXT,
    is_for_all BOOLEAN DEFAULT false,       -- Broadcast message flag
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 20. Trustees Table
**Purpose**: Trustee management
```sql
CREATE TABLE public.trustees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    relationship TEXT,                      -- Relationship to user
    phone TEXT,
    profile_photo_url TEXT,
    government_id_url TEXT,
    approval_type TEXT NOT NULL,            -- Approval mechanism
    status TEXT DEFAULT 'pending',          -- Invitation status (pending, accepted, rejected)
    invitation_token TEXT UNIQUE,           -- Unique invitation token
    invitation_sent_at TIMESTAMPTZ,
    invitation_responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 21. Nominees Table
**Purpose**: Nominee management and invitations
```sql
CREATE TABLE public.nominees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    relationship TEXT,
    phone TEXT,
    access_categories TEXT[] DEFAULT '{}',  -- Accessible sections
    profile_photo_url TEXT,
    government_id_url TEXT,
    status TEXT DEFAULT 'pending',          -- Invitation status
    invitation_token TEXT UNIQUE,           -- Unique invitation token
    invitation_sent_at TIMESTAMPTZ,
    invitation_responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 22. Notifications Table
**Purpose**: System notifications
```sql
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('invitation_sent', 'invitation_received', 'system', 'alert')),
    read BOOLEAN DEFAULT false,
    data JSONB DEFAULT '{}',                -- Additional notification data
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Database Relationships

### Key Relationships
1. **Users ↔ All Tables**: Central user table referenced by all other tables
2. **Users ↔ User Roles ↔ Roles**: Many-to-many relationship for role management
3. **Health Records ↔ Health Conditions**: One-to-many relationship
4. **Family Members ↔ Family Documents**: One-to-many relationship
5. **Nominees**: Self-referential through invitation system
6. **Trustees**: Direct relationship with users

### Foreign Key Constraints
- All tables have `user_id` foreign key referencing `users(id)`
- Cascade delete ensures data integrity when users are removed
- Unique constraints prevent duplicate relationships

## Indexes and Performance

### Primary Indexes
- All tables have UUID primary keys with automatic indexing
- Email fields have unique indexes for fast lookups

### Performance Indexes
```sql
-- User lookup indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON public.user_roles(role_id);

-- Financial data indexes
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_date ON public.transactions(date);
CREATE INDEX idx_requests_user_id ON public.requests(user_id);
CREATE INDEX idx_requests_recipient_id ON public.requests(recipient_id);

-- Invitation system indexes
CREATE INDEX idx_nominees_invitation_token ON public.nominees(invitation_token);
CREATE INDEX idx_nominees_email ON public.nominees(email);
CREATE INDEX idx_trustees_email ON public.trustees(email);

-- Notification indexes
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
```

## Row Level Security (RLS) Policies

### User Data Protection
- Users can only access their own data
- Service role has full access for system operations
- Nominees and trustees have limited access based on permissions

### Key Policies
```sql
-- Users can view own profile
CREATE POLICY "Users can view own profile" ON public.users
FOR SELECT USING (auth.uid() = id);

-- Users can manage own transactions
CREATE POLICY "Users can manage own transactions" ON public.transactions
FOR ALL USING (auth.uid() = user_id);

-- Nominees can view assigned data
CREATE POLICY "Users can view nominees where they are the nominee" ON public.nominees
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND email = nominees.email)
);
```

## Common Issues and Solutions

### 1. Foreign Key Constraint Violations
**Problem**: `Key (user_id)=(uuid) is not present in table "users"`

**Causes**:
- User authenticated in Supabase Auth but profile not created in users table
- Session user ID doesn't match database user ID
- User registration process incomplete

**Solutions**:
```sql
-- Check if user exists in users table
SELECT id, email FROM public.users WHERE id = 'user-uuid-here';

-- Create missing user profile
INSERT INTO public.users (id, name, email, created_at, updated_at)
VALUES ('user-uuid', 'User Name', 'user@email.com', NOW(), NOW());
```

### 2. Registration Process Fix
The application now includes automatic user profile creation during registration to prevent foreign key violations.

### 3. Data Integrity Checks
```sql
-- Find auth users without profiles
SELECT au.id, au.email
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- Find orphaned records
SELECT table_name, count(*)
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name != 'users';
```

## Maintenance and Monitoring

### Regular Maintenance Tasks
1. **Monitor foreign key violations** in application logs
2. **Check for orphaned records** periodically
3. **Verify RLS policies** are working correctly
4. **Update indexes** based on query patterns
5. **Monitor storage usage** for file attachments

### Backup Strategy
- **Daily automated backups** of all tables
- **Point-in-time recovery** capability
- **File storage backups** for attachments
- **Test restore procedures** regularly

## Development Guidelines

### Adding New Tables
1. Always include `user_id` foreign key
2. Add appropriate RLS policies
3. Include `created_at` and `updated_at` timestamps
4. Add necessary indexes
5. Update this documentation

### Data Migration
1. Test migrations on staging environment
2. Backup data before major changes
3. Use transactions for complex migrations
4. Verify foreign key constraints after migration

This database structure supports the complete Legacy Keeper application with proper security, performance, and data integrity measures.