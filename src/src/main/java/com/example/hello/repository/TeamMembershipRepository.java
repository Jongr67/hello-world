package com.example.hello.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.hello.model.TeamMembership;
import java.util.List;

public interface TeamMembershipRepository extends JpaRepository<TeamMembership, Long> {
    List<TeamMembership> findByTeam_Id(Long teamId);
    List<TeamMembership> findByPerson_Id(Long personId);
    List<TeamMembership> findByTeam_IdAndRole_Id(Long teamId, Long roleId);
}
