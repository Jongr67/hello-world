package com.agenticapp.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "queries")
public class Query {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @NotBlank(message = "Query text is required")
    @Size(max = 2000, message = "Query text cannot exceed 2000 characters")
    @Column(nullable = false, length = 2000)
    private String queryText;
    
    @Column(length = 500)
    private String context;
    
    @Column(length = 100)
    private String userId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QueryType queryType = QueryType.GENERAL;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QueryStatus status = QueryStatus.PENDING;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column
    private LocalDateTime processedAt;
    
    @Column
    private LocalDateTime completedAt;
    
    @OneToMany(mappedBy = "query", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<QueryResult> results;
    
    @Column(length = 1000)
    private String userFeedback;
    
    @Column
    private Integer confidenceScore;
    
    // Constructors
    public Query() {
        this.createdAt = LocalDateTime.now();
    }
    
    public Query(String queryText) {
        this();
        this.queryText = queryText;
    }
    
    // Getters and Setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public String getQueryText() {
        return queryText;
    }
    
    public void setQueryText(String queryText) {
        this.queryText = queryText;
    }
    
    public String getContext() {
        return context;
    }
    
    public void setContext(String context) {
        this.context = context;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public QueryType getQueryType() {
        return queryType;
    }
    
    public void setQueryType(QueryType queryType) {
        this.queryType = queryType;
    }
    
    public QueryStatus getStatus() {
        return status;
    }
    
    public void setStatus(QueryStatus status) {
        this.status = status;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getProcessedAt() {
        return processedAt;
    }
    
    public void setProcessedAt(LocalDateTime processedAt) {
        this.processedAt = processedAt;
    }
    
    public LocalDateTime getCompletedAt() {
        return completedAt;
    }
    
    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
    
    public List<QueryResult> getResults() {
        return results;
    }
    
    public void setResults(List<QueryResult> results) {
        this.results = results;
    }
    
    public String getUserFeedback() {
        return userFeedback;
    }
    
    public void setUserFeedback(String userFeedback) {
        this.userFeedback = userFeedback;
    }
    
    public Integer getConfidenceScore() {
        return confidenceScore;
    }
    
    public void setConfidenceScore(Integer confidenceScore) {
        this.confidenceScore = confidenceScore;
    }
    
    // Enums
    public enum QueryType {
        DATABASE_QUERY,
        API_QUERY,
        DOCUMENT_SEARCH,
        GENERAL,
        TECHNICAL,
        BUSINESS
    }
    
    public enum QueryStatus {
        PENDING,
        PROCESSING,
        COMPLETED,
        FAILED,
        EVALUATING
    }
}
