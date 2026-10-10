package com.studysync.studysyncbackend.model.enums;

public enum StorageState {
    ACTIVE_PDF,           // Raw PDF stored on server/cloud storage
    PURGED_RECEIPT_ONLY,  // Raw PDF purged after 30 days; cryptographic receipt locked in DB
    REVOKED               // Verification revoked by Admin or requested deleted by user
}
