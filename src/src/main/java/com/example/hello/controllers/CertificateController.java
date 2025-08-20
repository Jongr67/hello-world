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

import com.example.hello.model.Certificate;
import com.example.hello.service.CertificateService;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/certificates")
public class CertificateController {

	private final CertificateService certificateService;

	public CertificateController(CertificateService certificateService) {
		this.certificateService = certificateService;
	}

	@GetMapping
	public List<Certificate> listAll() {
		return certificateService.listAll();
	}

	@GetMapping("/application/{applicationId}")
	public List<Certificate> listByApplication(@PathVariable Long applicationId) {
		return certificateService.listByApplication(applicationId);
	}

	@PostMapping("/application/{applicationId}")
	public Certificate create(@PathVariable Long applicationId, @RequestBody Certificate certificate) {
		return certificateService.createForApplication(applicationId, certificate);
	}

	@PutMapping("/{id}")
	public Certificate update(@PathVariable Long id, @RequestBody Certificate certificate) {
		return certificateService.update(id, certificate);
	}

	@DeleteMapping("/{id}")
	public void delete(@PathVariable Long id) {
		certificateService.delete(id);
	}
}



