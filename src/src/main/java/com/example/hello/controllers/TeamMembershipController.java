package com.example.hello.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.hello.model.TeamMembership;
import com.example.hello.service.TeamMembershipService;
import java.util.List;

@RestController
@RequestMapping("/api/team-memberships")
@CrossOrigin(origins = "*")
public class TeamMembershipController {
    
    @Autowired
    private TeamMembershipService teamMembershipService;
    
    @GetMapping
    public List<TeamMembership> listAll() {
        return teamMembershipService.listAll();
    }
    
    @GetMapping("/team/{teamId}")
    public List<TeamMembership> listByTeam(@PathVariable Long teamId) {
        return teamMembershipService.listByTeam(teamId);
    }
    
    @GetMapping("/person/{personId}")
    public List<TeamMembership> listByPerson(@PathVariable Long personId) {
        return teamMembershipService.listByPerson(personId);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<TeamMembership> getById(@PathVariable Long id) {
        return teamMembershipService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public TeamMembership create(@RequestBody TeamMembership teamMembership) {
        return teamMembershipService.create(teamMembership);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<TeamMembership> update(@PathVariable Long id, @RequestBody TeamMembership teamMembership) {
        try {
            TeamMembership updated = teamMembershipService.update(id, teamMembership);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            teamMembershipService.delete(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
