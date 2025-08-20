package com.example.hello.controllers;

import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.hello.service.HitCounterService;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class HelloController {

	private final HitCounterService hitCounterService;

	public HelloController(HitCounterService hitCounterService) {
		this.hitCounterService = hitCounterService;
	}

	@GetMapping("/hello")
	public String hello() {
		long count = hitCounterService.incrementAndGet();
		return "Hello World (hits=" + count + ")";
	}

	@GetMapping("/api/count")
	public Map<String, Long> count() {
		return Map.of("count", hitCounterService.getCurrentCount());
	}
}


