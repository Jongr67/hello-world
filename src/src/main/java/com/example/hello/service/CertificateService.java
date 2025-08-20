package com.example.hello.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.hello.model.Application;
import com.example.hello.model.Certificate;
import com.example.hello.repository.ApplicationRepository;
import com.example.hello.repository.CertificateRepository;

@Service
public class CertificateService {

	private final CertificateRepository certificateRepository;
	private final ApplicationRepository applicationRepository;

	public CertificateService(CertificateRepository certificateRepository, ApplicationRepository applicationRepository) {
		this.certificateRepository = certificateRepository;
		this.applicationRepository = applicationRepository;
	}

	public List<Certificate> listAll() {
		return certificateRepository.findAll();
	}

	public List<Certificate> listByApplication(Long applicationId) {
		return certificateRepository.findByApplicationId(applicationId);
	}

	public Certificate getById(Long id) {
		return certificateRepository.findById(id).orElseThrow();
	}

	@Transactional
	public Certificate createForApplication(Long applicationId, Certificate certificate) {
		Application application = applicationRepository.findById(applicationId).orElseThrow();
		certificate.setApplication(application);
		return certificateRepository.save(certificate);
	}

	@Transactional
	public Certificate update(Long id, Certificate updated) {
		Certificate existing = getById(id);
		existing.setCn(updated.getCn());
		existing.setSerial(updated.getSerial());
		existing.setExpirationDate(updated.getExpirationDate());
		return certificateRepository.save(existing);
	}

	@Transactional
	public void delete(Long id) {
		certificateRepository.deleteById(id);
	}
}



