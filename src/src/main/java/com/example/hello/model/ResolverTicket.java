package com.example.hello.model;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class ResolverTicket {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String jiraKey;

	private String jiraUrl;

	private String apg; // Area Product Group owner of this resolver ticket

	private String status; // Jira status (e.g., To Do, In Progress, Done)

	@ManyToOne
	@JsonBackReference
	private FarmFinding finding;

	public ResolverTicket() {
	}

	public Long getId() {
		return id;
	}

	public String getJiraKey() {
		return jiraKey;
	}

	public void setJiraKey(String jiraKey) {
		this.jiraKey = jiraKey;
	}

	public String getJiraUrl() {
		return jiraUrl;
	}

	public void setJiraUrl(String jiraUrl) {
		this.jiraUrl = jiraUrl;
	}

	public String getApg() {
		return apg;
	}

	public void setApg(String apg) {
		this.apg = apg;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public FarmFinding getFinding() {
		return finding;
	}

	public void setFinding(FarmFinding finding) {
		this.finding = finding;
	}
}


