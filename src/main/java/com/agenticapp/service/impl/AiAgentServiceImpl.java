package com.agenticapp.service.impl;

import com.agenticapp.dto.QueryRequest;
import com.agenticapp.dto.QueryResponse;
import com.agenticapp.model.Query;
import com.agenticapp.model.QueryResult;
import com.agenticapp.service.*;
import com.agenticapp.repository.jpa.QueryRepository;
import com.agenticapp.repository.jpa.QueryResultRepository;
import com.agenticapp.repository.mongo.KnowledgeBaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@Transactional
public class AiAgentServiceImpl implements AiAgentService {
    
    private static final Logger logger = LoggerFactory.getLogger(AiAgentServiceImpl.class);
    
    @Autowired
    private QueryRepository queryRepository;
    
    @Autowired
    private QueryResultRepository queryResultRepository;
    
    @Autowired
    private KnowledgeBaseRepository knowledgeBaseRepository;
    
    @Autowired
    private InformationRetrievalService informationRetrievalService;
    
    @Autowired
    private AiEvaluationService aiEvaluationService;
    
    @Autowired
    private ResponseGenerationService responseGenerationService;
    
    @Override
    public QueryResponse processQuery(QueryRequest request) {
        logger.info("Processing query: {}", request.getQueryText());
        
        try {
            // 1. Create and save the query
            Query query = createQuery(request);
            query = queryRepository.save(query);
            
            // 2. Update status to processing
            query.setStatus(Query.QueryStatus.PROCESSING);
            query.setProcessedAt(LocalDateTime.now());
            queryRepository.save(query);
            
            // 3. Retrieve information from multiple sources
            List<QueryResult> results = retrieveInformation(query, request);
            
            // 4. Evaluate the results if enabled
            if (request.getEnableEvaluation()) {
                results = evaluateResults(results, query);
            }
            
            // 5. Generate the final response
            QueryResponse response = generateResponse(query, results, request);
            
            // 6. Update query status and save results
            query.setStatus(Query.QueryStatus.COMPLETED);
            query.setCompletedAt(LocalDateTime.now());
            query.setConfidenceScore(calculateOverallConfidence(results));
            queryRepository.save(query);
            
            // Save results
            final Query finalQuery = query;
            results.forEach(result -> result.setQuery(finalQuery));
            queryResultRepository.saveAll(results);
            
            logger.info("Query processed successfully. Query ID: {}", query.getId());
            return response;
            
        } catch (Exception e) {
            logger.error("Error processing query: {}", e.getMessage(), e);
            Query query = queryRepository.findByQueryText(request.getQueryText())
                    .orElse(createQuery(request));
            query.setStatus(Query.QueryStatus.FAILED);
            queryRepository.save(query);
            
            return createErrorResponse(query.getId(), request.getQueryText(), e.getMessage());
        }
    }
    
    @Override
    public Query.QueryStatus getQueryStatus(UUID queryId) {
        return queryRepository.findById(queryId)
                .map(Query::getStatus)
                .orElse(null);
    }
    
    @Override
    public Query getQuery(UUID queryId) {
        return queryRepository.findById(queryId).orElse(null);
    }
    
    @Override
    public QueryResponse evaluateQueryResults(UUID queryId) {
        Query query = getQuery(queryId);
        if (query == null) {
            throw new IllegalArgumentException("Query not found: " + queryId);
        }
        
        List<QueryResult> results = queryResultRepository.findByQueryId(queryId);
        List<QueryResult> evaluatedResults = evaluateResults(results, query);
        
        // Update results with evaluation
        queryResultRepository.saveAll(evaluatedResults);
        
        return generateResponse(query, evaluatedResults, null);
    }
    
    @Override
    public void provideFeedback(UUID queryId, String feedback, Integer rating) {
        Query query = getQuery(queryId);
        if (query != null) {
            query.setUserFeedback(feedback);
            query.setConfidenceScore(rating);
            queryRepository.save(query);
            logger.info("Feedback received for query {}: rating={}, feedback={}", queryId, rating, feedback);
        }
    }
    
    @Override
    public List<Query> getQueryHistory(String userId, int limit) {
        List<Query> allQueries = queryRepository.findByUserIdOrderByCreatedAtDesc(userId);
        if (allQueries.size() <= limit) {
            return allQueries;
        }
        return allQueries.subList(0, limit);
    }
    
    // Private helper methods
    
    private Query createQuery(QueryRequest request) {
        Query query = new Query(request.getQueryText());
        query.setContext(request.getContext());
        query.setQueryType(request.getQueryType());
        // Set other fields as needed
        return query;
    }
    
    private List<QueryResult> retrieveInformation(Query query, QueryRequest request) {
        List<QueryResult> results = new ArrayList<>();
        
        // Retrieve from knowledge base
        CompletableFuture<List<QueryResult>> kbResults = CompletableFuture.supplyAsync(() ->
                informationRetrievalService.searchKnowledgeBase(query.getQueryText()));
        
        // Retrieve from database
        CompletableFuture<List<QueryResult>> dbResults = CompletableFuture.supplyAsync(() ->
                informationRetrievalService.searchDatabase(query.getQueryText()));
        
        // Retrieve from external APIs
        CompletableFuture<List<QueryResult>> apiResults = CompletableFuture.supplyAsync(() ->
                informationRetrievalService.searchExternalApis(query.getQueryText()));
        
        // Wait for all results
        try {
            results.addAll(kbResults.get());
            results.addAll(dbResults.get());
            results.addAll(apiResults.get());
        } catch (Exception e) {
            logger.error("Error retrieving information: {}", e.getMessage(), e);
        }
        
        return results;
    }
    
    private List<QueryResult> evaluateResults(List<QueryResult> results, Query query) {
        query.setStatus(Query.QueryStatus.EVALUATING);
        queryRepository.save(query);
        
        return results.parallelStream()
                .map(result -> {
                    try {
                        return aiEvaluationService.evaluateResult(result);
                    } catch (Exception e) {
                        logger.error("Error evaluating result: {}", e.getMessage(), e);
                        return result;
                    }
                })
                .collect(Collectors.toList());
    }
    
    private QueryResponse generateResponse(Query query, List<QueryResult> results, QueryRequest request) {
        return responseGenerationService.generateResponse(query, results, request);
    }
    
    private Integer calculateOverallConfidence(List<QueryResult> results) {
        if (results.isEmpty()) {
            return 0;
        }
        
        double avgConfidence = results.stream()
                .mapToDouble(result -> result.getConfidenceScore() != null ? result.getConfidenceScore() : 0.0)
                .average()
                .orElse(0.0);
        
        return (int) Math.round(avgConfidence * 10); // Convert to 1-10 scale
    }
    
    private QueryResponse createErrorResponse(UUID queryId, String queryText, String errorMessage) {
        QueryResponse response = new QueryResponse(queryId, queryText);
        response.setStatus(Query.QueryStatus.FAILED);
        response.setErrorMessage(errorMessage);
        response.setCompletedAt(LocalDateTime.now());
        return response;
    }
}
