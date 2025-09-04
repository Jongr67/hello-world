package com.agenticapp.service;

import com.agenticapp.dto.QueryRequest;
import com.agenticapp.dto.QueryResponse;
import com.agenticapp.model.Query;
import com.agenticapp.model.QueryResult;
import java.util.List;

public interface ResponseGenerationService {
    
    /**
     * Generate a comprehensive response based on query and results
     * @param query The original query
     * @param results The evaluated results
     * @param request The original request (optional)
     * @return The generated response
     */
    QueryResponse generateResponse(Query query, List<QueryResult> results, QueryRequest request);
    
    /**
     * Synthesize information from multiple sources into a coherent response
     * @param results The results to synthesize
     * @return The synthesized response
     */
    String synthesizeInformation(List<QueryResult> results);
    
    /**
     * Format the response based on the query type and user preferences
     * @param response The response to format
     * @param queryType The type of query
     * @return The formatted response
     */
    String formatResponse(String response, Query.QueryType queryType);
    
    /**
     * Add confidence indicators and source citations to the response
     * @param response The response to enhance
     * @param results The source results
     * @return The enhanced response
     */
    String addConfidenceIndicators(String response, List<QueryResult> results);
    
    /**
     * Generate recommendations based on the query and results
     * @param query The original query
     * @param results The results
     * @return List of recommendations
     */
    List<String> generateRecommendations(Query query, List<QueryResult> results);
    
    /**
     * Create a summary of the response for quick understanding
     * @param response The full response
     * @return The summary
     */
    String createSummary(String response);
    
    /**
     * Handle cases where no relevant information is found
     * @param query The original query
     * @return A helpful response for no results
     */
    String handleNoResults(Query query);
    
    /**
     * Generate follow-up questions based on the response
     * @param response The generated response
     * @return List of follow-up questions
     */
    List<String> generateFollowUpQuestions(String response);
}
