package com.example.hello.repository;

import com.example.hello.model.CodeRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CodeRepositoryRepository extends JpaRepository<CodeRepository, Long> {
    Optional<CodeRepository> findByRepositoryUrl(String repositoryUrl);
    Optional<CodeRepository> findByProjectId(String projectId);
    List<CodeRepository> findByApplication_Id(Long applicationId);
    List<CodeRepository> findByTeam_Id(Long teamId);
    boolean existsByRepositoryUrl(String repositoryUrl);
    boolean existsByProjectId(String projectId);
}
