package com.example.hello.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;

@Entity
public class FarmFinding {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String description;

	private String applicationSealId;

	private String severity;

	private String criticality;

	private LocalDate targetDate;

	// Single owning APG for the finding (for charting and assignment)
	private String assignedApg;

	@OneToMany(mappedBy = "finding", cascade = CascadeType.ALL, orphanRemoval = true)
	@JsonManagedReference
	private List<ResolverTicket> resolverTickets = new ArrayList<>();

	public FarmFinding() {
	}

	public Long getId() {
		return id;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getApplicationSealId() {
		return applicationSealId;
	}

	public void setApplicationSealId(String applicationSealId) {
		this.applicationSealId = applicationSealId;
	}

	public String getSeverity() {
		return severity;
	}

	public void setSeverity(String severity) {
		this.severity = severity;
	}

	public String getCriticality() {
		return criticality;
	}

	public void setCriticality(String criticality) {
		this.criticality = criticality;
	}

	public LocalDate getTargetDate() {
		return targetDate;
	}

	public void setTargetDate(LocalDate targetDate) {
		this.targetDate = targetDate;
	}

	public String getAssignedApg() {
		return assignedApg;
	}

	public void setAssignedApg(String assignedApg) {
		this.assignedApg = assignedApg;
	}

	public List<ResolverTicket> getResolverTickets() {
		return resolverTickets;
	}

	public void setResolverTickets(List<ResolverTicket> resolverTickets) {
		this.resolverTickets = resolverTickets;
	}

	public void addResolverTicket(ResolverTicket ticket) {
		ticket.setFinding(this);
		this.resolverTickets.add(ticket);
	}

	public void removeResolverTicket(ResolverTicket ticket) {
		ticket.setFinding(null);
		this.resolverTickets.remove(ticket);
	}
}


