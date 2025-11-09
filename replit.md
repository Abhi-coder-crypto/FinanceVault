# SecureDoc - Financial Document Management System

A secure document management system designed for finance companies to store and manage client documents with phone number-based authentication.

## Project Status

**Frontend**: ✅ Fully functional with professional UI
**Backend**: ✅ API routes implemented with MongoDB support
**Authentication**: ✅ Phone number + password login
**File Storage**: ⚠️ Local storage (temporary) - awaiting cloud storage integration

## Current Setup

### Storage Architecture

1. **User Credentials & Document Metadata**: 
   - Currently using in-memory storage (data resets on restart)
   - MongoDB integration ready - just add `MONGODB_URI` environment variable
   
2. **Document Files**:
   - Currently stored in `uploads/` directory (local file system)
   - Dropbox integration prepared - awaiting `DROPBOX_ACCESS_TOKEN`

### Demo Access

**Admin Account** (for testing):
- Phone: `+1111111111`
- Password: `Admin@123`

**Client Account** (for testing):
- Register any phone number with country code (e.g., +1234567890) to create a client account
- Password must be strong: 8+ chars, uppercase, lowercase, number, special character

## Features

### Admin Portal
- Upload documents for clients by phone number
- View all documents across all clients
- Search documents by client phone number
- Download and delete documents
- Real-time statistics dashboard

### Client Portal
- View all personal documents
- Download documents
- Secure access - clients only see their own documents

## How to Add MongoDB (Required for Production)

1. Get your MongoDB connection string from MongoDB Atlas or your MongoDB provider
2. Add it as an environment variable:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
   ```
3. Restart the application
4. The system will automatically switch from in-memory to MongoDB storage

## How to Add Dropbox (Required for Production)

1. Create a Dropbox App at https://www.dropbox.com/developers/apps
2. Generate an access token
3. Add it as an environment variable:
   ```
   DROPBOX_ACCESS_TOKEN=your_token_here
   ```
4. Update the document upload logic to use Dropbox SDK (implementation ready)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login with phone number and password

### Documents
- `POST /api/documents/upload` - Upload document for a client
- `GET /api/documents` - Get all documents (admin) or client's documents
- `GET /api/documents/:id/download` - Download a document
- `DELETE /api/documents/:id` - Delete a document

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

## Next Steps

1. ✅ Frontend design complete
2. ✅ Backend API routes implemented
3. ⏳ **Add MongoDB URI** - For persistent data storage
4. ⏳ **Add Dropbox integration** - For cloud document storage
5. ⏳ Test end-to-end workflow with real database
6. ⏳ Deploy to production

## Development Notes

- All mock data is clearly marked with `// todo: remove mock functionality`
- System gracefully falls back to in-memory storage when MongoDB is not configured
- File uploads work locally and are ready to be switched to Dropbox
- Frontend fully integrated with backend APIs

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
