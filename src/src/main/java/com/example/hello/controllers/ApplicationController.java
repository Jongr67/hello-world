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
import com.example.hello.service.ApplicationService;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/applications")
public class ApplicationController {

	private final ApplicationService applicationService;

	public ApplicationController(ApplicationService applicationService) {
		this.applicationService = applicationService;
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
	public Application create(@RequestBody Application application) {
		return applicationService.create(application);
	}

	@PutMapping("/{id}")
	public Application update(@PathVariable Long id, @RequestBody Application application) {
		return applicationService.update(id, application);
	}

	@DeleteMapping("/{id}")
	public void delete(@PathVariable Long id) {
		applicationService.delete(id);
	}
}




