package com.agenticapp.repository.mongo;

import com.agenticapp.model.KnowledgeBase;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface KnowledgeBaseRepository extends MongoRepository<KnowledgeBase, String> {
    
    /**
     * Find by title containing text (case-insensitive)
     */
    List<KnowledgeBase> findByTitleContainingIgnoreCase(String title);
    
    /**
     * Find by content containing text (case-insensitive)
     */
    List<KnowledgeBase> findByContentContainingIgnoreCase(String content);
    
    /**
     * Find by category
     */
    List<KnowledgeBase> findByCategory(String category);
    
    /**
     * Find by tags containing any of the specified tags
     */
    List<KnowledgeBase> findByTagsIn(List<String> tags);
    
    /**
     * Find by source
     */
    List<KnowledgeBase> findBySource(String source);
    
    /**
     * Find by author
     */
    List<KnowledgeBase> findByAuthor(String author);
    
    /**
     * Find by language
     */
    List<KnowledgeBase> findByLanguage(String language);
    
    /**
     * Find by format
     */
    List<KnowledgeBase> findByFormat(String format);
    
    /**
     * Find verified knowledge entries
     */
    List<KnowledgeBase> findByIsVerifiedTrue();
    
    /**
     * Find by confidence score above threshold
     */
    List<KnowledgeBase> findByConfidenceScoreGreaterThan(Double minScore);
    
    /**
     * Find by creation date range
     */
    List<KnowledgeBase> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Find by update date range
     */
    List<KnowledgeBase> findByUpdatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Find by related topics
     */
    List<KnowledgeBase> findByRelatedTopicsIn(List<String> topics);
    
    /**
     * Full-text search across title, content, and summary
     */
    @Query("{ '$text': { '$search': ?0 } }")
    List<KnowledgeBase> fullTextSearch(String searchTerm);
    
    /**
     * Semantic search using vector similarity (if implemented)
     */
    @Query("{ 'embedding': { '$near': ?0 } }")
    List<KnowledgeBase> semanticSearch(List<Double> embedding);
    
    /**
     * Find by multiple criteria
     */
    @Query("{ 'category': ?0, 'tags': { '$in': ?1 }, 'isVerified': true }")
    List<KnowledgeBase> findByCategoryAndTagsAndVerified(String category, List<String> tags);
    
    /**
     * Find recent knowledge entries
     */
    List<KnowledgeBase> findTop10ByOrderByCreatedAtDesc();
    
    /**
     * Find by content length range
     */
    List<KnowledgeBase> findByContentLengthBetween(Long minLength, Long maxLength);
    
    /**
     * Find by source URL
     */
    Optional<KnowledgeBase> findBySourceUrl(String sourceUrl);
    
    /**
     * Count by category
     */
    long countByCategory(String category);
    
    /**
     * Count by source
     */
    long countBySource(String source);
    
    /**
     * Find by version
     */
    List<KnowledgeBase> findByVersion(String version);
}
