import json
import pytest
from unittest.mock import AsyncMock, MagicMock, patch, mock_open

from services.gemini import GeminiService, SchemaType


@pytest.fixture
def gemini_service():
    """Create a GeminiService with mocked Gemini model."""
    with patch("services.gemini.genai") as mock_genai:
        # Mock the GenerativeModel
        mock_model = MagicMock()
        mock_genai.GenerativeModel.return_value = mock_model
        
        # Create the service
        service = GeminiService()
        
        # Replace the schema loading with mock schemas
        service._load_schema = MagicMock()
        
        yield service


@pytest.fixture
def claim_analysis_schema():
    """Sample claim analysis schema."""
    return {
        "type": "object",
        "properties": {
            "claimInfo": {
                "type": "object",
                "properties": {
                    "claimType": {"type": "string"},
                    "damageDescription": {"type": "string"},
                    "estimatedDamage": {"type": "number"},
                    "eventDate": {"type": "string", "format": "date"},
                    "eventLocation": {"type": "string"}
                }
            },
            "policyholderInfo": {
                "type": "object",
                "properties": {
                    "firstName": {"type": "string"},
                    "lastName": {"type": "string"},
                    "dateOfBirth": {"type": "string", "format": "date"},
                    "contactEmail": {"type": "string", "format": "email"}
                }
            },
            "riskAssessment": {
                "type": "object",
                "properties": {
                    "fraudRisk": {"type": "string", "enum": ["low", "medium", "high"]},
                    "complexityLevel": {"type": "string", "enum": ["simple", "moderate", "complex"]},
                    "estimatedProcessingTime": {"type": "string"}
                }
            }
        }
    }


@pytest.fixture
def claim_extract_schema():
    """Sample claim extraction schema."""
    return {
        "type": "object",
        "properties": {
            "eventDetails": {
                "type": "object",
                "properties": {
                    "eventType": {"type": "string", "enum": ["collision", "theft", "weather", "fire", "other"]},
                    "eventDate": {"type": "string", "format": "date"},
                    "eventLocation": {"type": "string"},
                    "damageDescription": {"type": "string"}
                }
            },
            "claimantInfo": {
                "type": "object",
                "properties": {
                    "firstName": {"type": "string"},
                    "lastName": {"type": "string"},
                    "dateOfBirth": {"type": "string", "format": "date"},
                    "contactEmail": {"type": "string", "format": "email"}
                }
            },
            "vehicleInfo": {
                "type": "object",
                "properties": {
                    "make": {"type": "string"},
                    "model": {"type": "string"},
                    "year": {"type": "integer"},
                    "vin": {"type": "string"}
                }
            },
            "policyInfo": {
                "type": "object",
                "properties": {
                    "policyNumber": {"type": "string"},
                    "coverageType": {"type": "string"},
                    "deductible": {"type": "number"}
                }
            }
        }
    }


@pytest.mark.asyncio
async def test_analyze_claim(gemini_service, claim_analysis_schema):
    """Test analyzing a claim document."""
    # Mock the schema loading
    gemini_service._load_schema.return_value = claim_analysis_schema
    
    # Mock the Gemini model response
    mock_response = MagicMock()
    mock_response.text = json.dumps({
        "claimInfo": {
            "claimType": "collision",
            "damageDescription": "Front bumper damage from collision with another vehicle",
            "estimatedDamage": 1500,
            "eventDate": "2023-05-15",
            "eventLocation": "Intersection of Main St and Elm St, Anytown, USA"
        },
        "policyholderInfo": {
            "firstName": "John",
            "lastName": "Doe",
            "dateOfBirth": "1990-01-01",
            "contactEmail": "john.doe@example.com"
        },
        "riskAssessment": {
            "fraudRisk": "low",
            "complexityLevel": "simple",
            "estimatedProcessingTime": "3-5 business days"
        }
    })
    
    gemini_service._model.generate_content.return_value = mock_response
    
    # Call the analyze_claim method
    document_text = "Claim Form\nName: John Doe\nDOB: 01/01/1990\nEmail: john.doe@example.com\nEvent: Vehicle collision on 05/15/2023\nLocation: Intersection of Main St and Elm St, Anytown, USA\nDamage: Front bumper damage from collision with another vehicle\nEstimated cost: $1,500"
    
    result = await gemini_service.analyze_claim(document_text)
    
    # Check that the result matches the expected structure
    assert result["claimInfo"]["claimType"] == "collision"
    assert result["policyholderInfo"]["firstName"] == "John"
    assert result["policyholderInfo"]["lastName"] == "Doe"
    assert result["riskAssessment"]["fraudRisk"] == "low"
    
    # Check that the model was called with the right parameters
    gemini_service._load_schema.assert_called_once_with(SchemaType.POLICYHOLDER_CLAIM)
    gemini_service._model.generate_content.assert_called_once()


@pytest.mark.asyncio
async def test_extract_claim_info(gemini_service, claim_extract_schema):
    """Test extracting information from a claim document."""
    # Mock the schema loading
    gemini_service._load_schema.return_value = claim_extract_schema
    
    # Mock the Gemini model response
    mock_response = MagicMock()
    mock_response.text = json.dumps({
        "eventDetails": {
            "eventType": "collision",
            "eventDate": "2023-05-15",
            "eventLocation": "Intersection of Main St and Elm St, Anytown, USA",
            "damageDescription": "Front bumper damage from collision with another vehicle"
        },
        "claimantInfo": {
            "firstName": "John",
            "lastName": "Doe",
            "dateOfBirth": "1990-01-01",
            "contactEmail": "john.doe@example.com"
        },
        "vehicleInfo": {
            "make": "Toyota",
            "model": "Camry",
            "year": 2018,
            "vin": "1HGCM82633A123456"
        },
        "policyInfo": {
            "policyNumber": "POL123456",
            "coverageType": "Comprehensive",
            "deductible": 500
        }
    })
    
    gemini_service._model.generate_content.return_value = mock_response
    
    # Call the extract_claim_info method
    document_text = "Claim Form\nName: John Doe\nDOB: 01/01/1990\nEmail: john.doe@example.com\nEvent: Vehicle collision on 05/15/2023\nLocation: Intersection of Main St and Elm St, Anytown, USA\nDamage: Front bumper damage from collision with another vehicle\nVehicle: 2018 Toyota Camry\nVIN: 1HGCM82633A123456\nPolicy Number: POL123456\nCoverage: Comprehensive\nDeductible: $500"
    
    result = await gemini_service.extract_claim_info(document_text)
    
    # Check that the result matches the expected structure
    assert result["eventDetails"]["eventType"] == "collision"
    assert result["claimantInfo"]["firstName"] == "John"
    assert result["vehicleInfo"]["make"] == "Toyota"
    assert result["policyInfo"]["policyNumber"] == "POL123456"
    
    # Check that the model was called with the right parameters
    gemini_service._load_schema.assert_called_once_with(SchemaType.CLAIM_EXTRACT)
    gemini_service._model.generate_content.assert_called_once()


@pytest.mark.asyncio
async def test_process_document_with_claim_schema(gemini_service, claim_extract_schema):
    """Test processing a document with the claim extraction schema."""
    # Mock the schema loading
    with patch("builtins.open", mock_open(read_data=json.dumps(claim_extract_schema))):
        # Mock the Gemini model response
        mock_response = MagicMock()
        mock_response.text = json.dumps({
            "eventDetails": {
                "eventType": "collision",
                "eventDate": "2023-05-15",
                "eventLocation": "Intersection of Main St and Elm St, Anytown, USA",
                "damageDescription": "Front bumper damage from collision with another vehicle"
            },
            "claimantInfo": {
                "firstName": "John",
                "lastName": "Doe",
                "dateOfBirth": "1990-01-01",
                "contactEmail": "john.doe@example.com"
            }
        })
        
        gemini_service._model.generate_content.return_value = mock_response
        
        # Call the process_document method directly
        document_text = "Claim document text"
        schema_type = SchemaType.CLAIM_EXTRACT
        
        # Use the real _load_schema method for this test
        gemini_service._load_schema = AsyncMock(return_value=claim_extract_schema)
        
        result = await gemini_service.process_document(document_text, schema_type)
        
        # Check that the result matches the expected structure
        assert result["eventDetails"]["eventType"] == "collision"
        assert result["claimantInfo"]["firstName"] == "John"
        
        # Check that the model was called with the right parameters
        gemini_service._load_schema.assert_called_once_with(schema_type)
        gemini_service._model.generate_content.assert_called_once()