package com.agenticapp.service;

import com.agenticapp.dto.QueryRequest;
import com.agenticapp.dto.QueryResponse;
import com.agenticapp.model.Query;
import java.util.UUID;

public interface AiAgentService {
    
    /**
     * Process a user query through the AI agent system
     * @param request The query request from the user
     * @return The processed query response
     */
    QueryResponse processQuery(QueryRequest request);
    
    /**
     * Get the status of a specific query
     * @param queryId The ID of the query to check
     * @return The current query status
     */
    Query.QueryStatus getQueryStatus(UUID queryId);
    
    /**
     * Get a specific query by ID
     * @param queryId The ID of the query to retrieve
     * @return The query object
     */
    Query getQuery(UUID queryId);
    
    /**
     * Evaluate and verify the accuracy of query results
     * @param queryId The ID of the query to evaluate
     * @return The evaluation results
     */
    QueryResponse evaluateQueryResults(UUID queryId);
    
    /**
     * Provide feedback on a query response
     * @param queryId The ID of the query
     * @param feedback The user feedback
     * @param rating The confidence rating (1-10)
     */
    void provideFeedback(UUID queryId, String feedback, Integer rating);
    
    /**
     * Get query history for a user
     * @param userId The user ID
     * @param limit The maximum number of queries to return
     * @return List of recent queries
     */
    java.util.List<Query> getQueryHistory(String userId, int limit);
}
