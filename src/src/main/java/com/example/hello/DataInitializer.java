package com.example.hello;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Random;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.example.hello.model.Application;
import com.example.hello.model.Certificate;
import com.example.hello.model.FarmFinding;
import com.example.hello.repository.ApplicationRepository;
import com.example.hello.repository.CertificateRepository;
import com.example.hello.repository.FarmFindingRepository;

@Component
public class DataInitializer implements CommandLineRunner {

	private final FarmFindingRepository farmFindingRepository;
	private final ApplicationRepository applicationRepository;
	private final CertificateRepository certificateRepository;

	public DataInitializer(FarmFindingRepository farmFindingRepository, ApplicationRepository applicationRepository, CertificateRepository certificateRepository) {
		this.farmFindingRepository = farmFindingRepository;
		this.applicationRepository = applicationRepository;
		this.certificateRepository = certificateRepository;
	}

	@Override
	@Transactional
	public void run(String... args) {
		// Seed Applications if none exist
		if (applicationRepository.count() == 0) {
			Application app1 = new Application();
			app1.setSealId("APP-00001");
			app1.setName("Customer Portal");
			app1.setPlatform("Web");
			app1.setOwningApg("Relationships");
			app1.setCodeRepository("https://git.example.com/customer-portal");
			app1.setCertificates("customer.example.com; portal.example.com");
			applicationRepository.save(app1);

			Application app2 = new Application();
			app2.setSealId("APP-00002");
			app2.setName("Identity Service");
			app2.setPlatform("Service");
			app2.setOwningApg("Identity");
			app2.setCodeRepository("https://git.example.com/identity-service");
			app2.setCertificates("id.example.com");
			applicationRepository.save(app2);

			Application app3 = new Application();
			app3.setSealId("APP-00003");
			app3.setName("Preferences API");
			app3.setPlatform("Service");
			app3.setOwningApg("Preferences");
			app3.setCodeRepository("https://git.example.com/preferences-api");
			app3.setCertificates("prefs.example.com");
			applicationRepository.save(app3);

			// Seed a couple of certificates for each app
			Certificate c1 = new Certificate();
			c1.setApplication(app1);
			c1.setCn("customer.example.com");
			c1.setSerial("01A3-FFFF-1111");
			c1.setExpirationDate(LocalDate.now().plusDays(200));
			certificateRepository.save(c1);

			Certificate c2 = new Certificate();
			c2.setApplication(app1);
			c2.setCn("portal.example.com");
			c2.setSerial("01A3-FFFF-2222");
			c2.setExpirationDate(LocalDate.now().plusDays(90));
			certificateRepository.save(c2);

			Certificate c3 = new Certificate();
			c3.setApplication(app2);
			c3.setCn("id.example.com");
			c3.setSerial("02B4-FFFF-3333");
			c3.setExpirationDate(LocalDate.now().plusDays(365));
			certificateRepository.save(c3);
		}

		// Backfill certificate entities from each application's certificates string without touching lazy collections
		applicationRepository.findAll().forEach(app -> {
			String raw = app.getCertificates();
			if (raw == null || raw.trim().isEmpty()) return;
			// if the app already has certificate entities, skip using repository existence check
			if (certificateRepository.existsByApplication_Id(app.getId())) return;
			Arrays.stream(raw.split("[;,]"))
				.map(String::trim)
				.filter(s -> !s.isEmpty())
				.forEach(cn -> {
					Certificate c = new Certificate();
					c.setApplication(app);
					c.setCn(cn);
					c.setSerial("");
					c.setExpirationDate(null);
					certificateRepository.save(c);
				});
		});

		long existing = farmFindingRepository.count();
		long target = 50;
		if (existing >= target) {
			return;
		}

		String[] apgs = new String[] { "servicing", "Relationships", "Preferences", "Identity" };
		String[] severities = new String[] { "Low", "Medium", "High", "Critical" };
		String[] criticalities = new String[] { "Low", "Medium", "High", "Critical" };
		Random random = new Random(42);

		for (int i = 0; i < (target - existing); i++) {
			int index = (int) existing + i + 1;
			FarmFinding finding = new FarmFinding();
			String apg = apgs[index % apgs.length];
			String severity = severities[random.nextInt(severities.length)];
			String criticality = criticalities[random.nextInt(criticalities.length)];
			LocalDate targetDate = LocalDate.now().plusDays(15 + random.nextInt(180));

			finding.setDescription("Sample finding #" + index + " for " + apg);
			finding.setApplicationSealId(String.format("APP-%05d", index));
			finding.setSeverity(severity);
			finding.setCriticality(criticality);
			finding.setTargetDate(targetDate);
			finding.setAssignedApg(apg);

			farmFindingRepository.save(finding);
		}
	}
}


