package com.example.hello.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.hello.model.ResolverTicket;

public interface ResolverTicketRepository extends JpaRepository<ResolverTicket, Long> {

	List<ResolverTicket> findByFindingId(Long findingId);
}


