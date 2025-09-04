package com.agenticapp.controller;

import com.agenticapp.dto.QueryRequest;
import com.agenticapp.dto.QueryResponse;
import com.agenticapp.model.Query;
import com.agenticapp.service.AiAgentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ai-agent")
@CrossOrigin(origins = "*")
public class AiAgentController {
    
    private static final Logger logger = LoggerFactory.getLogger(AiAgentController.class);
    
    @Autowired
    private AiAgentService aiAgentService;
    
    /**
     * Process a new query
     */
    @PostMapping("/query")
    public ResponseEntity<QueryResponse> processQuery(@Valid @RequestBody QueryRequest request) {
        logger.info("Received query request: {}", request.getQueryText());
        
        try {
            QueryResponse response = aiAgentService.processQuery(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error processing query: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse(request.getQueryText(), e.getMessage()));
        }
    }
    
    /**
     * Get query status
     */
    @GetMapping("/query/{queryId}/status")
    public ResponseEntity<Query.QueryStatus> getQueryStatus(@PathVariable UUID queryId) {
        try {
            Query.QueryStatus status = aiAgentService.getQueryStatus(queryId);
            if (status != null) {
                return ResponseEntity.ok(status);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error getting query status: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get query details
     */
    @GetMapping("/query/{queryId}")
    public ResponseEntity<Query> getQuery(@PathVariable UUID queryId) {
        try {
            Query query = aiAgentService.getQuery(queryId);
            if (query != null) {
                return ResponseEntity.ok(query);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error getting query: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Evaluate query results
     */
    @PostMapping("/query/{queryId}/evaluate")
    public ResponseEntity<QueryResponse> evaluateQueryResults(@PathVariable UUID queryId) {
        try {
            QueryResponse response = aiAgentService.evaluateQueryResults(queryId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.warn("Query not found for evaluation: {}", queryId);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error evaluating query results: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Provide feedback on a query response
     */
    @PostMapping("/query/{queryId}/feedback")
    public ResponseEntity<Void> provideFeedback(
            @PathVariable UUID queryId,
            @RequestParam String feedback,
            @RequestParam Integer rating) {
        
        try {
            if (rating < 1 || rating > 10) {
                return ResponseEntity.badRequest().build();
            }
            
            aiAgentService.provideFeedback(queryId, feedback, rating);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error providing feedback: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get query history for a user
     */
    @GetMapping("/user/{userId}/history")
    public ResponseEntity<List<Query>> getQueryHistory(
            @PathVariable String userId,
            @RequestParam(defaultValue = "10") int limit) {
        
        try {
            if (limit < 1 || limit > 100) {
                limit = 10;
            }
            
            List<Query> history = aiAgentService.getQueryHistory(userId, limit);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            logger.error("Error getting query history: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("AI Agent Service is running");
    }
    
    /**
     * Get system statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<SystemStats> getSystemStats() {
        try {
            // This would typically come from a service that aggregates statistics
            SystemStats stats = new SystemStats();
            stats.setTotalQueries(0); // TODO: Implement actual counting
            stats.setActiveQueries(0);
            stats.setAverageResponseTime(0.0);
            stats.setSuccessRate(100.0);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("Error getting system stats: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Helper methods
    
    private QueryResponse createErrorResponse(String queryText, String errorMessage) {
        QueryResponse response = new QueryResponse(UUID.randomUUID(), queryText);
        response.setErrorMessage(errorMessage);
        response.setStatus(Query.QueryStatus.FAILED);
        return response;
    }
    
    // Supporting classes
    
    public static class SystemStats {
        private long totalQueries;
        private long activeQueries;
        private double averageResponseTime;
        private double successRate;
        
        // Getters and setters
        public long getTotalQueries() { return totalQueries; }
        public void setTotalQueries(long totalQueries) { this.totalQueries = totalQueries; }
        
        public long getActiveQueries() { return activeQueries; }
        public void setActiveQueries(long activeQueries) { this.activeQueries = activeQueries; }
        
        public double getAverageResponseTime() { return averageResponseTime; }
        public void setAverageResponseTime(double averageResponseTime) { this.averageResponseTime = averageResponseTime; }
        
        public double getSuccessRate() { return successRate; }
        public void setSuccessRate(double successRate) { this.successRate = successRate; }
    }
}
