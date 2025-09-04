package com.agenticapp.service.impl;

import com.agenticapp.dto.QueryRequest;
import com.agenticapp.dto.QueryResponse;
import com.agenticapp.model.Query;
import com.agenticapp.model.QueryResult;
import com.agenticapp.service.ResponseGenerationService;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResponseGenerationServiceImpl implements ResponseGenerationService {
    
    private static final Logger logger = LoggerFactory.getLogger(ResponseGenerationServiceImpl.class);
    
    @Override
    public QueryResponse generateResponse(Query query, List<QueryResult> results, QueryRequest request) {
        logger.info("Generating response for query: {}", query.getId());
        
        try {
            QueryResponse response = new QueryResponse(query.getId(), query.getQueryText());
            response.setStatus(query.getStatus());
            response.setResults(results);
            response.setCompletedAt(LocalDateTime.now());
            
            if (results == null || results.isEmpty()) {
                response.setResponse(handleNoResults(query));
                response.setOverallConfidence(0.0);
                response.setEvaluationSummary("No results found");
            } else {
                // Synthesize information from results
                String synthesizedResponse = synthesizeInformation(results);
                response.setResponse(formatResponse(synthesizedResponse, query.getQueryType()));
                response.setOverallConfidence(calculateOverallConfidence(results));
                response.setEvaluationSummary("Results processed successfully");
                
                // Add confidence indicators
                response.setResponse(addConfidenceIndicators(response.getResponse(), results));
                
                // Generate recommendations
                List<String> recommendations = generateRecommendations(query, results);
                response.setRecommendations(recommendations);
                
                // Generate follow-up questions
                List<String> followUpQuestions = generateFollowUpQuestions(response.getResponse());
                response.setFollowUpQuestions(followUpQuestions);
                
                // Set sources
                List<String> sources = results.stream()
                        .map(result -> result.getSource().toString())
                        .distinct()
                        .collect(Collectors.toList());
                response.setSources(sources);
            }
            
            return response;
            
        } catch (Exception e) {
            logger.error("Error generating response: {}", e.getMessage(), e);
            QueryResponse errorResponse = new QueryResponse(query.getId(), query.getQueryText());
            errorResponse.setStatus(Query.QueryStatus.FAILED);
            errorResponse.setErrorMessage("Error generating response: " + e.getMessage());
            errorResponse.setCompletedAt(LocalDateTime.now());
            return errorResponse;
        }
    }
    
    @Override
    public String synthesizeInformation(List<QueryResult> results) {
        if (results == null || results.isEmpty()) {
            return "No information available to synthesize.";
        }
        
        try {
            StringBuilder synthesis = new StringBuilder();
            
            // Group results by source
            var resultsBySource = results.stream()
                    .collect(Collectors.groupingBy(QueryResult::getSource));
            
            synthesis.append("Based on information from multiple sources:\n\n");
            
            for (var entry : resultsBySource.entrySet()) {
                String source = entry.getKey().toString();
                List<QueryResult> sourceResults = entry.getValue();
                
                synthesis.append("**").append(source).append(":**\n");
                
                for (QueryResult result : sourceResults) {
                    if (result.getContent() != null && !result.getContent().isEmpty()) {
                        synthesis.append("- ").append(result.getContent()).append("\n");
                        
                        if (result.getConfidenceScore() != null) {
                            synthesis.append("  (Confidence: ").append(String.format("%.1f", result.getConfidenceScore() * 100)).append("%)\n");
                        }
                    }
                }
                synthesis.append("\n");
            }
            
            // Add summary
            synthesis.append("**Summary:** ");
            synthesis.append("Found ").append(results.size()).append(" relevant results across ")
                    .append(resultsBySource.size()).append(" different sources.");
            
            return synthesis.toString();
            
        } catch (Exception e) {
            logger.error("Error synthesizing information: {}", e.getMessage(), e);
            return "Error synthesizing information: " + e.getMessage();
        }
    }
    
    @Override
    public String formatResponse(String response, Query.QueryType queryType) {
        if (response == null || response.isEmpty()) {
            return response;
        }
        
        try {
            StringBuilder formatted = new StringBuilder();
            
            switch (queryType) {
                case TECHNICAL -> {
                    formatted.append("## Technical Analysis\n\n");
                    formatted.append(response);
                    formatted.append("\n\n*This response contains technical information that may require specialized knowledge.*");
                }
                case BUSINESS -> {
                    formatted.append("## Business Intelligence\n\n");
                    formatted.append(response);
                    formatted.append("\n\n*This analysis is based on business data and market insights.*");
                }
                case DATABASE_QUERY -> {
                    formatted.append("## Database Query Results\n\n");
                    formatted.append(response);
                    formatted.append("\n\n*Results retrieved from database sources.*");
                }
                case API_QUERY -> {
                    formatted.append("## API Data Analysis\n\n");
                    formatted.append(response);
                    formatted.append("\n\n*Information gathered from external API sources.*");
                }
                case DOCUMENT_SEARCH -> {
                    formatted.append("## Document Search Results\n\n");
                    formatted.append(response);
                    formatted.append("\n\n*Information extracted from document sources.*");
                }
                default -> {
                    formatted.append("## Information Summary\n\n");
                    formatted.append(response);
                }
            }
            
            return formatted.toString();
            
        } catch (Exception e) {
            logger.error("Error formatting response: {}", e.getMessage(), e);
            return response; // Return original response if formatting fails
        }
    }
    
    @Override
    public String addConfidenceIndicators(String response, List<QueryResult> results) {
        if (response == null || results == null || results.isEmpty()) {
            return response;
        }
        
        try {
            StringBuilder enhancedResponse = new StringBuilder(response);
            
            // Calculate overall confidence
            double overallConfidence = calculateOverallConfidence(results);
            
            // Add confidence header
            enhancedResponse.insert(0, String.format("**Confidence Level: %.1f%%**\n\n", overallConfidence * 100));
            
            // Add confidence indicators for each source
            enhancedResponse.append("\n\n---\n**Source Confidence Levels:**\n");
            
            var resultsBySource = results.stream()
                    .collect(Collectors.groupingBy(QueryResult::getSource));
            
            for (var entry : resultsBySource.entrySet()) {
                String source = entry.getKey().toString();
                List<QueryResult> sourceResults = entry.getValue();
                
                double sourceConfidence = sourceResults.stream()
                        .mapToDouble(r -> r.getConfidenceScore() != null ? r.getConfidenceScore() : 0.0)
                        .average()
                        .orElse(0.0);
                
                enhancedResponse.append(String.format("- %s: %.1f%%\n", source, sourceConfidence * 100));
            }
            
            return enhancedResponse.toString();
            
        } catch (Exception e) {
            logger.error("Error adding confidence indicators: {}", e.getMessage(), e);
            return response; // Return original response if enhancement fails
        }
    }
    
    @Override
    public List<String> generateRecommendations(Query query, List<QueryResult> results) {
        List<String> recommendations = new ArrayList<>();
        
        try {
            if (results == null || results.isEmpty()) {
                recommendations.add("Consider rephrasing your query for better results");
                recommendations.add("Try using more specific keywords");
                return recommendations;
            }
            
            // Analyze results and generate contextual recommendations
            if (query.getQueryType() == Query.QueryType.TECHNICAL) {
                recommendations.add("Consider consulting technical documentation for detailed implementation");
                recommendations.add("Verify the technical specifications against your requirements");
            } else if (query.getQueryType() == Query.QueryType.BUSINESS) {
                recommendations.add("Review recent market trends for additional context");
                recommendations.add("Consider consulting business analysts for strategic insights");
            }
            
            // General recommendations based on result quality
            double avgConfidence = results.stream()
                    .mapToDouble(r -> r.getConfidenceScore() != null ? r.getConfidenceScore() : 0.0)
                    .average()
                    .orElse(0.0);
            
            if (avgConfidence < 0.5) {
                recommendations.add("Results have low confidence - consider additional verification");
                recommendations.add("Cross-reference information from multiple sources");
            }
            
            if (results.size() < 3) {
                recommendations.add("Limited results found - consider expanding your search scope");
            }
            
            // Add source-specific recommendations
            long knowledgeBaseCount = results.stream()
                    .filter(r -> r.getSource() == QueryResult.ResultSource.KNOWLEDGE_BASE)
                    .count();
            
            if (knowledgeBaseCount == 0) {
                recommendations.add("No knowledge base results - consider updating internal documentation");
            }
            
        } catch (Exception e) {
            logger.error("Error generating recommendations: {}", e.getMessage(), e);
            recommendations.add("Unable to generate specific recommendations");
        }
        
        return recommendations;
    }
    
    @Override
    public String createSummary(String response) {
        if (response == null || response.isEmpty()) {
            return "No response to summarize.";
        }
        
        try {
            // Simple summary - take first few sentences
            String[] sentences = response.split("[.!?]+");
            if (sentences.length <= 2) {
                return response;
            }
            
            StringBuilder summary = new StringBuilder();
            for (int i = 0; i < Math.min(3, sentences.length); i++) {
                if (sentences[i].trim().length() > 0) {
                    summary.append(sentences[i].trim()).append(". ");
                }
            }
            
            summary.append("...");
            return summary.toString();
            
        } catch (Exception e) {
            logger.error("Error creating summary: {}", e.getMessage(), e);
            return "Error creating summary: " + e.getMessage();
        }
    }
    
    @Override
    public String handleNoResults(Query query) {
        try {
            StringBuilder response = new StringBuilder();
            response.append("No results found for your query: \"").append(query.getQueryText()).append("\"\n\n");
            
            response.append("**Suggestions to improve your search:**\n");
            response.append("- Try using different keywords\n");
            response.append("- Use more specific terms\n");
            response.append("- Check spelling and grammar\n");
            response.append("- Consider rephrasing your question\n");
            
            if (query.getQueryType() != Query.QueryType.GENERAL) {
                response.append("- Try a general search instead of ").append(query.getQueryType().toString().toLowerCase()).append("\n");
            }
            
            response.append("\n**Alternative approaches:**\n");
            response.append("- Search our knowledge base directly\n");
            response.append("- Contact support for assistance\n");
            response.append("- Check our FAQ section\n");
            
            return response.toString();
            
        } catch (Exception e) {
            logger.error("Error handling no results: {}", e.getMessage(), e);
            return "No results found. Please try a different search.";
        }
    }
    
    @Override
    public List<String> generateFollowUpQuestions(String response) {
        List<String> followUpQuestions = new ArrayList<>();
        
        try {
            if (response == null || response.isEmpty()) {
                followUpQuestions.add("Could you provide more details about your query?");
                return followUpQuestions;
            }
            
            // Generate contextual follow-up questions based on response content
            String lowerResponse = response.toLowerCase();
            
            if (lowerResponse.contains("technical") || lowerResponse.contains("implementation")) {
                followUpQuestions.add("Would you like more detailed technical specifications?");
                followUpQuestions.add("Do you need help with the implementation?");
            }
            
            if (lowerResponse.contains("business") || lowerResponse.contains("market")) {
                followUpQuestions.add("Would you like to see recent market trends?");
                followUpQuestions.add("Do you need competitive analysis?");
            }
            
            if (lowerResponse.contains("database") || lowerResponse.contains("query")) {
                followUpQuestions.add("Would you like to see the raw data?");
                followUpQuestions.add("Do you need help with database optimization?");
            }
            
            // General follow-up questions
            followUpQuestions.add("Is there a specific aspect you'd like me to elaborate on?");
            followUpQuestions.add("Would you like to see related information?");
            followUpQuestions.add("Do you have any specific requirements or constraints?");
            
        } catch (Exception e) {
            logger.error("Error generating follow-up questions: {}", e.getMessage(), e);
            followUpQuestions.add("How can I help you further?");
        }
        
        return followUpQuestions;
    }
    
    // Helper method to calculate overall confidence
    private double calculateOverallConfidence(List<QueryResult> results) {
        if (results == null || results.isEmpty()) {
            return 0.0;
        }
        
        return results.stream()
                .mapToDouble(r -> r.getConfidenceScore() != null ? r.getConfidenceScore() : 0.0)
                .average()
                .orElse(0.0);
    }
}
