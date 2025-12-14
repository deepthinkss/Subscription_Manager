# Subscription and Online Bill Manager

A comprehensive React Native + Expo application for managing subscriptions and bills with real-time notifications, analytics, and intuitive user interface.

## Features

### 🎯 Core Features

- **User Authentication**: Email/password sign up and login with Supabase
- **Dashboard**: Overview of monthly expenses, upcoming bills, and active subscriptions
- **Subscription Management**: Add, edit, and track recurring subscriptions
- **Bill Management**: Track one-time and recurring bills with payment status
- **Notifications**: Push notifications for upcoming and overdue bills
- **Analytics**: Visual insights with category breakdowns and spending trends
- **Dark/Light Theme**: System-based theme switching with manual toggle
- **Search & Filter**: Find subscriptions and bills quickly

### 🏗️ Technology Stack

- **Framework**: React Native with Expo SDK
- **Language**: TypeScript
- **State Management**: Zustand + React Context
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **UI Components**: Custom React Native components
- **Notifications**: Expo Notifications
- **Navigation**: Expo Router with Tab Navigation
- **Icons**: Lucide React Native

## Project Structure

```
.
├── app/
│   ├── (auth)/                 # Authentication screens
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   ├── forgot-password.tsx
│   │   └── _layout.tsx
│   ├── (tabs)/                 # Main app screens
│   │   ├── index.tsx          # Home/Dashboard
│   │   ├── analytics.tsx       # Analytics
│   │   ├── add.tsx            # Add subscription
│   │   ├── bills.tsx          # Bills management
│   │   ├── settings.tsx       # Settings
│   │   └── _layout.tsx
│   ├── _layout.tsx            # Root layout
│   └── +not-found.tsx
├── components/
│   └── ui/                     # Reusable UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── TextInput.tsx
│       ├── LoadingSpinner.tsx
│       └── EmptyState.tsx
├── contexts/                   # React Context providers
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── services/                   # Business logic & API calls
│   ├── supabase.ts            # Supabase client
│   ├── auth.ts                # Authentication
│   ├── subscriptions.ts       # Subscription management
│   ├── bills.ts               # Bill management
│   ├── categories.ts          # Categories
│   ├── analytics.ts           # Analytics logic
│   ├── notifications.ts       # Notification handling
│   └── settings.ts            # User settings
├── stores/                     # Zustand stores
│   ├── subscriptionStore.ts
│   └── billStore.ts
├── types/                      # TypeScript types
│   └── index.ts
├── utils/                      # Utility functions
│   ├── formatting.ts          # Currency, date formatting
│   └── validation.ts          # Form validation
├── constants/                  # App constants
│   └── index.ts
└── hooks/                      # Custom hooks
    └── useFrameworkReady.ts
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Xcode) or Android Emulator

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd subscription-bill-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**

   The app uses Supabase for authentication and data storage. Create/update your `.env` file:

   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase Database**

   The app includes a comprehensive database migration. To apply it:

   - Go to your Supabase project SQL editor
   - Copy the contents of `subscription_bill_manager_migration.sql`
   - Execute the migration to create all tables and policies

### Running the App

**Development Mode:**
```bash
npm run dev
```

This will start the Expo development server. You can then:
- Press `i` to open in iOS Simulator
- Press `a` to open in Android Emulator
- Scan QR code with Expo Go app on your phone

**Type Checking:**
```bash
npm run typecheck
```

**Lint:**
```bash
npm run lint
```

## Database Schema

The app uses Supabase with the following tables:

- **users**: User profiles with preferences
- **categories**: Subscription/bill categories
- **subscriptions**: Recurring subscription tracking
- **bills**: One-time and recurring bills
- **payment_history**: Payment records and transaction history
- **notifications**: App notifications system
- **app_settings**: User preferences and settings

All tables have Row Level Security (RLS) enabled ensuring users can only access their own data.

## Authentication Flow

1. Users start at the login screen
2. Can sign up with email and password or login with existing credentials
3. Password reset available via email
4. After successful authentication, users see the dashboard
5. Session persists using Supabase tokens
6. Users can logout from settings

## How to Use

### Add a Subscription
1. Tap the "Add" tab
2. Enter subscription details (name, category, amount, billing cycle, payment date)
3. Tap "Add Subscription"
4. Subscription appears on dashboard

### Manage Bills
1. Go to "Bills" tab
2. View all, unpaid, or paid bills
3. Tap "Mark as Paid" on unpaid bills
4. Filter by status

### View Analytics
1. Tap the "Analytics" tab
2. See total monthly expenses by category
3. View top subscriptions
4. Check spending trends

### Customize Settings
1. Go to "Settings" tab
2. Toggle dark mode
3. Enable/disable notifications
4. View account information
5. Logout or delete account

## Styling & Theme

The app uses:
- Custom color themes for light and dark modes
- Consistent spacing system (8px base unit)
- Reusable component library
- Lucide icons for consistent visuals
- Responsive layouts for all screen sizes

Colors palette:
- **Primary**: Blue (#2563EB)
- **Secondary**: Purple (#7C3AED)
- **Accent**: Pink (#EC4899)
- **Error**: Red (#EF4444)
- **Success**: Green (#10B981)
- **Warning**: Amber (#F59E0B)

## Key Features Implementation

### Real-time Updates
Uses Supabase real-time subscriptions to keep data synchronized across devices.

### Offline Support
AsyncStorage is integrated for basic offline data caching (ready for implementation).

### Form Validation
Zod schemas ensure data integrity before submission.

### Type Safety
Full TypeScript implementation prevents runtime errors.

## Future Enhancements

- [ ] OCR-based bill scanning with camera
- [ ] Payment gateway integration (Razorpay/Stripe)
- [ ] CSV/PDF export functionality
- [ ] Budget tracking and alerts
- [ ] Split bill functionality
- [ ] Biometric authentication
- [ ] Multi-currency conversion
- [ ] Weekly/monthly email reports
- [ ] Widget support for home screen

## Troubleshooting

### Build Issues
```bash
npm install --legacy-peer-deps
```

### Clear Cache
```bash
npm start -- -c
```

### Update Expo
```bash
npm install -g expo-cli@latest
```

### Supabase Connection Issues
- Verify SUPABASE_URL and SUPABASE_ANON_KEY in .env
- Ensure Supabase project is active
- Check network connectivity

## Best Practices

1. **Security**: Never commit .env files with real credentials
2. **Performance**: Use app.json for app metadata and configuration
3. **State**: Zustand stores handle app-wide state
4. **Contexts**: Use for authentication and theme
5. **Services**: Encapsulate API calls and business logic
6. **Components**: Keep components focused and reusable

## Contributing

1. Create a feature branch
2. Make your changes
3. Ensure typecheck passes: `npm run typecheck`
4. Submit a pull request

## License

MIT

## Support

For issues or questions, please create an issue in the repository.

## Deployment

To deploy the app:

### Web Export
```bash
npm run build:web
```

### Native Build
Use EAS Build service from Expo:
```bash
eas build --platform ios
eas build --platform android
```

Configure in `eas.json` for production builds.

---

**Built with ❤️ using React Native, Expo, and Supabase**
