# Claims Management System Tests

This directory contains unit tests for the Claims Management System. The tests cover the following areas:

## Model Tests

- `test_claim.py`: Tests for the `Claim` model, including claim ID generation, field validation, and database operations.

## Repository Tests

- `test_claim_repository.py`: Tests for the `ClaimRepository`, covering CRUD operations, claim status updates, policyholder association, and search functionality.

## Route Tests

- `claims/test_routes.py`: Tests for the claim API endpoints, including creating, reading, updating claims, updating status, and associating with policyholders.
- `ai/test_claim_ai_routes.py`: Tests for the AI endpoints related to claims, including claim analysis and information extraction.

## Service Tests

- `test_gemini_claim_integration.py`: Tests for the Gemini AI service integration with claims, including document analysis and information extraction.

## Running Tests

To run all tests:

```bash
poetry run pytest
```

To run specific test files:

```bash
poetry run pytest tests/unit/models/test_claim.py
poetry run pytest tests/unit/repositories/test_claim_repository.py
poetry run pytest tests/unit/routes/claims/test_routes.py
poetry run pytest tests/unit/routes/ai/test_claim_ai_routes.py
poetry run pytest tests/unit/services/test_gemini_claim_integration.py
```

To run tests with coverage:

```bash
poetry run pytest --cov=.
```