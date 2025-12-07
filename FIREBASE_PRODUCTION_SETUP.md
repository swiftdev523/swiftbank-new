# 🔥 SwiftBank Firebase Production Setup

## 📋 Environment Configuration

### Current Firebase Project

- **Project ID:** `swiftbank-2811b`
- **Auth Domain:** `swiftbank-2811b.firebaseapp.com`
- **Storage Bucket:** `swiftbank-2811b.firebasestorage.app`
- **Hosting URL:** `https://swiftbank-2811b.firebaseapp.com`

## 🔐 Environment Variables

The following environment variables are configured:

### Production (`.env.production`)

```bash
VITE_FIREBASE_API_KEY=AIzaSyBaLBKaK_CLr2j74Vm_hRRc4nrMgkX_9Bs
VITE_FIREBASE_AUTH_DOMAIN=swiftbank-2811b.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=swiftbank-2811b
VITE_FIREBASE_STORAGE_BUCKET=swiftbank-2811b.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=787764194169
VITE_FIREBASE_APP_ID=1:787764194169:web:19ccc445fb743f71ea5da8
VITE_FIREBASE_MEASUREMENT_ID=G-G6XX45XJT7
```

### Development (`.env.development`)

Uses the same Firebase project but with development flags enabled.

## 🚀 Deployment Commands

### Quick Deploy

```bash
npm run firebase:deploy:prod
```

### Manual Steps

1. **Build for production:**

   ```bash
   npm run build:prod
   ```

2. **Deploy Firebase rules:**

   ```bash
   npm run firebase:deploy:rules
   ```

3. **Deploy hosting:**

   ```bash
   npm run firebase:deploy:hosting
   ```

4. **Deploy everything:**
   ```bash
   npm run firebase:deploy
   ```

## 🔒 Security Setup

### Firestore Rules

- Production-ready security rules are configured
- Admin access limited to authenticated admins
- Customer data isolation enforced
- Developer access for system management

### Authentication

- Email/password authentication enabled
- Custom claims for role-based access
- Secure admin and developer accounts

## 📊 Analytics

- Google Analytics enabled in production
- Disabled in development mode
- Measurement ID: `G-G6XX45XJT7`

## 🛠️ Development Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start development server:**

   ```bash
   npm run dev
   ```

3. **Start Firebase emulators (optional):**
   ```bash
   npm run firebase:emulators
   ```

## 🔧 Production Checklist

- [x] Environment variables configured
- [x] Firebase project setup complete
- [x] Security rules implemented
- [x] Analytics enabled for production
- [x] Build optimization configured
- [x] Deployment scripts ready
- [x] Domain configured in Firebase console
- [x] Custom claims setup for roles

## 🌍 Live Application

**URL:** https://swiftbank-2811b.firebaseapp.com

## 📞 Support

For deployment issues or Firebase configuration problems, check:

1. Firebase console permissions
2. Environment variable setup
3. Domain authorization in Firebase
4. Security rules validation
