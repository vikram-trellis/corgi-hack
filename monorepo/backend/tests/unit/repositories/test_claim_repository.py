import datetime
import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from models.claim import Claim, ClaimStatus, EventType
from repositories.claim_repository import ClaimRepository
from sqlmodel import select


@pytest.fixture
def mock_session():
    """Create a mock database session."""
    session = AsyncMock()
    session.execute = AsyncMock()
    session.commit = AsyncMock()
    session.refresh = AsyncMock()
    return session


@pytest.fixture
def claim_repository(mock_session):
    """Create a ClaimRepository with a mock session."""
    return ClaimRepository(session=mock_session)


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


@pytest.mark.asyncio
async def test_create_claim(claim_repository, mock_session):
    """Test creating a claim."""
    claim_data = {
        "first_name": "John",
        "last_name": "Doe",
        "date_of_birth": datetime.date(1990, 1, 1),
        "event_type": EventType.collision,
        "event_date": datetime.date(2023, 5, 15),
        "event_location": "123 Main St, Anytown, USA",
        "damage_description": "Front bumper damage from collision",
        "photos": ["photo1.jpg", "photo2.jpg"],
        "contact_email": "john.doe@example.com",
    }
    
    mock_claim = Claim(**claim_data, id=1, claim_id="CLM12345678")
    mock_session.add.return_value = None
    
    # Mock the refresh to update the object with ID and claim_id
    async def mock_refresh(obj):
        obj.id = 1
        obj.claim_id = "CLM12345678"
    
    mock_session.refresh.side_effect = mock_refresh
    
    result = await claim_repository.create_claim(claim_data)
    
    assert mock_session.add.called
    assert mock_session.commit.called
    assert mock_session.refresh.called
    assert result.claim_id.startswith("CLM")
    assert result.first_name == "John"
    assert result.last_name == "Doe"


@pytest.mark.asyncio
async def test_get_by_claim_id(claim_repository, mock_session, sample_claim):
    """Test retrieving a claim by claim_id."""
    mock_result = MagicMock()
    mock_result.one_or_none.return_value = sample_claim
    mock_session.execute.return_value = mock_result
    
    result = await claim_repository.get_by_claim_id("CLM12345678")
    
    assert mock_session.execute.called
    assert result == sample_claim
    # Verify that a select statement was used with the correct filter
    called_args = mock_session.execute.call_args[0][0]
    assert isinstance(called_args, select)


@pytest.mark.asyncio
async def test_get_by_claim_id_not_found(claim_repository, mock_session):
    """Test retrieving a claim by claim_id when not found."""
    mock_result = MagicMock()
    mock_result.one_or_none.return_value = None
    mock_session.execute.return_value = mock_result
    
    result = await claim_repository.get_by_claim_id("CLM99999999")
    
    assert mock_session.execute.called
    assert result is None


@pytest.mark.asyncio
async def test_update_claim_status(claim_repository, mock_session, sample_claim):
    """Test updating a claim's status."""
    mock_result = MagicMock()
    mock_result.one_or_none.return_value = sample_claim
    mock_session.execute.return_value = mock_result
    
    result = await claim_repository.update_claim_status(
        "CLM12345678", 
        ClaimStatus.submitted,
        {"submitted_by": "user123", "submission_date": "2023-05-16"}
    )
    
    assert mock_session.execute.called
    assert mock_session.commit.called
    assert mock_session.refresh.called
    assert result.claim_status == ClaimStatus.submitted
    assert "submitted_by" in result.metadata
    assert result.metadata["submitted_by"] == "user123"


@pytest.mark.asyncio
async def test_update_claim_status_not_found(claim_repository, mock_session):
    """Test updating a claim's status when the claim is not found."""
    mock_result = MagicMock()
    mock_result.one_or_none.return_value = None
    mock_session.execute.return_value = mock_result
    
    result = await claim_repository.update_claim_status(
        "CLM99999999", 
        ClaimStatus.submitted,
        {"submitted_by": "user123"}
    )
    
    assert mock_session.execute.called
    assert not mock_session.commit.called
    assert not mock_session.refresh.called
    assert result is None


@pytest.mark.asyncio
async def test_associate_with_policyholder(claim_repository, mock_session, sample_claim):
    """Test associating a claim with a policyholder."""
    mock_result = MagicMock()
    mock_result.one_or_none.return_value = sample_claim
    mock_session.execute.return_value = mock_result
    
    result = await claim_repository.associate_with_policyholder(
        "CLM12345678", 
        id=42,
        policy_id="POL987654",
        matched_by="email_match"
    )
    
    assert mock_session.execute.called
    assert mock_session.commit.called
    assert mock_session.refresh.called
    assert result.id == 42
    assert result.policy_id == "POL987654"
    assert result.matched_by == "email_match"


@pytest.mark.asyncio
async def test_search_claims(claim_repository, mock_session):
    """Test searching for claims with various filters."""
    sample_claims = [
        Claim(
            id=1,
            claim_id="CLM12345678",
            first_name="John",
            last_name="Doe",
            date_of_birth=datetime.date(1990, 1, 1),
            event_type=EventType.collision,
            event_date=datetime.date(2023, 5, 15),
            event_location="123 Main St, Anytown, USA",
            damage_description="Front bumper damage from collision",
            photos=["photo1.jpg"],
            contact_email="john.doe@example.com",
            claim_status=ClaimStatus.submitted,
            id=42,
        ),
        Claim(
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
            id=43,
        )
    ]
    
    # Mock the execute method to return our sample claims
    mock_result = MagicMock()
    mock_result.all.return_value = sample_claims
    
    # Mock the scalar method for count
    mock_count_result = MagicMock()
    mock_count_result.scalar.return_value = 2
    
    # Set up the execute method to return different results based on what's being executed
    def mock_execute_side_effect(query):
        if "count" in str(query).lower():
            return mock_count_result
        return mock_result
    
    mock_session.execute.side_effect = mock_execute_side_effect
    
    # Test search with various filters
    result, total = await claim_repository.search_claims(
        id=42,
        status=ClaimStatus.submitted,
        event_type=EventType.collision,
        name_search="John",
        date_from=datetime.date(2023, 1, 1),
        date_to=datetime.date(2023, 12, 31),
        skip=0,
        limit=10
    )
    
    assert mock_session.execute.called
    assert total == 2
    assert len(result) == 2