package com.example.hello.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.hello.model.HitCounter;

public interface HitCounterRepository extends JpaRepository<HitCounter, Long> {
}


