# SecureDoc - Financial Document Management System

A secure document management system designed for finance companies to store and manage client documents with phone number-based authentication.

## Project Status

**Frontend**: ✅ Fully functional with professional UI
**Backend**: ✅ API routes implemented with MongoDB support
**Authentication**: ✅ Phone number + password login
**File Storage**: ✅ MongoDB GridFS (production-ready persistent storage)

## Current Setup

### Storage Architecture

1. **User Credentials & Document Metadata**: 
   - ✅ MongoDB connected and active
   - Environment variable `MONGODB_URI` is configured
   - Document metadata stored in `documents` collection
   
2. **Document Files**:
   - ✅ **Production Mode (MongoDB)**: Files stored in MongoDB GridFS
     - Automatic chunking for large files
     - Persistent across deployments and republishing
     - Streams files efficiently for downloads
   - ✅ **Development Fallback (MemStorage)**: Files stored in `uploads/` directory
     - Used when MongoDB is unavailable
     - Provides local development experience

### Demo Access

**Admin Account** (for testing):
- Phone: `+1111111111`
- Password: `Admin@123`

**Client Account** (for testing):
- Register any phone number with country code (e.g., +1234567890) to create a client account
- Password must be strong: 8+ chars, uppercase, lowercase, number, special character

## Features

### Admin Portal
- Upload documents for clients by phone number (no pre-registration required)
- View all documents across all clients
- Search documents by client phone number
- Download and delete documents
- Real-time statistics dashboard
- Update admin profile (name, phone number, password) in Settings

### Client Portal
- View all personal documents
- Download documents
- Secure access - clients only see their own documents

## Cloud Storage Integration

Your documents are currently stored locally in the `uploads/` directory. To integrate with your existing cloud storage where your PDFs are located:

### Option 1: Amazon S3 / S3-Compatible Storage
1. Install AWS SDK: Add `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` packages
2. Add environment variables:
   ```
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=your_region
   AWS_S3_BUCKET=your_bucket_name
   ```
3. Update `server/routes.ts` upload handler to use S3 client instead of local file system
4. Migrate existing files from `uploads/` to S3

### Option 2: Dropbox
1. Create Dropbox App at https://www.dropbox.com/developers/apps
2. Generate access token
3. Install Dropbox SDK: Add `dropbox` package
4. Add environment variable:
   ```
   DROPBOX_ACCESS_TOKEN=your_token_here
   ```
5. Update upload logic to use Dropbox SDK

### Option 3: Google Cloud Storage
1. Create GCS bucket in Google Cloud Console
2. Install Google Cloud SDK: Add `@google-cloud/storage` package
3. Set up service account credentials
4. Add environment variables:
   ```
   GCS_BUCKET=your_bucket_name
   GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json
   ```
5. Update upload handler to use GCS client

### Migration Strategy
To migrate your existing PDFs from cloud storage to this system:
1. Export PDF metadata (filename, client phone number) from your existing system
2. Use the admin upload API to register each file
3. Either copy files to new storage or update `dropboxPath` field to reference existing cloud locations
4. Test access and download functionality

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login with phone number and password

### Documents
- `POST /api/documents/upload` - Upload document for a client (no client pre-registration required)
- `GET /api/documents` - Get all documents (admin) or client's documents
- `GET /api/documents/:id/download` - Download a document
- `DELETE /api/documents/:id` - Delete a document

### Admin
- `PATCH /api/admin/profile` - Update admin profile (name, phone number, password)

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Express.js, Node.js
- **Database**: MongoDB (ready for integration)
- **File Storage**: Local (temporary) → Dropbox (planned)
- **Authentication**: bcrypt password hashing

## Security Features

- Password hashing with bcrypt
- Role-based access control (admin vs client)
- Phone number validation
- File type validation (PDF only)
- File size limits (10MB max)
- Secure session management

## Recent Updates

### November 2025
- ✅ Removed client pre-registration requirement for document uploads
- ✅ Added admin settings page (update name, phone number, password)
- ✅ MongoDB integration active and working
- ✅ System now accepts document uploads for any client phone number
- ✅ **GridFS Implementation**: Files now stored in MongoDB GridFS for persistence
  - Automatic chunking for large files
  - Survives deployments and republishing
  - Proper error handling and cleanup
  - Fallback to filesystem in development mode

## Next Steps

1. ✅ Frontend design complete
2. ✅ Backend API routes implemented
3. ✅ MongoDB connected and active
4. ✅ **GridFS file storage** - Production-ready persistent storage implemented
5. 🎯 **Deploy to production** - Ready for deployment

## Development Notes

- MongoDB is connected and storing user accounts, document metadata, and files (via GridFS)
- Files are stored in MongoDB GridFS in production, `uploads/` directory in development mode
- Client existence check removed - any phone number can receive document uploads
- Admin can update their profile through Settings page
- System supports phone number-based authentication with secure password hashing
- Frontend fully integrated with backend APIs
- Proper error handling and cleanup for file uploads in both storage modes

## User Workflow

### For Finance Company (Admin):
1. Login with admin credentials
2. Navigate to "Upload Document"
3. Enter client's phone number
4. Select PDF file
5. Upload - document is now accessible to that client

### For Clients:
1. Login with phone number (provided by finance company)
2. View all personal documents
3. Download documents as needed
4. Secure - cannot see other clients' documents
