# Setup Guide - Subscription and Bill Manager

## Quick Start

This guide will help you set up the Subscription and Bill Manager app from scratch.

## Prerequisites

- **Node.js**: 16+ (check: `node --version`)
- **npm**: 7+ (check: `npm --version`)
- **Expo CLI**: Latest version
- **Supabase Account**: Free tier at https://supabase.com

## Step 1: Install Expo CLI

```bash
npm install -g expo-cli
```

## Step 2: Install Project Dependencies

```bash
npm install --legacy-peer-deps
```

The `--legacy-peer-deps` flag is needed due to some React Native peer dependency constraints.

## Step 3: Set Up Supabase Project

### Create a New Supabase Project

1. Go to https://supabase.com
2. Sign up or log in
3. Click "New Project"
4. Fill in project details:
   - **Name**: Choose a name (e.g., "Bill Manager")
   - **Database Password**: Create a strong password
   - **Region**: Select closest to you
5. Click "Create new project"
6. Wait for provisioning (2-3 minutes)

### Get Your Supabase Credentials

1. Once provisioned, go to Project Settings (bottom left)
2. Click "API" in the sidebar
3. Find the following and copy them:
   - **Project URL**: This is your `EXPO_PUBLIC_SUPABASE_URL`
   - **Anon Public Key**: This is your `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### Configure Environment Variables

Create or update `.env` file in project root:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 4: Apply Database Migrations

The app includes a comprehensive migration file that creates all necessary tables.

### Method 1: Using Supabase SQL Editor (Recommended)

1. Go to your Supabase project dashboard
2. Click "SQL Editor" in the left sidebar
3. Click "+ New Query"
4. Open `subscription_bill_manager_migration.sql` in your project root
5. Copy the entire SQL content
6. Paste into the SQL editor
7. Click "Run" button
8. Wait for completion (should see "Migrating" → "Complete")

### Method 2: Using Supabase CLI

If you prefer CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to your Supabase account
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Apply migrations
supabase db push
```

## Step 5: Verify Database Setup

After migration:

1. Go to Supabase Dashboard → "Tables"
2. You should see these tables:
   - `users`
   - `categories`
   - `subscriptions`
   - `bills`
   - `payment_history`
   - `notifications`
   - `app_settings`

3. Each table should have Row Level Security (RLS) enabled
4. Check "Authentication" → "Policies" to verify RLS policies are applied

## Step 6: Run the App

### Development Mode

```bash
npm run dev
```

This starts the Expo development server.

### On iOS Simulator

```bash
# The terminal will show options after npm run dev
# Press 'i' to open iOS Simulator
```

### On Android Emulator

```bash
# First, start Android Emulator from Android Studio
# Then press 'a' in the terminal
```

### On Physical Device

```bash
# Install Expo Go app from App Store or Play Store
# Scan QR code shown in terminal
```

## Step 7: Test Authentication

1. **Sign Up**
   - Tap "Sign Up" on login screen
   - Enter name, email, and password
   - Tap "Sign Up"
   - Should redirect to dashboard

2. **Login**
   - Use the credentials you just created
   - Should see your name on the dashboard

3. **Navigate**
   - Test each tab (Home, Analytics, Add, Bills, Settings)
   - Try adding a subscription
   - Check analytics page

## Step 8: Enable Notifications (Optional)

For push notifications:

1. Go to Supabase project settings
2. Click "Auth" in sidebar
3. Go to "Auth Providers" tab
4. Ensure "Email" is enabled (default)

## TypeScript Configuration

The project uses strict TypeScript:

```bash
# Check for type errors
npm run typecheck

# Lint code
npm run lint
```

## Common Issues & Solutions

### Issue: "Cannot find module '@supabase/supabase-js'"
**Solution**: Run `npm install --legacy-peer-deps`

### Issue: "Expo CLI not found"
**Solution**: Install globally: `npm install -g expo-cli`

### Issue: "Supabase URL not configured"
**Solution**: Verify `.env` file has correct `EXPO_PUBLIC_SUPABASE_URL`

### Issue: "Auth not working"
**Solution**:
1. Check Supabase project is active
2. Verify environment variables
3. Clear app cache and restart

### Issue: "Database migration failed"
**Solution**:
1. Check Supabase SQL syntax
2. Ensure no tables with same name exist
3. Try executing in smaller chunks

### Issue: "Dark mode not working"
**Solution**:
1. Check device system theme settings
2. Toggle theme manually in Settings
3. Restart app

## Project Structure Review

```
project/
├── app/                    # Expo Router screens
├── components/             # Reusable UI components
├── services/              # API & business logic
├── stores/                # Zustand state management
├── contexts/              # React Context providers
├── types/                 # TypeScript types
├── utils/                 # Helper functions
├── constants/             # App configuration
├── .env                   # Environment variables
├── package.json           # Dependencies
└── README.md             # Documentation
```

## Next Steps

### After Setup is Complete

1. **Test All Features**
   - Add subscriptions
   - Create bills
   - Check analytics
   - Toggle theme
   - Logout and login

2. **Customize**
   - Modify colors in `constants/index.ts`
   - Add your company name/logo
   - Update app.json for branding

3. **Deploy** (Optional)
   - Use EAS Build for iOS/Android
   - Export to web
   - Deploy backend (Supabase is cloud-hosted)

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://project.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGc...` |

## Database Tables Overview

### users
Stores user profile information
- `id`: UUID (linked to auth.users)
- `email`: User email
- `name`: Full name
- `currency`: Preferred currency
- `created_at`: Account creation date

### subscriptions
Recurring subscription tracking
- `id`: UUID
- `name`: Subscription name (Netflix, Spotify, etc.)
- `amount`: Monthly/yearly cost
- `next_payment_date`: When payment is due
- `is_active`: Whether subscription is active

### bills
One-time and recurring bills
- `id`: UUID
- `name`: Bill name
- `amount`: Bill amount
- `due_date`: When bill is due
- `is_paid`: Payment status

### categories
For organizing subscriptions and bills
- `id`: UUID
- `name`: Category name (Streaming, Utilities, etc.)
- `color`: Display color
- `icon`: Icon identifier

### payment_history
Tracks all payments made
- `id`: UUID
- `subscription_id` or `bill_id`: Related item
- `amount`: Payment amount
- `payment_date`: When paid
- `status`: Payment status

### notifications
App notification system
- `id`: UUID
- `type`: Notification type
- `title` & `message`: Notification content
- `is_read`: Read status

### app_settings
User preferences
- `currency`: Preferred currency
- `notifications_enabled`: Toggle notifications
- `dark_mode`: Theme preference
- etc.

## Security Notes

1. **Never commit** `.env` file with real credentials
2. **Use strong passwords** for Supabase
3. **Enable RLS** is already configured in migration
4. **Row Level Security** ensures users only see their data
5. **Regular backups** are handled by Supabase automatically

## Performance Tips

1. Use Analytics tab to monitor spending
2. Archive old subscriptions instead of deleting
3. Enable notifications for important bills
4. Regularly update subscription amounts

## Getting Help

- Check `README.md` for detailed documentation
- Review `types/index.ts` for data structures
- Look at `services/` for API patterns
- Check `constants/index.ts` for configuration

## Next Customization Steps

1. **Change App Name**
   - Update `app.json`
   - Change icon and splash screen

2. **Customize Colors**
   - Edit `constants/index.ts` THEME object
   - Update all component colors

3. **Add Company Logo**
   - Replace `assets/images/icon.png`
   - Update `assets/images/favicon.png`

4. **Modify Features**
   - Add new screens in `app/(tabs)/`
   - Create new services in `services/`
   - Add new types in `types/index.ts`

---

**Setup Complete!** 🎉

Your Subscription and Bill Manager is ready to use. Start by logging in and adding your first subscription!
