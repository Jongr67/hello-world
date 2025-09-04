package com.agenticapp.service.impl;

import com.agenticapp.model.QueryResult;
import com.agenticapp.service.AiEvaluationService;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.ArrayList;

@Service
public class AiEvaluationServiceImpl implements AiEvaluationService {
    
    private static final Logger logger = LoggerFactory.getLogger(AiEvaluationServiceImpl.class);
    
    @Override
    public QueryResult evaluateResult(QueryResult result) {
        logger.info("Evaluating result: {}", result.getId());
        
        try {
            // Basic evaluation logic - in a real implementation, this would use AI models
            if (result.getContent() != null && !result.getContent().isEmpty()) {
                result.setConfidenceScore(0.8); // Placeholder confidence score
                result.setAccuracyScore(0.7);   // Placeholder accuracy score
                result.setStatus(QueryResult.ResultStatus.EVALUATED);
                result.setEvaluationNotes("Basic evaluation completed");
            } else {
                result.setConfidenceScore(0.1);
                result.setAccuracyScore(0.1);
                result.setStatus(QueryResult.ResultStatus.REJECTED);
                result.setEvaluationNotes("Empty content - rejected");
            }
            
        } catch (Exception e) {
            logger.error("Error evaluating result: {}", e.getMessage(), e);
            result.setStatus(QueryResult.ResultStatus.REJECTED);
            result.setEvaluationNotes("Evaluation failed: " + e.getMessage());
        }
        
        return result;
    }
    
    @Override
    public List<QueryResult> evaluateResults(List<QueryResult> results) {
        logger.info("Evaluating {} results", results.size());
        
        return results.parallelStream()
                .map(this::evaluateResult)
                .toList();
    }
    
    @Override
    public QueryResult verifyFactualAccuracy(QueryResult result) {
        logger.info("Verifying factual accuracy for result: {}", result.getId());
        
        try {
            // Basic verification logic - in a real implementation, this would use AI models
            if (result.getConfidenceScore() != null && result.getConfidenceScore() > 0.7) {
                result.setIsVerified(true);
                result.setVerificationSource("AI Evaluation Service");
            } else {
                result.setIsVerified(false);
                result.setVerificationSource("AI Evaluation Service - Low Confidence");
            }
            
        } catch (Exception e) {
            logger.error("Error verifying factual accuracy: {}", e.getMessage(), e);
            result.setIsVerified(false);
            result.setVerificationSource("AI Evaluation Service - Error");
        }
        
        return result;
    }
    
    @Override
    public ConsistencyAnalysis checkConsistency(List<QueryResult> results) {
        logger.info("Checking consistency across {} results", results.size());
        
        return new ConsistencyAnalysis() {
            @Override
            public double getConsistencyScore() {
                if (results.size() <= 1) return 1.0;
                
                double totalScore = 0.0;
                int comparisons = 0;
                
                for (int i = 0; i < results.size(); i++) {
                    for (int j = i + 1; j < results.size(); j++) {
                        QueryResult r1 = results.get(i);
                        QueryResult r2 = results.get(j);
                        
                        if (r1.getContent() != null && r2.getContent() != null) {
                            double similarity = calculateContentSimilarity(r1.getContent(), r2.getContent());
                            totalScore += similarity;
                            comparisons++;
                        }
                    }
                }
                
                return comparisons > 0 ? totalScore / comparisons : 0.0;
            }
            
            @Override
            public List<String> getInconsistencies() {
                List<String> inconsistencies = new ArrayList<>();
                if (results.size() <= 1) return inconsistencies;
                
                for (int i = 0; i < results.size(); i++) {
                    for (int j = i + 1; j < results.size(); j++) {
                        QueryResult r1 = results.get(i);
                        QueryResult r2 = results.get(j);
                        
                        if (r1.getContent() != null && r2.getContent() != null) {
                            double similarity = calculateContentSimilarity(r1.getContent(), r2.getContent());
                            if (similarity < 0.3) {
                                inconsistencies.add("Low similarity between results " + i + " and " + j + " (similarity: " + String.format("%.2f", similarity) + ")");
                            }
                        }
                    }
                }
                
                return inconsistencies;
            }
            
            @Override
            public String getSummary() {
                List<String> inconsistencies = getInconsistencies();
                return inconsistencies.isEmpty() ? "Results are consistent" : "Some inconsistencies detected";
            }
        };
    }
    
    @Override
    public BiasAnalysis detectBias(QueryResult result) {
        logger.info("Detecting bias in result: {}", result.getId());
        
        return new BiasAnalysis() {
            @Override
            public double getBiasScore() {
                if (result.getContent() == null) return 0.0;
                
                String content = result.getContent().toLowerCase();
                boolean hasBias = content.contains("always") || content.contains("never") || 
                                content.contains("everyone") || content.contains("nobody") ||
                                content.contains("best") || content.contains("worst");
                
                return hasBias ? 0.6 : 0.2;
            }
            
            @Override
            public List<String> getDetectedBiases() {
                List<String> biases = new ArrayList<>();
                if (result.getContent() == null) return biases;
                
                String content = result.getContent().toLowerCase();
                
                if (content.contains("always") || content.contains("never")) {
                    biases.add("Absolute language detected");
                }
                if (content.contains("everyone") || content.contains("nobody")) {
                    biases.add("Generalization detected");
                }
                if (content.contains("best") || content.contains("worst")) {
                    biases.add("Subjective evaluation detected");
                }
                
                return biases;
            }
            
            @Override
            public String getBiasType() {
                if (result.getContent() == null) return "None";
                
                String content = result.getContent().toLowerCase();
                boolean hasBias = content.contains("always") || content.contains("never") || 
                                content.contains("everyone") || content.contains("nobody") ||
                                content.contains("best") || content.contains("worst");
                
                return hasBias ? "Generalization" : "None detected";
            }
            
            @Override
            public String getRecommendation() {
                if (result.getContent() == null) return "No content to analyze";
                
                String content = result.getContent().toLowerCase();
                boolean hasBias = content.contains("always") || content.contains("never") || 
                                content.contains("everyone") || content.contains("nobody") ||
                                content.contains("best") || content.contains("worst");
                
                return hasBias ? "Consider using more specific language" : "Content appears unbiased";
            }
        };
    }
    
    @Override
    public Double calculateConfidenceScore(QueryResult result) {
        if (result == null) {
            return 0.0;
        }
        
        double score = 0.0;
        int factors = 0;
        
        // Content quality
        if (result.getContent() != null && !result.getContent().isEmpty()) {
            score += 0.3;
            factors++;
        }
        
        // Relevance score
        if (result.getRelevanceScore() != null) {
            score += result.getRelevanceScore() * 0.3;
            factors++;
        }
        
        // Source reliability
        if (result.getSource() != null) {
            switch (result.getSource()) {
                case KNOWLEDGE_BASE -> score += 0.2;
                case DATABASE -> score += 0.15;
                case API -> score += 0.1;
                default -> score += 0.05;
            }
            factors++;
        }
        
        // Verification status
        if (result.getIsVerified() != null && result.getIsVerified()) {
            score += 0.2;
            factors++;
        }
        
        return factors > 0 ? score / factors : 0.0;
    }
    
    @Override
    public String generateEvaluationSummary(List<QueryResult> results) {
        if (results == null || results.isEmpty()) {
            return "No results to evaluate";
        }
        
        try {
            int totalResults = results.size();
            int evaluatedResults = (int) results.stream()
                    .filter(r -> r.getStatus() == QueryResult.ResultStatus.EVALUATED)
                    .count();
            int verifiedResults = (int) results.stream()
                    .filter(r -> r.getIsVerified() != null && r.getIsVerified())
                    .count();
            
            double avgConfidence = results.stream()
                    .mapToDouble(r -> r.getConfidenceScore() != null ? r.getConfidenceScore() : 0.0)
                    .average()
                    .orElse(0.0);
            
            return String.format(
                "Evaluation Summary: %d/%d results evaluated, %d verified, " +
                "average confidence: %.2f", 
                evaluatedResults, totalResults, verifiedResults, avgConfidence
            );
            
        } catch (Exception e) {
            logger.error("Error generating evaluation summary: {}", e.getMessage(), e);
            return "Error generating evaluation summary: " + e.getMessage();
        }
    }
    
    // Helper method for content similarity
    private double calculateContentSimilarity(String content1, String content2) {
        if (content1 == null || content2 == null) {
            return 0.0;
        }
        
        String[] words1 = content1.toLowerCase().split("\\s+");
        String[] words2 = content2.toLowerCase().split("\\s+");
        
        int commonWords = 0;
        for (String word1 : words1) {
            for (String word2 : words2) {
                if (word1.equals(word2)) {
                    commonWords++;
                }
            }
        }
        
        int totalWords = words1.length + words2.length;
        return totalWords > 0 ? (double) commonWords / totalWords : 0.0;
    }
}
