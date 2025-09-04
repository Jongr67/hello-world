package com.agenticapp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "query_results")
public class QueryResult {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "query_id", nullable = false)
    private Query query;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResultSource source;
    
    @Column(nullable = false, length = 5000)
    private String content;
    
    @Column(length = 1000)
    private String metadata;
    
    @Column(nullable = false)
    private LocalDateTime retrievedAt;
    
    @Column
    private LocalDateTime evaluatedAt;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResultStatus status = ResultStatus.RETRIEVED;
    
    @Column
    private Double relevanceScore;
    
    @Column
    private Double accuracyScore;
    
    @Column
    private Double confidenceScore;
    
    @Column(length = 2000)
    private String evaluationNotes;
    
    @Column
    private Boolean isVerified = false;
    
    @Column(length = 1000)
    private String verificationSource;
    
    // Constructors
    public QueryResult() {
        this.retrievedAt = LocalDateTime.now();
    }
    
    public QueryResult(Query query, ResultSource source, String content) {
        this();
        this.query = query;
        this.source = source;
        this.content = content;
    }
    
    // Getters and Setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public Query getQuery() {
        return query;
    }
    
    public void setQuery(Query query) {
        this.query = query;
    }
    
    public ResultSource getSource() {
        return source;
    }
    
    public void setSource(ResultSource source) {
        this.source = source;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public String getMetadata() {
        return metadata;
    }
    
    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }
    
    public LocalDateTime getRetrievedAt() {
        return retrievedAt;
    }
    
    public void setRetrievedAt(LocalDateTime retrievedAt) {
        this.retrievedAt = retrievedAt;
    }
    
    public LocalDateTime getEvaluatedAt() {
        return evaluatedAt;
    }
    
    public void setEvaluatedAt(LocalDateTime evaluatedAt) {
        this.evaluatedAt = evaluatedAt;
    }
    
    public ResultStatus getStatus() {
        return status;
    }
    
    public void setStatus(ResultStatus status) {
        this.status = status;
    }
    
    public Double getRelevanceScore() {
        return relevanceScore;
    }
    
    public void setRelevanceScore(Double relevanceScore) {
        this.relevanceScore = relevanceScore;
    }
    
    public Double getAccuracyScore() {
        return accuracyScore;
    }
    
    public void setAccuracyScore(Double accuracyScore) {
        this.accuracyScore = accuracyScore;
    }
    
    public Double getConfidenceScore() {
        return confidenceScore;
    }
    
    public void setConfidenceScore(Double confidenceScore) {
        this.confidenceScore = confidenceScore;
    }
    
    public String getEvaluationNotes() {
        return evaluationNotes;
    }
    
    public void setEvaluationNotes(String evaluationNotes) {
        this.evaluationNotes = evaluationNotes;
    }
    
    public Boolean getIsVerified() {
        return isVerified;
    }
    
    public void setIsVerified(Boolean isVerified) {
        this.isVerified = isVerified;
    }
    
    public String getVerificationSource() {
        return verificationSource;
    }
    
    public void setVerificationSource(String verificationSource) {
        this.verificationSource = verificationSource;
    }
    
    // Enums
    public enum ResultSource {
        DATABASE,
        API,
        DOCUMENT_STORE,
        KNOWLEDGE_BASE,
        EXTERNAL_SERVICE,
        AI_GENERATED
    }
    
    public enum ResultStatus {
        RETRIEVED,
        EVALUATING,
        EVALUATED,
        VERIFIED,
        REJECTED
    }
}
