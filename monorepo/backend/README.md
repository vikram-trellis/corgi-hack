# Corgi Hack Backend

This is the backend service for the Corgi Hack insurance claims processing application. It's built with FastAPI and SQLModel.

## Environment Variables

The following environment variables are required for the application to function properly:

### Database Configuration
```
DATABASE_URL=postgresql+asyncpg://username:password@localhost:5432/database_name
```

### Mailgun Webhook Configuration
```
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_WEBHOOK_SIGNING_KEY=your_mailgun_webhook_signing_key
```

### Supabase Configuration (for document storage)
```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your_supabase_service_role_key
SUPABASE_BUCKET=documents  # Default bucket name for storing documents
```

### Google Gemini API (for AI document analysis)
```
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-file.json
```

## Document Processing

The application now supports document processing via webhooks:

1. When a document is received via the Mailgun webhook, an inbox item is created with dummy data
2. The document is uploaded to Supabase storage
3. A document record is created in the database, linking the file URL to the inbox item

## API Endpoints

### Webhooks
- `POST /webhooks/mailgun`: Receives email data from Mailgun, processes attachments, and creates inbox items and documents

### Documents
- Document endpoints will be added in future updates
