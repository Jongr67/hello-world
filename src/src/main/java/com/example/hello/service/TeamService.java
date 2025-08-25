package com.example.hello.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.hello.model.Team;
import com.example.hello.repository.TeamRepository;
import com.example.hello.repository.ProductAreaRepository;
import java.util.List;
import java.util.Optional;

@Service
public class TeamService {
    
    @Autowired
    private TeamRepository teamRepository;
    
    @Autowired
    private ProductAreaRepository productAreaRepository;
    
    public List<Team> listAll() {
        return teamRepository.findAll();
    }
    
    public List<Team> listByProductArea(Long productAreaId) {
        return teamRepository.findByProductArea_Id(productAreaId);
    }
    
    public Optional<Team> findById(Long id) {
        return teamRepository.findById(id);
    }
    
    public Team create(Team team) {
        return teamRepository.save(team);
    }
    
    public Team update(Long id, Team teamDetails) {
        return teamRepository.findById(id).map(team -> {
            team.setName(teamDetails.getName());
            team.setDescription(teamDetails.getDescription());
            if (teamDetails.getProductArea() != null) {
                productAreaRepository.findById(teamDetails.getProductArea().getId())
                    .ifPresent(team::setProductArea);
            }
            return teamRepository.save(team);
        }).orElseThrow(() -> new IllegalArgumentException("Team not found with ID: " + id));
    }
    
    public void delete(Long id) {
        teamRepository.deleteById(id);
    }
}
