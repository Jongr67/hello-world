package com.example.hello.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.hello.model.ApplicationTeam;
import com.example.hello.service.ApplicationTeamService;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/application-teams")
@CrossOrigin(origins = "*")
public class ApplicationTeamController {

    @Autowired
    private ApplicationTeamService applicationTeamService;

    @GetMapping
    public List<ApplicationTeam> getAllApplicationTeams() {
        return applicationTeamService.listAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApplicationTeam> getApplicationTeamById(@PathVariable Long id) {
        Optional<ApplicationTeam> applicationTeam = applicationTeamService.findById(id);
        return applicationTeam.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/application/{applicationId}")
    public List<ApplicationTeam> getApplicationTeamsByApplication(@PathVariable Long applicationId) {
        return applicationTeamService.listByApplication(applicationId);
    }

    @GetMapping("/team/{teamId}")
    public List<ApplicationTeam> getApplicationTeamsByTeam(@PathVariable Long teamId) {
        return applicationTeamService.listByTeam(teamId);
    }

    @PostMapping
    public ApplicationTeam createApplicationTeam(@RequestBody ApplicationTeam applicationTeam) {
        return applicationTeamService.create(applicationTeam);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApplicationTeam> updateApplicationTeam(@PathVariable Long id, @RequestBody ApplicationTeam applicationTeamDetails) {
        try {
            ApplicationTeam updatedApplicationTeam = applicationTeamService.update(id, applicationTeamDetails);
            return ResponseEntity.ok(updatedApplicationTeam);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplicationTeam(@PathVariable Long id) {
        try {
            applicationTeamService.delete(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
