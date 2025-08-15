package com.example.hello;

import org.springframework.data.jpa.repository.JpaRepository;

public interface HitCounterRepository extends JpaRepository<HitCounter, Long> {
}


