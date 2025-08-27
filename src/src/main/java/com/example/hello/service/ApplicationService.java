package com.example.hello.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.hello.model.Application;
import com.example.hello.model.Team;
import com.example.hello.repository.ApplicationRepository;
import com.example.hello.repository.TeamRepository;

@Service
public class ApplicationService {

	private final ApplicationRepository applicationRepository;
	private final TeamRepository teamRepository;

	public ApplicationService(ApplicationRepository applicationRepository, TeamRepository teamRepository) {
		this.applicationRepository = applicationRepository;
		this.teamRepository = teamRepository;
	}

	public List<Application> getAll() {
		return applicationRepository.findAll();
	}

	public Application getById(Long id) {
		return applicationRepository.findById(id).orElseThrow();
	}

	public Application getBySealId(String sealId) {
		return applicationRepository.findBySealId(sealId).orElseThrow();
	}

	@Transactional
	public Application create(Application application) {
		return applicationRepository.save(application);
	}

	@Transactional
	public Application update(Long id, Application updated) {
		Application existing = getById(id);
		existing.setSealId(updated.getSealId());
		existing.setName(updated.getName());
		existing.setPlatform(updated.getPlatform());
		existing.setTeam(updated.getTeam());
		existing.setCodeRepository(updated.getCodeRepository());
		existing.setCertificates(updated.getCertificates());
		return applicationRepository.save(existing);
	}

	@Transactional
	public void delete(Long id) {
		applicationRepository.deleteById(id);
	}
}




