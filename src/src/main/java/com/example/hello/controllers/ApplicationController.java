package com.example.hello.controllers;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.hello.model.Application;
import com.example.hello.model.Team;
import com.example.hello.service.ApplicationService;
import com.example.hello.service.TeamService;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/applications")
public class ApplicationController {

	private final ApplicationService applicationService;
	private final TeamService teamService;

	public ApplicationController(ApplicationService applicationService, TeamService teamService) {
		this.applicationService = applicationService;
		this.teamService = teamService;
	}

	@GetMapping
	public List<Application> list() {
		return applicationService.getAll();
	}

	@GetMapping("/{id}")
	public Application get(@PathVariable Long id) {
		return applicationService.getById(id);
	}

	@PostMapping
	public Application create(@RequestBody ApplicationRequest request) {
		Application application = new Application();
		application.setSealId(request.sealId);
		application.setName(request.name);
		application.setPlatform(request.platform);
		application.setCodeRepository(request.codeRepository);
		application.setCertificates(request.certificates);
		
		if (request.teamId != null) {
			Team team = teamService.findById(request.teamId).orElseThrow(() -> new IllegalArgumentException("Team not found with ID: " + request.teamId));
			application.setTeam(team);
		}
		
		return applicationService.create(application);
	}

	@PutMapping("/{id}")
	public Application update(@PathVariable Long id, @RequestBody ApplicationRequest request) {
		Application application = applicationService.getById(id);
		application.setSealId(request.sealId);
		application.setName(request.name);
		application.setPlatform(request.platform);
		application.setCodeRepository(request.codeRepository);
		application.setCertificates(request.certificates);
		
		if (request.teamId != null) {
			Team team = teamService.findById(request.teamId).orElseThrow(() -> new IllegalArgumentException("Team not found with ID: " + request.teamId));
			application.setTeam(team);
		} else {
			application.setTeam(null);
		}
		
		return applicationService.update(id, application);
	}

	public static class ApplicationRequest {
		public String sealId;
		public String name;
		public String platform;
		public String codeRepository;
		public String certificates;
		public Long teamId;
	}

	@DeleteMapping("/{id}")
	public void delete(@PathVariable Long id) {
		applicationService.delete(id);
	}
}




