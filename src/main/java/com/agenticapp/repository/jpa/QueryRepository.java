package com.agenticapp.repository.jpa;

import com.agenticapp.model.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QueryRepository extends JpaRepository<Query, UUID> {
    
    /**
     * Find queries by status
     */
    List<Query> findByStatus(Query.QueryStatus status);
    
    /**
     * Find queries by type
     */
    List<Query> findByQueryType(Query.QueryType queryType);
    
    /**
     * Find queries by user ID, ordered by creation date
     */
    List<Query> findByUserIdOrderByCreatedAtDesc(String userId);
    
    /**
     * Find queries created within a date range
     */
    List<Query> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Find queries with high confidence scores
     */
    List<Query> findByConfidenceScoreGreaterThan(Integer minScore);
    
    /**
     * Find queries by text content (partial match)
     */
    @org.springframework.data.jpa.repository.Query("SELECT q FROM Query q WHERE LOWER(q.queryText) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Query> findByQueryTextContainingIgnoreCase(@Param("searchTerm") String searchTerm);
    
    /**
     * Find queries by exact text match
     */
    Optional<Query> findByQueryText(String queryText);
    
    /**
     * Count queries by status
     */
    long countByStatus(Query.QueryStatus status);
    
    /**
     * Find failed queries
     */
    List<Query> findByStatusOrderByCreatedAtDesc(Query.QueryStatus status);
    
    /**
     * Find queries that need evaluation
     */
    @org.springframework.data.jpa.repository.Query("SELECT q FROM Query q WHERE q.status = 'COMPLETED' AND q.confidenceScore IS NULL")
    List<Query> findQueriesNeedingEvaluation();
    
    /**
     * Find queries by user feedback rating
     */
    List<Query> findByUserFeedbackIsNotNullAndConfidenceScore(Integer rating);
}
