package com.agenticapp.service;

import com.agenticapp.model.QueryResult;
import java.util.List;

public interface InformationRetrievalService {
    
    /**
     * Search the knowledge base for relevant information
     * @param query The search query
     * @return List of relevant results
     */
    List<QueryResult> searchKnowledgeBase(String query);
    
    /**
     * Search the database for relevant information
     * @param query The search query
     * @return List of relevant results
     */
    List<QueryResult> searchDatabase(String query);
    
    /**
     * Search external APIs for relevant information
     * @param query The search query
     * @return List of relevant results
     */
    List<QueryResult> searchExternalApis(String query);
    
    /**
     * Search documents and files for relevant information
     * @param query The search query
     * @return List of relevant results
     */
    List<QueryResult> searchDocuments(String query);
    
    /**
     * Perform a semantic search across all available sources
     * @param query The search query
     * @return List of relevant results
     */
    List<QueryResult> semanticSearch(String query);
    
    /**
     * Retrieve specific information by ID or reference
     * @param reference The reference identifier
     * @return The specific result
     */
    QueryResult getSpecificInformation(String reference);
    
    /**
     * Get trending or popular topics related to the query
     * @param query The search query
     * @return List of trending topics
     */
    List<String> getTrendingTopics(String query);
}
