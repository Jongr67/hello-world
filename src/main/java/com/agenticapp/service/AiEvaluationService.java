package com.agenticapp.service;

import com.agenticapp.model.QueryResult;
import java.util.List;

public interface AiEvaluationService {
    
    /**
     * Evaluate a single query result for accuracy and relevance
     * @param result The query result to evaluate
     * @return The evaluated result with scores and notes
     */
    QueryResult evaluateResult(QueryResult result);
    
    /**
     * Evaluate multiple results and rank them by relevance
     * @param results The list of results to evaluate
     * @return The ranked and evaluated results
     */
    List<QueryResult> evaluateResults(List<QueryResult> results);
    
    /**
     * Verify the factual accuracy of information
     * @param result The result to verify
     * @return The verification result
     */
    QueryResult verifyFactualAccuracy(QueryResult result);
    
    /**
     * Check for consistency across multiple sources
     * @param results The results to check for consistency
     * @return Consistency analysis
     */
    ConsistencyAnalysis checkConsistency(List<QueryResult> results);
    
    /**
     * Detect potential biases or misinformation
     * @param result The result to analyze
     * @return Bias analysis
     */
    BiasAnalysis detectBias(QueryResult result);
    
    /**
     * Calculate confidence scores based on multiple factors
     * @param result The result to score
     * @return The confidence score
     */
    Double calculateConfidenceScore(QueryResult result);
    
    /**
     * Generate evaluation summary for a set of results
     * @param results The results to summarize
     * @return The evaluation summary
     */
    String generateEvaluationSummary(List<QueryResult> results);
    
    // Supporting classes
    class ConsistencyAnalysis {
        private double consistencyScore;
        private List<String> inconsistencies;
        private String summary;
        
        // Getters and setters
        public double getConsistencyScore() { return consistencyScore; }
        public void setConsistencyScore(double consistencyScore) { this.consistencyScore = consistencyScore; }
        
        public List<String> getInconsistencies() { return inconsistencies; }
        public void setInconsistencies(List<String> inconsistencies) { this.inconsistencies = inconsistencies; }
        
        public String getSummary() { return summary; }
        public void setSummary(String summary) { this.summary = summary; }
    }
    
    class BiasAnalysis {
        private double biasScore;
        private List<String> detectedBiases;
        private String biasType;
        private String recommendation;
        
        // Getters and setters
        public double getBiasScore() { return biasScore; }
        public void setBiasScore(double biasScore) { this.biasScore = biasScore; }
        
        public List<String> getDetectedBiases() { return detectedBiases; }
        public void setDetectedBiases(List<String> detectedBiases) { this.detectedBiases = detectedBiases; }
        
        public String getBiasType() { return biasType; }
        public void setBiasType(String biasType) { this.biasType = biasType; }
        
        public String getRecommendation() { return recommendation; }
        public void setRecommendation(String recommendation) { this.recommendation = recommendation; }
    }
}
