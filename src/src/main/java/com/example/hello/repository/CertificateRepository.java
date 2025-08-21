package com.example.hello.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.hello.model.Certificate;

public interface CertificateRepository extends JpaRepository<Certificate, Long> {

    List<Certificate> findByApplication_Id(Long applicationId);

    boolean existsByApplication_Id(Long applicationId);
}


