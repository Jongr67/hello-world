package com.agenticapp.dto;

import com.agenticapp.model.Query;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.Map;

public class QueryRequest {
    
    @NotBlank(message = "Query text is required")
    @Size(max = 2000, message = "Query text cannot exceed 2000 characters")
    private String queryText;
    
    @Size(max = 500, message = "Context cannot exceed 500 characters")
    private String context;
    
    private Query.QueryType queryType = Query.QueryType.GENERAL;
    
    private Map<String, Object> parameters;
    
    private String userId;
    
    private String sessionId;
    
    private Boolean enableEvaluation = true;
    
    private Boolean enableVerification = false;
    
    // Constructors
    public QueryRequest() {}
    
    public QueryRequest(String queryText) {
        this.queryText = queryText;
    }
    
    // Getters and Setters
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
    
    public Query.QueryType getQueryType() {
        return queryType;
    }
    
    public void setQueryType(Query.QueryType queryType) {
        this.queryType = queryType;
    }
    
    public Map<String, Object> getParameters() {
        return parameters;
    }
    
    public void setParameters(Map<String, Object> parameters) {
        this.parameters = parameters;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getSessionId() {
        return sessionId;
    }
    
    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }
    
    public Boolean getEnableEvaluation() {
        return enableEvaluation;
    }
    
    public void setEnableEvaluation(Boolean enableEvaluation) {
        this.enableEvaluation = enableEvaluation;
    }
    
    public Boolean getEnableVerification() {
        return enableVerification;
    }
    
    public void setEnableVerification(Boolean enableVerification) {
        this.enableVerification = enableVerification;
    }
}
