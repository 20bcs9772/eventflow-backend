# EventFlow Backend - Setup Guide

## Step-by-Step Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy the template (if .env.example exists)
cp .env.example .env

# Or create manually
```

Add the following variables to `.env`:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/eventflow?schema=public"

# Firebase Admin SDK
# Option 1: Use service account JSON file
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

# Option 2: Use individual credentials (alternative to JSON file)
# FIREBASE_PROJECT_ID=your-project-id
# FIREBASE_PRIVATE_KEY=your-private-key
# FIREBASE_CLIENT_EMAIL=your-client-email

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

**Important:**
- Replace `user`, `password`, and `eventflow` with your PostgreSQL credentials
- For Firebase, download your service account key from Firebase Console → Project Settings → Service Accounts
- Place the JSON file in the project root and update `FIREBASE_SERVICE_ACCOUNT_PATH`

### 3. Set Up PostgreSQL Database

1. **Create a PostgreSQL database:**
   ```sql
   CREATE DATABASE eventflow;
   ```

2. **Or use a connection string:**
   - Update `DATABASE_URL` in `.env` with your PostgreSQL connection string
   - Format: `postgresql://username:password@host:port/database?schema=public`

### 4. Set Up Prisma

1. **Generate Prisma Client:**
   ```bash
   npm run prisma:generate
   ```

2. **Run database migrations:**
   ```bash
   npm run prisma:migrate
   ```
   This will create all tables in your database.

3. **(Optional) Open Prisma Studio to view data:**
   ```bash
   npm run prisma:studio
   ```

### 5. Set Up Firebase Admin SDK

1. **Go to Firebase Console:**
   - https://console.firebase.google.com/
   - Select your project (or create a new one)

2. **Get Service Account Key:**
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Download the JSON file
   - Save it as `firebase-service-account.json` in the project root

3. **Enable Cloud Messaging:**
   - Go to Project Settings → Cloud Messaging
   - Enable Firebase Cloud Messaging API (if not already enabled)

**Note:** If you prefer using environment variables instead of a JSON file, extract the following from the JSON:
- `project_id` → `FIREBASE_PROJECT_ID`
- `private_key` → `FIREBASE_PRIVATE_KEY`
- `client_email` → `FIREBASE_CLIENT_EMAIL`

### 6. Start the Development Server

```bash
npm run dev
```

The server should start on `http://localhost:3000`

### 7. Verify Setup

1. **Check health endpoint:**
   ```bash
   curl http://localhost:3000/health
   ```

2. **Test database connection:**
   - The server logs should show "✅ Database connected successfully"
   - If Firebase is configured, you should see "Firebase Admin initialized..."

## Troubleshooting

### Database Connection Issues

- **Error: "Can't reach database server"**
  - Check PostgreSQL is running: `pg_isready` or check service status
  - Verify `DATABASE_URL` is correct
  - Check firewall settings

- **Error: "database does not exist"**
  - Create the database: `CREATE DATABASE eventflow;`
  - Or update `DATABASE_URL` to point to an existing database

### Firebase Issues

- **Error: "Firebase configuration not found"**
  - Ensure `FIREBASE_SERVICE_ACCOUNT_PATH` points to a valid JSON file
  - Or provide `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, and `FIREBASE_CLIENT_EMAIL`
  - Check file permissions

- **Push notifications not working**
  - Verify Firebase Cloud Messaging API is enabled
  - Check that FCM tokens are valid
  - Review Firebase Console logs

### Prisma Issues

- **Error: "Prisma Client not generated"**
  - Run: `npm run prisma:generate`

- **Error: "Migration failed"**
  - Check database connection
  - Verify `DATABASE_URL` is correct
  - Check if tables already exist (may need to reset: `prisma migrate reset`)

## Next Steps

1. **Create your first admin user:**
   ```bash
   POST /api/users
   {
     "email": "admin@example.com",
     "name": "Admin User"
   }
   ```

2. **Register a device (for push notifications):**
   ```bash
   POST /api/devices
   {
     "userId": "<admin-user-id>",
     "fcmToken": "your-fcm-token",
     "deviceType": "IOS"
   }
   ```

3. **Create your first event:**
   ```bash
   POST /api/events
   Headers: x-admin-id: <admin-user-id>
   {
     "name": "Test Event",
     "startDate": "2024-12-31T12:00:00.000Z",
     "endDate": "2024-12-31T18:00:00.000Z",
     "visibility": "PUBLIC",
     "type": "OTHER"
   }
   ```
   Note: The event will automatically get a unique `shortCode` (e.g., "ABC123XY")

4. **Join event using short code:**
   ```bash
   POST /api/guests/join
   {
     "shortCode": "ABC123XY",
     "email": "guest@example.com",
     "name": "Guest User"
   }
   ```

5. **Test Socket.IO connection:**
   - Use a Socket.IO client to connect to `http://localhost:3000`
   - Emit `joinEvent` with an event ID
   - Create an announcement to test real-time updates and push notifications

6. **Check notification logs:**
   - All push notifications are automatically logged
   - Query the `NotificationLog` table to see delivery status

See `API_EXAMPLES.md` for detailed API usage examples with all new features.

