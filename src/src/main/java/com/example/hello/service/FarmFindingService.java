package com.example.hello.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.hello.model.FarmFinding;
import com.example.hello.model.ResolverTicket;
import com.example.hello.repository.FarmFindingRepository;
import com.example.hello.repository.ResolverTicketRepository;

@Service
public class FarmFindingService {

	private final FarmFindingRepository farmFindingRepository;
	private final ResolverTicketRepository resolverTicketRepository;

	public FarmFindingService(FarmFindingRepository farmFindingRepository, ResolverTicketRepository resolverTicketRepository) {
		this.farmFindingRepository = farmFindingRepository;
		this.resolverTicketRepository = resolverTicketRepository;
	}

	public List<FarmFinding> getAllFindings() {
		return farmFindingRepository.findAll();
	}

	public FarmFinding getFinding(Long id) {
		return farmFindingRepository.findById(id).orElseThrow();
	}

	@Transactional
	public FarmFinding createFinding(FarmFinding finding) {
		return farmFindingRepository.save(finding);
	}

	@Transactional
	public FarmFinding updateFinding(Long id, FarmFinding updated) {
		FarmFinding existing = getFinding(id);
		existing.setDescription(updated.getDescription());
		existing.setApplicationSealId(updated.getApplicationSealId());
		existing.setSeverity(updated.getSeverity());
		existing.setCriticality(updated.getCriticality());
		existing.setTargetDate(updated.getTargetDate());
		existing.setAssignedApg(updated.getAssignedApg());
		return farmFindingRepository.save(existing);
	}

	@Transactional
	public void deleteFinding(Long id) {
		farmFindingRepository.deleteById(id);
	}

	public List<ResolverTicket> listTickets(Long findingId) {
		return resolverTicketRepository.findByFindingId(findingId);
	}

	@Transactional
	public ResolverTicket addTicket(Long findingId, ResolverTicket ticket) {
		FarmFinding finding = getFinding(findingId);
		ticket.setFinding(finding);
		return resolverTicketRepository.save(ticket);
	}

	@Transactional
	public ResolverTicket updateTicket(Long findingId, Long ticketId, ResolverTicket updated) {
		ResolverTicket existing = resolverTicketRepository.findById(ticketId).orElseThrow();
		if (existing.getFinding() == null || !existing.getFinding().getId().equals(findingId)) {
			throw new IllegalArgumentException("Ticket does not belong to the specified finding");
		}
		existing.setJiraKey(updated.getJiraKey());
		existing.setJiraUrl(updated.getJiraUrl());
		existing.setApg(updated.getApg());
		existing.setStatus(updated.getStatus());
		return resolverTicketRepository.save(existing);
	}

	@Transactional
	public void deleteTicket(Long findingId, Long ticketId) {
		ResolverTicket existing = resolverTicketRepository.findById(ticketId).orElseThrow();
		if (existing.getFinding() == null || !existing.getFinding().getId().equals(findingId)) {
			throw new IllegalArgumentException("Ticket does not belong to the specified finding");
		}
		resolverTicketRepository.delete(existing);
	}

	public Map<String, Long> countFindingsByApg() {
		return farmFindingRepository.countByAssignedApg()
			.stream()
			.collect(Collectors.toMap(
				row -> (String) row[0],
				row -> (Long) row[1]
			));
	}
}


