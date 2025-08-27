package com.example.hello.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.hello.model.Application;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

	Optional<Application> findBySealId(String sealId);

	boolean existsBySealId(String sealId);
	
	Optional<Application> findByName(String name);
}




