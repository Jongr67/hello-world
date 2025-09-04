package com.agenticapp.dto;

import com.agenticapp.model.Query;
import com.agenticapp.model.QueryResult;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.Map;

public class QueryResponse {
    
    private UUID queryId;
    
    private String queryText;
    
    private String response;
    
    private List<QueryResult> results;
    
    private Query.QueryStatus status;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime completedAt;
    
    private Double overallConfidence;
    
    private String evaluationSummary;
    
    private List<String> sources;
    
    private List<String> recommendations;
    
    private List<String> followUpQuestions;
    
    private String errorMessage;
    
    private Boolean isVerified;
    
    private String verificationNotes;
    
    private Map<String, Object> metadata;
    
    // Constructors
    public QueryResponse() {}
    
    public QueryResponse(UUID queryId, String queryText) {
        this.queryId = queryId;
        this.queryText = queryText;
        this.createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public UUID getQueryId() {
        return queryId;
    }
    
    public void setQueryId(UUID queryId) {
        this.queryId = queryId;
    }
    
    public String getQueryText() {
        return queryText;
    }
    
    public void setQueryText(String queryText) {
        this.queryText = queryText;
    }
    
    public String getResponse() {
        return response;
    }
    
    public void setResponse(String response) {
        this.response = response;
    }
    
    public List<QueryResult> getResults() {
        return results;
    }
    
    public void setResults(List<QueryResult> results) {
        this.results = results;
    }
    
    public Query.QueryStatus getStatus() {
        return status;
    }
    
    public void setStatus(Query.QueryStatus status) {
        this.status = status;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getCompletedAt() {
        return completedAt;
    }
    
    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
    
    public Double getOverallConfidence() {
        return overallConfidence;
    }
    
    public void setOverallConfidence(Double overallConfidence) {
        this.overallConfidence = overallConfidence;
    }
    
    public String getEvaluationSummary() {
        return evaluationSummary;
    }
    
    public void setEvaluationSummary(String evaluationSummary) {
        this.evaluationSummary = evaluationSummary;
    }
    
    public List<String> getSources() {
        return sources;
    }
    
    public void setSources(List<String> sources) {
        this.sources = sources;
    }
    
    public List<String> getRecommendations() {
        return recommendations;
    }
    
    public void setRecommendations(List<String> recommendations) {
        this.recommendations = recommendations;
    }
    
    public List<String> getFollowUpQuestions() {
        return followUpQuestions;
    }
    
    public void setFollowUpQuestions(List<String> followUpQuestions) {
        this.followUpQuestions = followUpQuestions;
    }
    
    public String getErrorMessage() {
        return errorMessage;
    }
    
    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
    
    public Boolean getIsVerified() {
        return isVerified;
    }
    
    public void setIsVerified(Boolean isVerified) {
        this.isVerified = isVerified;
    }
    
    public String getVerificationNotes() {
        return verificationNotes;
    }
    
    public void setVerificationNotes(String verificationNotes) {
        this.verificationNotes = verificationNotes;
    }
    
    public Map<String, Object> getMetadata() {
        return metadata;
    }
    
    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
    }
}
