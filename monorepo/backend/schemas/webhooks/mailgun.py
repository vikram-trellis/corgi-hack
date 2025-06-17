from typing import List, Optional, Any, Dict
import json

from pydantic import BaseModel, Field, HttpUrl, validator


class AttachmentInfo(BaseModel):
    """Schema for an email attachment in the Mailgun webhook"""
    name: str
    content_type: str = Field(..., alias="content-type")
    size: int
    url: HttpUrl

    class Config:
        allow_population_by_field_name = True
        extra = "ignore"


class MailgunWebhook(BaseModel):
    """Schema for parsing Mailgun webhook data"""
    content_type: str = Field(..., alias="Content-Type")
    date: str = Field(..., alias="Date")
    dkim_signature: Optional[str] = Field(None, alias="Dkim-Signature")
    from_field: str = Field(..., alias="From")
    message_id: str = Field(..., alias="Message-Id")
    mime_version: Optional[str] = Field(None, alias="Mime-Version")
    received: Optional[str] = Field(None, alias="Received")
    subject: str = Field(None, alias="Subject")
    to: Optional[str] = Field(None, alias="To")

    x_envelope_from: Optional[str] = Field(None, alias="X-Envelope-From")
    x_gm_features: Optional[str] = Field(None, alias="X-Gm-Features")
    x_gm_gg: Optional[str] = Field(None, alias="X-Gm-Gg")
    x_gm_message_state: Optional[str] = Field(None, alias="X-Gm-Message-State")
    x_google_dkim_signature: Optional[str] = Field(
        None, alias="X-Google-Dkim-Signature"
    )
    x_google_smtp_source: Optional[str] = Field(None, alias="X-Google-Smtp-Source")
    x_mailgun_incoming: Optional[str] = Field(None, alias="X-Mailgun-Incoming")
    x_received: Optional[str] = Field(None, alias="X-Received")
    x_gm_features_2: Optional[str] = Field(
        None, alias="X-Gm-Features"
    )  # sometimes repeated
    x_gm_gg_2: Optional[str] = Field(None, alias="X-Gm-Gg")  # sometimes repeated
    x_google_dkim_signature_2: Optional[str] = Field(
        None, alias="X-Google-Dkim-Signature"
    )
    x_google_smtp_source_2: Optional[str] = Field(None, alias="X-Google-Smtp-Source")
    x_mailgun_incoming_2: Optional[str] = Field(None, alias="X-Mailgun-Incoming")
    x_received_2: Optional[str] = Field(None, alias="X-Received")

    attachments: Optional[List[AttachmentInfo]] = Field(
        default=None, alias="attachments"
    )
    body_html: Optional[str] = Field(None, alias="body-html")
    body_plain: Optional[str] = Field(None, alias="body-plain")
    content_id_map: Optional[Dict[str, str]] = Field(None, alias="content-id-map")
    domain: Optional[str] = Field(None, alias="domain")
    message_headers: Optional[List[List[str]]] = Field(None, alias="message-headers")
    recipient: str = Field(None, alias="recipient")
    sender: str = Field(None, alias="sender")
    signature: Optional[str] = Field(None, alias="signature")
    stripped_html: Optional[str] = Field(None, alias="stripped-html")
    stripped_text: Optional[str] = Field(None, alias="stripped-text")
    subject_again: Optional[str] = Field(None, alias="subject")
    timestamp: Optional[int] = Field(None, alias="timestamp")
    token: Optional[str] = Field(None, alias="token")

    class Config:
        allow_population_by_field_name = True
        extra = "allow"

    @validator("attachments", pre=True)
    def _parse_attachments(cls, v: Any) -> Any:
        if v is None:
            return None
        if isinstance(v, str):
            try:
                return json.loads(v)
            except ValueError:
                return v
        return v

    @validator("content_id_map", pre=True)
    def _parse_content_id_map(cls, v: Any) -> Any:
        if v is None:
            return None
        if isinstance(v, str):
            try:
                return json.loads(v)
            except ValueError:
                return v
        return v

    @validator("message_headers", pre=True)
    def _parse_message_headers(cls, v: Any) -> Any:
        if v is None:
            return None
        if isinstance(v, str):
            try:
                return json.loads(v)
            except ValueError:
                return v
        return v