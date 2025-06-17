import json
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import FastAPI
from fastapi.testclient import TestClient

from routes.ai.routes import router as ai_router
from services.gemini import GeminiService


@pytest.fixture
def app():
    """Create a FastAPI app with AI router for testing."""
    app = FastAPI()
    app.include_router(ai_router, prefix="/api/ai")
    return app


@pytest.fixture
def client(app):
    """Create a test client for the FastAPI app."""
    return TestClient(app)


@pytest.fixture
def mock_gemini_service():
    """Create a mock GeminiService."""
    return AsyncMock(spec=GeminiService)


# Mock the dependencies
@pytest.fixture(autouse=True)
def override_dependencies(app, mock_gemini_service):
    """Override the dependencies for testing."""
    
    def get_gemini_service():
        return mock_gemini_service
    
    app.dependency_overrides = {
        GeminiService: get_gemini_service,
    }
    
    yield
    
    app.dependency_overrides = {}


def test_analyze_claim(client, mock_gemini_service):
    """Test analyzing a claim document."""
    # Mock the analyze_claim method
    mock_gemini_service.analyze_claim.return_value = {
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
    }
    
    # Create the request data
    request_data = {
        "document_text": "Claim Form\nName: John Doe\nDOB: 01/01/1990\nEmail: john.doe@example.com\nEvent: Vehicle collision on 05/15/2023\nLocation: Intersection of Main St and Elm St, Anytown, USA\nDamage: Front bumper damage from collision with another vehicle\nEstimated cost: $1,500"
    }
    
    # Make the request
    response = client.post("/api/ai/analyze-claim", json=request_data)
    
    # Check the response
    assert response.status_code == 200
    assert response.json()["success"] is True
    
    result = response.json()["data"]
    assert result["claimInfo"]["claimType"] == "collision"
    assert result["policyholderInfo"]["firstName"] == "John"
    assert result["policyholderInfo"]["lastName"] == "Doe"
    assert result["riskAssessment"]["fraudRisk"] == "low"
    
    # Check that the service method was called
    mock_gemini_service.analyze_claim.assert_called_once_with(request_data["document_text"])


def test_extract_claim_info(client, mock_gemini_service):
    """Test extracting information from a claim document."""
    # Mock the extract_claim_info method
    mock_gemini_service.extract_claim_info.return_value = {
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
    }
    
    # Create the request data
    request_data = {
        "document_text": "Claim Form\nName: John Doe\nDOB: 01/01/1990\nEmail: john.doe@example.com\nEvent: Vehicle collision on 05/15/2023\nLocation: Intersection of Main St and Elm St, Anytown, USA\nDamage: Front bumper damage from collision with another vehicle\nVehicle: 2018 Toyota Camry\nVIN: 1HGCM82633A123456\nPolicy Number: POL123456\nCoverage: Comprehensive\nDeductible: $500"
    }
    
    # Make the request
    response = client.post("/api/ai/extract-claim-info", json=request_data)
    
    # Check the response
    assert response.status_code == 200
    assert response.json()["success"] is True
    
    result = response.json()["data"]
    assert result["eventDetails"]["eventType"] == "collision"
    assert result["claimantInfo"]["firstName"] == "John"
    assert result["vehicleInfo"]["make"] == "Toyota"
    assert result["policyInfo"]["policyNumber"] == "POL123456"
    
    # Check that the service method was called
    mock_gemini_service.extract_claim_info.assert_called_once_with(request_data["document_text"])


def test_analyze_claim_error(client, mock_gemini_service):
    """Test error handling when analyzing a claim document."""
    # Mock the analyze_claim method to raise an exception
    mock_gemini_service.analyze_claim.side_effect = Exception("AI processing error")
    
    # Create the request data
    request_data = {
        "document_text": "Invalid document text"
    }
    
    # Make the request
    response = client.post("/api/ai/analyze-claim", json=request_data)
    
    # Check the response
    assert response.status_code == 500
    assert response.json()["success"] is False
    assert "error" in response.json()["message"].lower()