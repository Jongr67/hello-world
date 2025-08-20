package com.example.hello.controllers;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.hello.repository.FarmFindingRepository;
import com.example.hello.repository.ResolverTicketRepository;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/tickets")
public class ResolverTicketController {

	private final ResolverTicketRepository resolverTicketRepository;
	private final FarmFindingRepository farmFindingRepository;

	public ResolverTicketController(ResolverTicketRepository resolverTicketRepository, FarmFindingRepository farmFindingRepository) {
		this.resolverTicketRepository = resolverTicketRepository;
		this.farmFindingRepository = farmFindingRepository;
	}

	@GetMapping
	public List<Map<String, Object>> listAllTickets() {
		return resolverTicketRepository.findAll()
			.stream()
			.map(t -> {
				Long findingId = t.getFinding() != null ? t.getFinding().getId() : null;
				String applicationSealId = null;
				if (findingId != null) {
					applicationSealId = farmFindingRepository.findById(findingId)
						.map(f -> f.getApplicationSealId())
						.orElse(null);
				}
				Map<String, Object> row = new LinkedHashMap<>();
				row.put("id", t.getId());
				row.put("jiraKey", t.getJiraKey());
				row.put("jiraUrl", t.getJiraUrl());
				row.put("apg", t.getApg());
				row.put("status", t.getStatus());
				row.put("findingId", findingId);
				row.put("applicationSealId", applicationSealId);
				return row;
			})
			.collect(Collectors.toList());
	}
}



