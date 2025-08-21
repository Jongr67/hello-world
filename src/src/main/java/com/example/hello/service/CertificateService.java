package com.example.hello.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.hello.model.Application;
import com.example.hello.model.Certificate;
import com.example.hello.repository.ApplicationRepository;
import com.example.hello.repository.CertificateRepository;

@Service
@Transactional
public class CertificateService {

    private final CertificateRepository certificateRepository;
    private final ApplicationRepository applicationRepository;

    public CertificateService(CertificateRepository certificateRepository, ApplicationRepository applicationRepository) {
        this.certificateRepository = certificateRepository;
        this.applicationRepository = applicationRepository;
    }

    @Transactional(readOnly = true)
    public List<Certificate> listAll() {
        return certificateRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Certificate> listByApplication(Long applicationId) {
        return certificateRepository.findByApplication_Id(applicationId);
    }

    public Certificate createForApplication(Long applicationId, Certificate certificate) {
        Application application = applicationRepository.findById(applicationId)
            .orElseThrow(() -> new IllegalArgumentException("Application not found: " + applicationId));
        certificate.setApplication(application);
        return certificateRepository.save(certificate);
    }

    public Certificate update(Long id, Certificate updated) {
        Certificate existing = certificateRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Certificate not found: " + id));
        existing.setCn(updated.getCn());
        existing.setSerial(updated.getSerial());
        existing.setExpirationDate(updated.getExpirationDate());
        // allow changing the associated application if applicationId is provided
        if (updated.getApplicationId() != null) {
            Application application = applicationRepository.findById(updated.getApplicationId())
                .orElseThrow(() -> new IllegalArgumentException("Application not found: " + updated.getApplicationId()));
            existing.setApplication(application);
        }
        return certificateRepository.save(existing);
    }

    public void delete(Long id) {
        certificateRepository.deleteById(id);
    }
}


