package com.example.hello.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.hello.model.FarmFinding;
import com.example.hello.model.ResolverTicket;
import com.example.hello.service.FarmFindingService;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/findings")
public class FarmFindingController {

	private final FarmFindingService service;

	public FarmFindingController(FarmFindingService service) {
		this.service = service;
	}

	@GetMapping
	public List<FarmFinding> listFindings() {
		return service.getAllFindings();
	}

	@GetMapping("/summary/apg")
	public Map<String, Long> summaryByApg() {
		return service.countFindingsByApg();
	}

	@PostMapping
	public FarmFinding createFinding(@RequestBody FarmFinding finding) {
		return service.createFinding(finding);
	}

	@PutMapping("/{id}")
	public FarmFinding updateFinding(@PathVariable Long id, @RequestBody FarmFinding finding) {
		return service.updateFinding(id, finding);
	}

	@DeleteMapping("/{id}")
	public void deleteFinding(@PathVariable Long id) {
		service.deleteFinding(id);
	}

	@GetMapping("/{findingId}/tickets")
	public List<ResolverTicket> listTickets(@PathVariable Long findingId) {
		return service.listTickets(findingId);
	}

	@PostMapping("/{findingId}/tickets")
	public ResolverTicket addTicket(@PathVariable Long findingId, @RequestBody ResolverTicket ticket) {
		return service.addTicket(findingId, ticket);
	}

	@PutMapping("/{findingId}/tickets/{ticketId}")
	public ResolverTicket updateTicket(@PathVariable Long findingId, @PathVariable Long ticketId, @RequestBody ResolverTicket ticket) {
		return service.updateTicket(findingId, ticketId, ticket);
	}

	@DeleteMapping("/{findingId}/tickets/{ticketId}")
	public void deleteTicket(@PathVariable Long findingId, @PathVariable Long ticketId) {
		service.deleteTicket(findingId, ticketId);
	}
}


