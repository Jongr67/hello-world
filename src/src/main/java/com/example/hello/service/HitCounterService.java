package com.example.hello.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.hello.model.HitCounter;
import com.example.hello.repository.HitCounterRepository;

@Service
public class HitCounterService {

	private final HitCounterRepository hitCounterRepository;

	public HitCounterService(HitCounterRepository hitCounterRepository) {
		this.hitCounterRepository = hitCounterRepository;
	}

	@Transactional
	public long incrementAndGet() {
		HitCounter counter = hitCounterRepository.findAll()
			.stream()
			.findFirst()
			.orElseGet(() -> hitCounterRepository.save(new HitCounter(0L)));
		long newValue = counter.getCount() + 1L;
		counter.setCount(newValue);
		hitCounterRepository.save(counter);
		return newValue;
	}

	public long getCurrentCount() {
		return hitCounterRepository.findAll()
			.stream()
			.findFirst()
			.map(HitCounter::getCount)
			.orElse(0L);
	}
}


