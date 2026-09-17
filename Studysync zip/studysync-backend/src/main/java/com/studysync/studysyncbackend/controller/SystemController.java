package com.studysync.studysyncbackend.controller;

import com.studysync.studysyncbackend.model.SystemSettings;
import com.studysync.studysyncbackend.service.SystemSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/system")
@RequiredArgsConstructor
public class SystemController {

    private final SystemSettingsService service;

    @GetMapping("/settings")
    public ResponseEntity<SystemSettings> getSettings() {
        return ResponseEntity.ok(service.getSettings());
    }

    @PutMapping("/settings")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<SystemSettings> updateSettings(@RequestBody SystemSettings settings) {
        return ResponseEntity.ok(service.updateSettings(settings));
    }
}
