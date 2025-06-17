# Step-by-Step Implementation Plan for Autoupload Email Feature

## Overview
This document outlines the step-by-step implementation of the autoupload email feature, which allows the system to receive emails with attachments, process them, and associate them with the correct customer/project.

## Database Models

### Step 1: Create AutouploadEmail Model
1. Create a new model called `AutouploadEmail` based on the provided schema:
   - Fields: id, alias, domain, policy_holder_id
   - Unique constraint on alias and policy_holder_id pair
   - Relationships with PolicyHolder model

```python
class AutouploadEmailModel(SQLModel, table=True):
    __tablename__ = "autoupload_email"

    __table_args__ = (
        UniqueConstraint(
            "alias",
            "policy_holder_id",
            name="unique_alias_cust_id_pair",
        ),
    )

    id: str = Field(
        default_factory=generate_id,
        primary_key=True
    )
    alias: str = Field(index=True)
    domain: str
    policy_holder_id: str = Field(foreign_key="policyholders.id")
    
    # Relationship with PolicyHolder
    policy_holder: Optional["PolicyHolder"] = Relationship(back_populates="autoupload_emails")
    
    created_at: datetime = TimestampModel().set_datetime()
    updated_at: datetime = TimestampModel().set_datetime()
```

2. Update the PolicyHolder model to include the relationship:
```python
class PolicyHolder(SQLModel, table=True):
    # Existing fields...
    
    # Add relationship
    autoupload_emails: List["AutouploadEmailModel"] = Relationship(back_populates="policy_holder")
```

## Repository Implementation

### Step 2: Create AutouploadEmailRepository

1. Create the repository with the following methods:
   - `get`: Get by policy_holder_id and optional alias
   - `get_by_email`: Parse email to extract alias and domain, find matching records
   - `upsert`: Update existing or create new record
   - `delete`: Delete by policy_holder_id and alias

2. Implement email parsing logic:
   - Split email into local part and domain
   - Check if local part matches pattern `{alias}-{policy_holder_slug}`
   - Query for matching alias and domain combinations

## Schema Implementation 

### Step 3: Create DTOs/Schemas

1. Create input/output schemas:
   - `AutouploadEmailBase`: Common fields
   - `AutouploadEmailCreate`: For creating new records
   - `AutouploadEmailRead`: For API responses
   - `AutouploadEmailRowData`: For representing row data
   - `Response classes`: For various API responses

## API Routes Implementation

### Step 4: Create API Routes

1. Implement webhook endpoint:
   - Validate authentication token
   - Parse incoming form data into `MailgunWebhook` object
   - Extract email sender and recipient
   - Find matching autoupload email records
   - Process attachments (logging only for now)
   - Return success response

2. Implement CRUD endpoints:
   - GET `/{policy_holder_id}`: List all email configs for a policy holder
   - GET `/{policy_holder_id}/{alias}`: Get specific email config
   - POST `/{policy_holder_id}`: Create/update email config
   - DELETE `/{policy_holder_id}/{alias}`: Delete email config

## Testing

### Step 5: Test Implementation

1. Create unit tests for:
   - Email parsing logic
   - Repository methods
   - API endpoints

2. Create integration tests:
   - Webhook flow with mock form data
   - CRUD operations

## Future Enhancement

### Step 6: Implement Full Webhook Functionality

1. Add async event dispatching:
   - Send events for each attachment
   - Include metadata about sender, recipient, attachment

2. Add error handling and retry logic:
   - Handle failed attachment downloads
   - Implement webhook signature verification

3. Add email notifications:
   - Send confirmation emails
   - Handle invalid email cases