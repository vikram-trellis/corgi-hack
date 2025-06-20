# Auto-Insurance Claims Management System Project Specification

## 1. Introduction

This document outlines the project specification for an automated auto-insurance claims management system. The system aims to streamline the claims process, from initial submission to final settlement, ensuring efficiency and accuracy.

## 2. Claims Management Process Overview

The claims management process involves the following key steps:

### 2.1. Claim Initiation

The policyholder initiates a claim through one of the following methods:

- Phone call

- Email

- Web Portal

### 2.2. Information Collection

Upon initiation, the following information is collected:

- Policy number

- Date/time/location of incident

- Type of claim (e.g., auto, property, health)

- Description of the event

- Money requested to resolve the claim (damage estimate)

- Additional documents

### 2.3. Claim Assessment and Validation

Claims are reviewed against the policy's terms and conditions. An example policy structure is as follows:

```json
{
  "policy_id": "AUTO123456",
  "holder_name": "Alex Rivera",
  "effective_date": "2025-01-01",
  "expiry_date": "2025-12-31",
  "policy_state": "CA",
  "vehicle_info": {
    "vin": "IHGCM82633A123456",
    "garaging_address": {
      "street": "123 Maple St",
      "city": "San Mateo",
      "state": "CA",
      "zip": "9401"
    }
  },
  "type": "Comprehensive",
  "coverage_limit": 25000,
  "deductible": 500,
  "covered_events": [
    "theft",
    "vandalism",
    "fire",
    "natural_disaster",
    "falling_object",
    "animal_collision"
  ],
  "exclusions": [
    "driver_under_influence",
    "intentional_damage",
    "commercial_use"
  ]
}
```

## 3. Coverage Summary

The system will handle various coverage types as summarized below:

| Coverage Type        | What It Covers                                  | Mandatory?               |
| -------------------- | ----------------------------------------------- | ------------------------ |
| Liability (BI/PD)    | Injuries/damage to others                       | Yes (in most states)     |
| Collision            | Your car in collisions                          | No                       |
| Comprehensive        | Non-collision events (theft, fire, animals)     | No                       |
| PIP / MedPay         | Medical costs for you/passengers                | Yes (in no-fault states) |
| UM / UIM             | Costs if other driver is uninsured/underinsured | Sometimes                |
| Gap                  | Loan/lease difference on totaled car            | No                       |
| Rental Reimbursement | Cost of temporary rental car                    | No                       |
| Roadside Assistance  | Towing, lockouts, battery, etc.                 | No                       |

## 4. Claims Adjudication

A Claims Adjuster (human or AI) will determine if the claim is:

1. Eligible for coverage

1. Has complete and accurate information

1. Falls within policy limits

### 4.1. Additional Documentation and Investigation

Additional documentation and investigation may be required, including:

- Repair estimates

- Medical reports

- Invoices

- Police reports or third-party statements

- Investigators or field adjusters may inspect the site or interview witnesses.

### 4.2. Settlement Negotiation

- If there is a disagreement between the policyholder and the insurer, they discuss and reassess the payable coverage amount.

- Claims payment is issued after agreement.

### 4.3. Claim Closure

Throughout the process, customers are kept up-to-date via email, SMS, and PhoneCall.

### Identity Schema

```json
{
  "id": "PH123456",
  "first_name": "Alex",
  "last_name": "Rivera",
  "date_of_birth": "1985-07-21",
  "email": "alex.rivera@email.com",
  "phone": "+1-555-123-4567",
  "address": {
    "street": "123 Maple St",
    "city": "San Mateo",
    "state": "CA",
    "zip": "94401"
  },
  "linked_policies": ["AUTO123456", "RENTER789101"],
  "status": "active"
}
```

### Claims Schema (Incoming and unpopulated)

```json
{
  "claim_id": "CLM001",
  "first_name": "Alex",
  "last_name": "Rivera",
  "date_of_birth": "1985-07-21",
  "event_type": "animal_collision",
  "event_date": "2025-06-14",
  "event_location": "Half Moon Bay, CA",
  "vehicle_vin": "1HGCM82633A123456",
  "damage_description": "Front bumper damage from hitting a deer",
  "estimated_damage_amount": 3500,
  "photos": [
    "https://demo.insure/photos/deer_hit_1.jpg",
    "https://demo.insure/photos/deer_hit_2.jpg"
  ],
  "contact_email": "alex.rivera@email.com",
  "ingest_method": "Email" or "Manual",

  // 🆕 Enriched or derived fields
  "id": "PH001",
  "policy_id": "AUTO123",
  "coverage_type": "comprehensive",
  "policy_effective_date": "2025-01-01",
  "policy_expiry_date": "2025-12-31",
  "deductible": 500,
  "coverage_limit": 25000,
  "claim_status": "pending_review",
  "initial_payout_estimate": 3000,
  "eligibility_validated": true,
  "matched_by": "first_name+last_name+DOB+VIN"
}
```
