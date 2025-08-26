package com.example.hello.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.hello.model.ApplicationTeam;
import com.example.hello.repository.ApplicationTeamRepository;
import com.example.hello.repository.ApplicationRepository;
import com.example.hello.repository.TeamRepository;
import java.util.List;
import java.util.Optional;

@Service
public class ApplicationTeamService {
    
    @Autowired
    private ApplicationTeamRepository applicationTeamRepository;
    
    @Autowired
    private ApplicationRepository applicationRepository;
    
    @Autowired
    private TeamRepository teamRepository;
    
    public List<ApplicationTeam> listAll() {
        return applicationTeamRepository.findAll();
    }
    
    public List<ApplicationTeam> listByApplication(Long applicationId) {
        return applicationTeamRepository.findByApplication_Id(applicationId);
    }
    
    public List<ApplicationTeam> listByTeam(Long teamId) {
        return applicationTeamRepository.findByTeam_Id(teamId);
    }
    
    public Optional<ApplicationTeam> findById(Long id) {
        return applicationTeamRepository.findById(id);
    }
    
    public ApplicationTeam create(ApplicationTeam applicationTeam) {
        return applicationTeamRepository.save(applicationTeam);
    }
    
    public ApplicationTeam update(Long id, ApplicationTeam applicationTeamDetails) {
        return applicationTeamRepository.findById(id).map(applicationTeam -> {
            if (applicationTeamDetails.getApplication() != null) {
                applicationRepository.findById(applicationTeamDetails.getApplication().getId())
                    .ifPresent(applicationTeam::setApplication);
            }
            if (applicationTeamDetails.getTeam() != null) {
                teamRepository.findById(applicationTeamDetails.getTeam().getId())
                    .ifPresent(applicationTeam::setTeam);
            }
            applicationTeam.setRelationship(applicationTeamDetails.getRelationship());
            return applicationTeamRepository.save(applicationTeam);
        }).orElseThrow(() -> new IllegalArgumentException("ApplicationTeam not found with ID: " + id));
    }
    
    public void delete(Long id) {
        applicationTeamRepository.deleteById(id);
    }
}
