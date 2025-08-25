package com.example.hello.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.hello.model.TeamMembership;
import com.example.hello.repository.TeamMembershipRepository;
import com.example.hello.repository.TeamRepository;
import com.example.hello.repository.PersonRepository;
import com.example.hello.repository.RoleRepository;
import java.util.List;
import java.util.Optional;

@Service
public class TeamMembershipService {
    
    @Autowired
    private TeamMembershipRepository teamMembershipRepository;
    
    @Autowired
    private TeamRepository teamRepository;
    
    @Autowired
    private PersonRepository personRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    public List<TeamMembership> listAll() {
        return teamMembershipRepository.findAll();
    }
    
    public List<TeamMembership> listByTeam(Long teamId) {
        return teamMembershipRepository.findByTeam_Id(teamId);
    }
    
    public List<TeamMembership> listByPerson(Long personId) {
        return teamMembershipRepository.findByPerson_Id(personId);
    }
    
    public Optional<TeamMembership> findById(Long id) {
        return teamMembershipRepository.findById(id);
    }
    
    public TeamMembership create(TeamMembership teamMembership) {
        return teamMembershipRepository.save(teamMembership);
    }
    
    public TeamMembership update(Long id, TeamMembership teamMembershipDetails) {
        return teamMembershipRepository.findById(id).map(teamMembership -> {
            if (teamMembershipDetails.getTeam() != null) {
                teamRepository.findById(teamMembershipDetails.getTeam().getId())
                    .ifPresent(teamMembership::setTeam);
            }
            if (teamMembershipDetails.getPerson() != null) {
                personRepository.findById(teamMembershipDetails.getPerson().getId())
                    .ifPresent(teamMembership::setPerson);
            }
            if (teamMembershipDetails.getRole() != null) {
                roleRepository.findById(teamMembershipDetails.getRole().getId())
                    .ifPresent(teamMembership::setRole);
            }
            teamMembership.setStartDate(teamMembershipDetails.getStartDate());
            teamMembership.setEndDate(teamMembershipDetails.getEndDate());
            teamMembership.setIsPrimary(teamMembershipDetails.getIsPrimary());
            return teamMembershipRepository.save(teamMembership);
        }).orElseThrow(() -> new IllegalArgumentException("TeamMembership not found with ID: " + id));
    }
    
    public void delete(Long id) {
        teamMembershipRepository.deleteById(id);
    }
}
