package com.agenticapp.repository.jpa;

import com.agenticapp.model.QueryResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface QueryResultRepository extends JpaRepository<QueryResult, UUID> {
    
    /**
     * Find results by query ID
     */
    List<QueryResult> findByQueryId(UUID queryId);
    
    /**
     * Find results by source
     */
    List<QueryResult> findBySource(QueryResult.ResultSource source);
    
    /**
     * Find results by status
     */
    List<QueryResult> findByStatus(QueryResult.ResultStatus status);
    
    /**
     * Find results with high confidence scores
     */
    List<QueryResult> findByConfidenceScoreGreaterThan(Double minScore);
    
    /**
     * Find results with high relevance scores
     */
    List<QueryResult> findByRelevanceScoreGreaterThan(Double minScore);
    
    /**
     * Find results by source and status
     */
    List<QueryResult> findBySourceAndStatus(QueryResult.ResultSource source, QueryResult.ResultStatus status);
    
    /**
     * Find results retrieved within a date range
     */
    List<QueryResult> findByRetrievedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Find results that need evaluation
     */
    @org.springframework.data.jpa.repository.Query("SELECT qr FROM QueryResult qr WHERE qr.status = 'RETRIEVED' AND qr.confidenceScore IS NULL")
    List<QueryResult> findResultsNeedingEvaluation();
    
    /**
     * Find verified results
     */
    List<QueryResult> findByIsVerifiedTrue();
    
    /**
     * Find results by query ID and source
     */
    List<QueryResult> findByQueryIdAndSource(UUID queryId, QueryResult.ResultSource source);
    
    /**
     * Count results by source
     */
    long countBySource(QueryResult.ResultSource source);
    
    /**
     * Find results with evaluation notes
     */
    List<QueryResult> findByEvaluationNotesIsNotNull();
    
    /**
     * Find results by content containing specific text
     */
    @org.springframework.data.jpa.repository.Query("SELECT qr FROM QueryResult qr WHERE LOWER(qr.content) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<QueryResult> findByContentContainingIgnoreCase(@Param("searchTerm") String searchTerm);
    
    /**
     * Find results that have been evaluated but not verified
     */
    @org.springframework.data.jpa.repository.Query("SELECT qr FROM QueryResult qr WHERE qr.status = 'EVALUATED' AND qr.isVerified = false")
    List<QueryResult> findEvaluatedButNotVerified();
}
