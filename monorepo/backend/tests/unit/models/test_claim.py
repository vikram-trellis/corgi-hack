import datetime
import uuid
from unittest.mock import patch

import pytest
from sqlmodel import Session, SQLModel, create_engine

from models.claim import Claim, EventType, ClaimStatus, IngestMethod, generate_claim_id


@pytest.fixture(name="engine")
def engine_fixture():
    """Create an in-memory database for testing."""
    engine = create_engine("sqlite:///:memory:")
    SQLModel.metadata.create_all(engine)
    return engine


@pytest.fixture(name="session")
def session_fixture(engine):
    """Create a new database session for a test."""
    with Session(engine) as session:
        yield session


def test_generate_claim_id():
    """Test claim ID generation format."""
    claim_id = generate_claim_id()
    assert claim_id.startswith("CLM")
    assert len(claim_id) == 11


@patch("models.claim.uuid.uuid4")
def test_generate_claim_id_with_fixed_uuid(mock_uuid):
    """Test claim ID generation with a fixed UUID."""
    mock_uuid.return_value = uuid.UUID("12345678-1234-5678-1234-567812345678")
    claim_id = generate_claim_id()
    assert claim_id == "CLM12345678"


def test_create_claim(session):
    """Test creating a claim with required fields."""
    claim = Claim(
        first_name="John",
        last_name="Doe",
        date_of_birth=datetime.date(1990, 1, 1),
        event_type=EventType.collision,
        event_date=datetime.date(2023, 5, 15),
        event_location="123 Main St, Anytown, USA",
        damage_description="Front bumper damage from collision",
        photos=["photo1.jpg", "photo2.jpg"],
        contact_email="john.doe@example.com",
    )
    
    session.add(claim)
    session.commit()
    session.refresh(claim)
    
    assert claim.id is not None
    assert claim.claim_id.startswith("CLM")
    assert claim.claim_status == ClaimStatus.draft
    assert claim.ingest_method == IngestMethod.manual
    assert claim.created_at is not None
    assert claim.updated_at is not None


def test_claim_with_optional_fields(session):
    """Test creating a claim with optional fields."""
    claim = Claim(
        first_name="Jane",
        last_name="Smith",
        date_of_birth=datetime.date(1985, 5, 10),
        event_type=EventType.theft,
        event_date=datetime.date(2023, 6, 20),
        event_location="456 Elm St, Othertown, USA",
        damage_description="Vehicle stolen from parking lot",
        photos=["photo3.jpg"],
        contact_email="jane.smith@example.com",
        vehicle_vin="1HGCM82633A123456",
        estimated_damage_amount=15000.0,
        policy_id="POL123456",
        coverage_type="Comprehensive",
        policy_effective_date=datetime.date(2023, 1, 1),
        policy_expiry_date=datetime.date(2024, 1, 1),
        deductible=500.0,
        coverage_limit=25000.0,
        initial_payout_estimate=12000.0,
    )
    
    session.add(claim)
    session.commit()
    session.refresh(claim)
    
    assert claim.id is not None
    assert claim.vehicle_vin == "1HGCM82633A123456"
    assert claim.estimated_damage_amount == 15000.0
    assert claim.policy_id == "POL123456"


def test_enum_values():
    """Test that enum values are correctly defined."""
    # Event types
    assert EventType.collision.value == "collision"
    assert EventType.animal_collision.value == "animal_collision"
    assert EventType.theft.value == "theft"
    assert EventType.vandalism.value == "vandalism"
    assert EventType.weather.value == "weather"
    assert EventType.fire.value == "fire"
    assert EventType.flood.value == "flood"
    assert EventType.other.value == "other"
    
    # Claim statuses
    assert ClaimStatus.draft.value == "draft"
    assert ClaimStatus.submitted.value == "submitted"
    assert ClaimStatus.pending_review.value == "pending_review"
    assert ClaimStatus.under_investigation.value == "under_investigation"
    assert ClaimStatus.approved.value == "approved"
    assert ClaimStatus.partially_approved.value == "partially_approved"
    assert ClaimStatus.denied.value == "denied"
    assert ClaimStatus.closed.value == "closed"
    assert ClaimStatus.reopened.value == "reopened"
    
    # Ingest methods
    assert IngestMethod.email.value == "email"
    assert IngestMethod.manual.value == "manual"
    assert IngestMethod.api.value == "api"
    assert IngestMethod.portal.value == "portal"
    assert IngestMethod.mobile.value == "mobile"


def test_update_claim(session):
    """Test updating a claim."""
    # Create a claim
    claim = Claim(
        first_name="Alice",
        last_name="Johnson",
        date_of_birth=datetime.date(1980, 3, 15),
        event_type=EventType.collision,
        event_date=datetime.date(2023, 7, 10),
        event_location="789 Oak St, Somewhere, USA",
        damage_description="Side panel damage from collision",
        photos=["photo4.jpg"],
        contact_email="alice.johnson@example.com",
    )
    
    session.add(claim)
    session.commit()
    session.refresh(claim)
    
    # Update the claim
    original_updated_at = claim.updated_at
    claim.damage_description = "Updated damage description"
    claim.estimated_damage_amount = 8000.0
    claim.claim_status = ClaimStatus.submitted
    
    session.add(claim)
    session.commit()
    session.refresh(claim)
    
    assert claim.damage_description == "Updated damage description"
    assert claim.estimated_damage_amount == 8000.0
    assert claim.claim_status == ClaimStatus.submitted
    assert claim.updated_at > original_updated_at