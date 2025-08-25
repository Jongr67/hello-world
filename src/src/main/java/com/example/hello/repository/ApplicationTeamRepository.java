package com.example.hello.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.hello.model.ApplicationTeam;
import java.util.List;

public interface ApplicationTeamRepository extends JpaRepository<ApplicationTeam, Long> {
    List<ApplicationTeam> findByApplication_Id(Long applicationId);
    List<ApplicationTeam> findByTeam_Id(Long teamId);
}
