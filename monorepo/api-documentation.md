# Corgi Hack API Documentation

This document provides a comprehensive overview of all backend API endpoints, their parameters, and response models. It serves as a reference for implementing tRPC routers that mirror these REST endpoints.

## Table of Contents

1. [Policyholder Routes](#1-policyholder-routes)
2. [Claims Routes](#2-claims-routes)
3. [AI Routes](#3-ai-routes)
4. [Webhook Routes](#4-webhook-routes)
5. [Autoupload Email Routes](#5-autoupload-email-routes)
6. [Health Routes](#6-health-routes)
7. [Root Endpoint](#7-root-endpoint)

## 1. Policyholder Routes

### GET /api/policyholders

- **Description**: Retrieve all policyholders with pagination
- **Input Parameters**:
  - Query:
    - `skip`: (integer, optional) - Number of records to skip, default: 0
    - `limit`: (integer, optional) - Maximum number of records to return, default: 100
- **Response Model**: `List[PolicyHolderRead]`
  - Array of policyholder objects containing:
    - `id`: (integer) - Database ID
    - `id`: (string) - Unique identifier for the policyholder
    - `first_name`: (string) - First name
    - `last_name`: (string) - Last name
    - `date_of_birth`: (date) - Date of birth
    - `email`: (string) - Email address
    - `phone`: (string) - Phone number
    - `address`: (object) - Address information
    - `status`: (string) - Policyholder status
    - `linked_policies`: (array of strings) - List of linked policy IDs
    - `created_at`: (datetime) - Creation timestamp
    - `updated_at`: (datetime, optional) - Last update timestamp

### GET /api/policyholders/{id}

- **Description**: Get a specific policyholder by ID
- **Input Parameters**:
  - Path:
    - `id`: (string, required) - Unique identifier for the policyholder
- **Response Model**: `PolicyHolderRead`
  - See schema details above

### POST /api/policyholders

- **Description**: Create a new policyholder
- **Input Parameters**:
  - Body: `PolicyHolderCreate`
    - `first_name`: (string, required) - First name
    - `last_name`: (string, required) - Last name
    - `date_of_birth`: (date, required) - Date of birth
    - `email`: (string, required) - Email address
    - `phone`: (string, required) - Phone number
    - `address`: (object, required) - Address information
    - `status`: (string, optional) - Policyholder status, default: "active"
    - `linked_policies`: (array of strings, optional) - List of linked policy IDs, default: []
- **Response Model**: `PolicyHolderRead`
  - See schema details above
- **Status Code**: 201 Created

### PATCH /api/policyholders/{id}

- **Description**: Update a policyholder's information
- **Input Parameters**:
  - Path:
    - `id`: (string, required) - Unique identifier for the policyholder
  - Body: `PolicyHolderUpdate`
    - `first_name`: (string, optional) - First name
    - `last_name`: (string, optional) - Last name
    - `date_of_birth`: (date, optional) - Date of birth
    - `email`: (string, optional) - Email address
    - `phone`: (string, optional) - Phone number
    - `address`: (object, optional) - Address information
    - `linked_policies`: (array of strings, optional) - List of linked policy IDs
    - `status`: (string, optional) - Policyholder status
- **Response Model**: `PolicyHolderRead`
  - See schema details above

### DELETE /api/policyholders/{id}

- **Description**: Delete a policyholder
- **Input Parameters**:
  - Path:
    - `id`: (string, required) - Unique identifier for the policyholder
- **Response**: None
- **Status Code**: 204 No Content

## 2. Claims Routes

### POST /api/claims

- **Description**: Create a new insurance claim
- **Input Parameters**:
  - Body: `ClaimCreate`
    - `first_name`: (string, required) - First name
    - `last_name`: (string, required) - Last name
    - `date_of_birth`: (date, required) - Date of birth
    - `event_type`: (string, required) - Type of claim event
    - `event_date`: (date, required) - Date of the event
    - `event_location`: (string, required) - Location of the event
    - `damage_description`: (string, required) - Description of the damage
    - `contact_email`: (string, required) - Contact email
    - `photos`: (array of strings, optional) - List of photo URLs/IDs
    - `vehicle_vin`: (string, optional) - Vehicle VIN if applicable
    - `estimated_damage_amount`: (number, optional) - Estimated damage amount
    - `ingest_method`: (string, optional) - Method of claim submission, default: "manual"
    - `id`: (string, optional) - Associated policyholder ID
    - `policy_id`: (string, optional) - Associated policy ID
    - `coverage_type`: (string, optional) - Type of coverage
    - `policy_effective_date`: (date, optional) - Policy effective date
    - `policy_expiry_date`: (date, optional) - Policy expiry date
    - `deductible`: (number, optional) - Policy deductible amount
    - `coverage_limit`: (number, optional) - Policy coverage limit
    - `metadata`: (object, optional) - Additional metadata
- **Response Model**: `ClaimDetailResponse`
  - `success`: (boolean) - Operation success status
  - `message`: (string) - Response message
  - `data`: (ClaimRead) - Created claim data
- **Status Code**: 201 Created

### GET /api/claims

- **Description**: List and search claims with various filters
- **Input Parameters**:
  - Query:
    - `id`: (string, optional) - Filter by policyholder ID
    - `policy_id`: (string, optional) - Filter by policy ID
    - `status`: (string, optional) - Filter by claim status
    - `event_type`: (string, optional) - Filter by event type
    - `name_search`: (string, optional) - Search in first or last name
    - `date_from`: (date, optional) - Filter events from this date
    - `date_to`: (date, optional) - Filter events until this date
    - `skip`: (integer, optional) - Number of records to skip, default: 0
    - `limit`: (integer, optional) - Maximum number of records to return, default: 100
- **Response Model**: `ClaimListResponse`
  - `success`: (boolean) - Operation success status
  - `message`: (string) - Response message
  - `data`: (array of ClaimRead) - List of claim objects
  - `count`: (integer) - Number of returned claims
  - `total`: (integer) - Total number of matching claims
  - `page`: (integer) - Current page number
  - `pages`: (integer) - Total number of pages

### GET /api/claims/{claim_id}

- **Description**: Get details for a specific claim
- **Input Parameters**:
  - Path:
    - `claim_id`: (string, required) - Unique identifier for the claim
- **Response Model**: `ClaimDetailResponse`
  - `success`: (boolean) - Operation success status
  - `message`: (string) - Response message
  - `data`: (ClaimRead) - Claim details

### PATCH /api/claims/{claim_id}

- **Description**: Update a claim
- **Input Parameters**:
  - Path:
    - `claim_id`: (string, required) - Unique identifier for the claim
  - Body: `ClaimUpdate`
    - See ClaimCreate schema, all fields are optional
- **Response Model**: `ClaimDetailResponse`
  - `success`: (boolean) - Operation success status
  - `message`: (string) - Response message
  - `data`: (ClaimRead) - Updated claim data

### PATCH /api/claims/{claim_id}/status

- **Description**: Update a claim's status
- **Input Parameters**:
  - Path:
    - `claim_id`: (string, required) - Unique identifier for the claim
  - Body:
    - `status`: (string, required) - New status for the claim
    - `metadata`: (object, optional) - Optional metadata to add
- **Response Model**: `ClaimDetailResponse`
  - `success`: (boolean) - Operation success status
  - `message`: (string) - Response message
  - `data`: (ClaimRead) - Updated claim data

### PATCH /api/claims/{claim_id}/associate

- **Description**: Associate a claim with a policyholder
- **Input Parameters**:
  - Path:
    - `claim_id`: (string, required) - Unique identifier for the claim
  - Body:
    - `id`: (string, required) - Policyholder ID to associate with
    - `policy_id`: (string, optional) - Optional policy ID
    - `matched_by`: (string, optional) - How the match was determined
- **Response Model**: `ClaimDetailResponse`
  - `success`: (boolean) - Operation success status
  - `message`: (string) - Response message
  - `data`: (ClaimRead) - Updated claim data

## 3. AI Routes

### POST /api/ai/analyze

- **Description**: Analyze a document (PDF, image, etc.) using Gemini AI with structured output
- **Input Parameters**:
  - Form:
    - `schema_type`: (enum, required) - The schema to use for analysis
    - `file`: (file, required) - The document file to analyze
    - `temperature`: (number, optional) - Controls randomness (0.0-1.0), default: 0.2
    - `model`: (string, optional) - Gemini model to use, default: "gemini-2.5-pro-preview-03-25"
- **Response Model**: `DocumentAnalysisResponse`
  - `success`: (boolean) - Operation success status
  - `message`: (string) - Response message
  - `result`: (object) - Analysis result
  - `metadata`: (object, optional) - Additional metadata

### POST /api/ai/extract-policyholder

- **Description**: Extract policyholder information from a document using Gemini AI
- **Input Parameters**:
  - Form:
    - `file`: (file, required) - The document file containing policyholder information
- **Response Model**: `DocumentAnalysisResponse`
  - `success`: (boolean) - Operation success status
  - `message`: (string) - Response message
  - `result`: (object) - Extracted policyholder information
  - `metadata`: (object, optional) - Additional metadata

### POST /api/ai/analyze-claim

- **Description**: Analyze an insurance claim document using Gemini AI
- **Input Parameters**:
  - Form:
    - `file`: (file, required) - The claim document to analyze
- **Response Model**: `DocumentAnalysisResponse`
  - `success`: (boolean) - Operation success status
  - `message`: (string) - Response message
  - `result`: (object) - Analysis result
  - `metadata`: (object, optional) - Additional metadata

### POST /api/ai/extract-claim-info

- **Description**: Extract information from a claim document using Gemini AI
- **Input Parameters**:
  - Form:
    - `file`: (file, required) - The claim document to analyze
- **Response Model**: `DocumentAnalysisResponse`
  - `success`: (boolean) - Operation success status
  - `message`: (string) - Response message
  - `result`: (object) - Extracted claim information
  - `metadata`: (object, optional) - Additional metadata

### POST /api/ai/generate-text

- **Description**: Generate text using Gemini AI
- **Input Parameters**:
  - Body: `TextGenerationRequest`
    - `prompt`: (string, required) - The prompt for text generation
    - `model`: (string, optional) - Gemini model to use, default: "gemini-2.5-pro-preview-03-25"
    - `temperature`: (number, optional) - Controls randomness (0.0-1.0), default: 0.7
    - `max_tokens`: (integer, optional) - Maximum tokens in response, default: 8192
- **Response Model**: `TextGenerationResponse`
  - `success`: (boolean) - Operation success status
  - `message`: (string) - Response message
  - `text`: (string) - Generated text
  - `metadata`: (object, optional) - Additional metadata

## 4. Webhook Routes

### POST /api/webhooks/mailgun

- **Description**: Webhook endpoint for receiving email data from Mailgun
- **Input Parameters**:
  - Query:
    - `auth_token`: (string, required) - Authentication token for Mailgun webhooks
  - Body: Mailgun webhook form data (parsed as `MailgunWebhook`)
    - Various email headers and content fields
    - `attachments`: (array, optional) - Email attachments information
- **Response Model**: `WebhookResponse`
  - `success`: (boolean) - Operation success status
  - `message`: (string) - Response message
  - `attachments_processed`: (array of strings, optional) - List of processed attachment names
  - `metadata`: (object, optional) - Additional metadata including email analysis

## 5. Autoupload Email Routes

### GET /api/autoupload-email/{policy_holder_id}

- **Description**: Get all autoupload email configurations for a policy holder
- **Input Parameters**:
  - Path:
    - `policy_holder_id`: (string, required) - Unique identifier for the policy holder
- **Response Model**: `GetAutouploadEmailRowsResponse`
  - `message`: (string) - Response message
  - `data`: (array of AutouploadEmailRowData) - List of email configurations

### GET /api/autoupload-email/{policy_holder_id}/{alias}

- **Description**: Get a specific autoupload email configuration by policy holder ID and alias
- **Input Parameters**:
  - Path:
    - `policy_holder_id`: (string, required) - Unique identifier for the policy holder
    - `alias`: (string, required) - The email alias to retrieve
- **Response Model**: `GetAutouploadEmailRowResponse`
  - `message`: (string) - Response message
  - `data`: (AutouploadEmailRowData, optional) - Email configuration

### POST /api/autoupload-email/{policy_holder_id}

- **Description**: Create or update an autoupload email configuration
- **Input Parameters**:
  - Path:
    - `policy_holder_id`: (string, required) - Unique identifier for the policy holder
  - Body: `AutouploadEmailRowData`
    - `alias`: (string, required) - Email alias
    - `domain`: (string, required) - Email domain
    - `is_user_generated`: (boolean, optional) - Whether the config was user-generated, default: true
- **Response Model**: `UpsertAutouploadEmailResponse`
  - `message`: (string) - Response message
  - `data`: (AutouploadEmailRowData) - Created/updated email configuration

### DELETE /api/autoupload-email/{policy_holder_id}/{alias}

- **Description**: Delete an autoupload email configuration
- **Input Parameters**:
  - Path:
    - `policy_holder_id`: (string, required) - Unique identifier for the policy holder
    - `alias`: (string, required) - The email alias to delete
- **Response Model**: `DeleteAutouploadEmailResponse`
  - `message`: (string) - Response message
  - `data`: (AutouploadEmailRowData, optional) - Deleted email configuration

## 6. Health Routes

### GET /api/health

- **Description**: Simple health check endpoint to verify the API is running
- **Response**: `{"status": "healthy"}`

### GET /api/health/hello

- **Description**: Simple hello endpoint that logs a message
- **Response**: `{"message": "Hello from FastAPI!"}`

## 7. Root Endpoint

### GET /

- **Description**: Root endpoint that provides basic API information
- **Response**:
  ```json
  {
    "message": "Welcome to the Corgi Hack API",
    "docs": "/docs",
    "version": "0.1.0"
  }
  ```
