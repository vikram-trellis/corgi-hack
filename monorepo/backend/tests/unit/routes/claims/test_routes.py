import datetime
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession

from models.claim import Claim, ClaimStatus, EventType
from routes.claims.routes import router as claims_router
from repositories.claim_repository import ClaimRepository
from repositories.policyholder_repository import PolicyHolderRepository


@pytest.fixture
def app():
    """Create a FastAPI app with claims router for testing."""
    app = FastAPI()
    app.include_router(claims_router, prefix="/api/claims")
    return app


@pytest.fixture
def client(app):
    """Create a test client for the FastAPI app."""
    return TestClient(app)


@pytest.fixture
def mock_claim_repository():
    """Create a mock claim repository."""
    return AsyncMock(spec=ClaimRepository)


@pytest.fixture
def mock_policyholder_repository():
    """Create a mock policyholder repository."""
    return AsyncMock(spec=PolicyHolderRepository)


@pytest.fixture
def mock_db_session():
    """Create a mock database session."""
    return AsyncMock(spec=AsyncSession)


# Mock the dependencies
@pytest.fixture(autouse=True)
def override_dependencies(app, mock_claim_repository, mock_policyholder_repository, mock_db_session):
    """Override the dependencies for testing."""
    
    def get_claim_repository():
        return mock_claim_repository
    
    def get_policyholder_repository():
        return mock_policyholder_repository
    
    def get_db_session():
        return mock_db_session
    
    app.dependency_overrides = {
        ClaimRepository: get_claim_repository,
        PolicyHolderRepository: get_policyholder_repository,
        AsyncSession: get_db_session,
    }
    
    yield
    
    app.dependency_overrides = {}


@pytest.fixture
def sample_claim():
    """Create a sample claim for testing."""
    return Claim(
        id=1,
        claim_id="CLM12345678",
        first_name="John",
        last_name="Doe",
        date_of_birth=datetime.date(1990, 1, 1),
        event_type=EventType.collision,
        event_date=datetime.date(2023, 5, 15),
        event_location="123 Main St, Anytown, USA",
        damage_description="Front bumper damage from collision",
        photos=["photo1.jpg", "photo2.jpg"],
        contact_email="john.doe@example.com",
        claim_status=ClaimStatus.draft,
    )


def test_create_claim(client, mock_claim_repository, sample_claim):
    """Test creating a claim."""
    # Mock the create_claim method
    mock_claim_repository.create_claim.return_value = sample_claim
    
    # Create a claim
    claim_data = {
        "first_name": "John",
        "last_name": "Doe",
        "date_of_birth": "1990-01-01",
        "event_type": "collision",
        "event_date": "2023-05-15",
        "event_location": "123 Main St, Anytown, USA",
        "damage_description": "Front bumper damage from collision",
        "photos": ["photo1.jpg", "photo2.jpg"],
        "contact_email": "john.doe@example.com",
    }
    
    response = client.post("/api/claims/", json=claim_data)
    
    # Check the response
    assert response.status_code == 201
    assert response.json()["success"] is True
    assert "claim_id" in response.json()["data"]
    assert response.json()["data"]["claim_id"] == "CLM12345678"
    
    # Check that the repository method was called
    mock_claim_repository.create_claim.assert_called_once()


def test_get_claim(client, mock_claim_repository, sample_claim):
    """Test getting a claim by claim_id."""
    # Mock the get_by_claim_id method
    mock_claim_repository.get_by_claim_id.return_value = sample_claim
    
    # Get the claim
    response = client.get("/api/claims/CLM12345678")
    
    # Check the response
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["data"]["claim_id"] == "CLM12345678"
    assert response.json()["data"]["first_name"] == "John"
    assert response.json()["data"]["last_name"] == "Doe"
    
    # Check that the repository method was called
    mock_claim_repository.get_by_claim_id.assert_called_once_with("CLM12345678")


def test_get_claim_not_found(client, mock_claim_repository):
    """Test getting a claim that doesn't exist."""
    # Mock the get_by_claim_id method to return None
    mock_claim_repository.get_by_claim_id.return_value = None
    
    # Get the claim
    response = client.get("/api/claims/CLM99999999")
    
    # Check the response
    assert response.status_code == 404
    assert response.json()["success"] is False
    assert "not found" in response.json()["message"].lower()
    
    # Check that the repository method was called
    mock_claim_repository.get_by_claim_id.assert_called_once_with("CLM99999999")


def test_list_claims(client, mock_claim_repository, sample_claim):
    """Test listing claims with filters."""
    # Create a second sample claim
    sample_claim2 = Claim(
        id=2,
        claim_id="CLM87654321",
        first_name="Jane",
        last_name="Smith",
        date_of_birth=datetime.date(1985, 5, 10),
        event_type=EventType.theft,
        event_date=datetime.date(2023, 6, 20),
        event_location="456 Elm St, Othertown, USA",
        damage_description="Vehicle stolen from parking lot",
        photos=["photo3.jpg"],
        contact_email="jane.smith@example.com",
        claim_status=ClaimStatus.pending_review,
    )
    
    # Mock the search_claims method
    mock_claim_repository.search_claims.return_value = ([sample_claim, sample_claim2], 2)
    
    # List claims
    response = client.get("/api/claims/?status=draft&event_type=collision&skip=0&limit=10")
    
    # Check the response
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert len(response.json()["data"]["claims"]) == 2
    assert response.json()["data"]["total"] == 2
    
    # Check that the repository method was called with the right parameters
    mock_claim_repository.search_claims.assert_called_once()
    call_kwargs = mock_claim_repository.search_claims.call_args.kwargs
    assert call_kwargs["status"] == "draft"
    assert call_kwargs["event_type"] == "collision"
    assert call_kwargs["skip"] == 0
    assert call_kwargs["limit"] == 10


def test_update_claim(client, mock_claim_repository, sample_claim):
    """Test updating a claim."""
    # Mock the get_by_claim_id and update methods
    mock_claim_repository.get_by_claim_id.return_value = sample_claim
    
    # Create an updated claim
    updated_claim = sample_claim
    updated_claim.damage_description = "Updated damage description"
    mock_claim_repository.update.return_value = updated_claim
    
    # Update the claim
    update_data = {
        "damage_description": "Updated damage description"
    }
    
    response = client.patch("/api/claims/CLM12345678", json=update_data)
    
    # Check the response
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["data"]["damage_description"] == "Updated damage description"
    
    # Check that the repository methods were called
    mock_claim_repository.get_by_claim_id.assert_called_once_with("CLM12345678")
    mock_claim_repository.update.assert_called_once()


def test_update_claim_status(client, mock_claim_repository, sample_claim):
    """Test updating a claim's status."""
    # Mock the update_claim_status method
    updated_claim = sample_claim
    updated_claim.claim_status = ClaimStatus.submitted
    updated_claim.metadata = {"submitted_by": "user123", "submission_date": "2023-05-16"}
    mock_claim_repository.update_claim_status.return_value = updated_claim
    
    # Update the claim status
    status_data = {
        "status": "submitted",
        "metadata": {
            "submitted_by": "user123",
            "submission_date": "2023-05-16"
        }
    }
    
    response = client.patch("/api/claims/CLM12345678/status", json=status_data)
    
    # Check the response
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["data"]["claim_status"] == "submitted"
    
    # Check that the repository method was called
    mock_claim_repository.update_claim_status.assert_called_once_with(
        "CLM12345678", 
        ClaimStatus.submitted, 
        {"submitted_by": "user123", "submission_date": "2023-05-16"}
    )


def test_associate_with_policyholder(client, mock_claim_repository, mock_policyholder_repository, sample_claim):
    """Test associating a claim with a policyholder."""
    # Mock the get_by_id method for PolicyHolderRepository
    mock_policyholder_repository.get_by_id.return_value = MagicMock(id=42)
    
    # Mock the associate_with_policyholder method
    associated_claim = sample_claim
    associated_claim.id = 42
    associated_claim.policy_id = "POL987654"
    associated_claim.matched_by = "email_match"
    mock_claim_repository.associate_with_policyholder.return_value = associated_claim
    
    # Associate the claim with a policyholder
    associate_data = {
        "id": 42,
        "policy_id": "POL987654",
        "matched_by": "email_match"
    }
    
    response = client.patch("/api/claims/CLM12345678/associate", json=associate_data)
    
    # Check the response
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["data"]["id"] == 42
    
    # Check that the repository methods were called
    mock_policyholder_repository.get_by_id.assert_called_once_with(42)
    mock_claim_repository.associate_with_policyholder.assert_called_once_with(
        "CLM12345678", 42, "POL987654", "email_match"
    )


def test_associate_with_nonexistent_policyholder(client, mock_claim_repository, mock_policyholder_repository):
    """Test associating a claim with a policyholder that doesn't exist."""
    # Mock the get_by_id method to return None
    mock_policyholder_repository.get_by_id.return_value = None
    
    # Associate the claim with a policyholder
    associate_data = {
        "id": 99,
        "policy_id": "POL987654",
        "matched_by": "email_match"
    }
    
    response = client.patch("/api/claims/CLM12345678/associate", json=associate_data)
    
    # Check the response
    assert response.status_code == 404
    assert response.json()["success"] is False
    assert "policyholder not found" in response.json()["message"].lower()
    
    # Check that the repository method was called
    mock_policyholder_repository.get_by_id.assert_called_once_with(99)
    mock_claim_repository.associate_with_policyholder.assert_not_called()