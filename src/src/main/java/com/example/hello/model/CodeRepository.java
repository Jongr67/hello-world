package com.example.hello.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "code_repository")
public class CodeRepository {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "repository_url", nullable = false, unique = true)
    private String repositoryUrl;

    @Column(name = "project_id", nullable = false, unique = true)
    private String projectId;

    @ManyToOne
    @JoinColumn(name = "application_id")
    private Application application;

    @ManyToOne
    @JoinColumn(name = "team_id")
    private Team team;

    @Column(name = "created_date")
    private LocalDate createdDate;

    @Column(name = "updated_date")
    private LocalDate updatedDate;

    @PrePersist
    protected void onCreate() {
        createdDate = LocalDate.now();
        updatedDate = LocalDate.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedDate = LocalDate.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRepositoryUrl() {
        return repositoryUrl;
    }

    public void setRepositoryUrl(String repositoryUrl) {
        this.repositoryUrl = repositoryUrl;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public Application getApplication() {
        return application;
    }

    public void setApplication(Application application) {
        this.application = application;
    }

    public Team getTeam() {
        return team;
    }

    public void setTeam(Team team) {
        this.team = team;
    }

    public LocalDate getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDate createdDate) {
        this.createdDate = createdDate;
    }

    public LocalDate getUpdatedDate() {
        return updatedDate;
    }

    public void setUpdatedDate(LocalDate updatedDate) {
        this.updatedDate = updatedDate;
    }
}
