package com.example.hello.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.hello.model.Team;
import java.util.List;
import java.util.Optional;

public interface TeamRepository extends JpaRepository<Team, Long> {
    List<Team> findByProductArea_Id(Long productAreaId);
    List<Team> findByProductArea_Name(String productAreaName);
    Optional<Team> findByName(String name);
}
