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
import com.example.hello.model.ProductArea;
import com.example.hello.model.Team;
import com.example.hello.model.Person;
import com.example.hello.model.Role;
import com.example.hello.repository.ApplicationRepository;
import com.example.hello.repository.CertificateRepository;
import com.example.hello.repository.FarmFindingRepository;
import com.example.hello.repository.ProductAreaRepository;
import com.example.hello.repository.TeamRepository;
import com.example.hello.repository.PersonRepository;
import com.example.hello.repository.RoleRepository;

@Component
public class DataInitializer implements CommandLineRunner {

	private final FarmFindingRepository farmFindingRepository;
	private final ApplicationRepository applicationRepository;
	private final CertificateRepository certificateRepository;
	private final ProductAreaRepository productAreaRepository;
	private final TeamRepository teamRepository;
	private final PersonRepository personRepository;
	private final RoleRepository roleRepository;

	public DataInitializer(FarmFindingRepository farmFindingRepository, ApplicationRepository applicationRepository, CertificateRepository certificateRepository, ProductAreaRepository productAreaRepository, TeamRepository teamRepository, PersonRepository personRepository, RoleRepository roleRepository) {
		this.farmFindingRepository = farmFindingRepository;
		this.applicationRepository = applicationRepository;
		this.certificateRepository = certificateRepository;
		this.productAreaRepository = productAreaRepository;
		this.teamRepository = teamRepository;
		this.personRepository = personRepository;
		this.roleRepository = roleRepository;
	}

	@Override
	@Transactional
	public void run(String... args) {
		// Seed Product Areas if none exist
		if (productAreaRepository.count() == 0) {
			ProductArea pa1 = new ProductArea();
			pa1.setName("Customer Experience");
			pa1.setDescription("Customer-facing applications and services");
			productAreaRepository.save(pa1);

			ProductArea pa2 = new ProductArea();
			pa2.setName("Identity & Security");
			pa2.setDescription("Identity management and security services");
			productAreaRepository.save(pa2);

			ProductArea pa3 = new ProductArea();
			pa3.setName("Data & Analytics");
			pa3.setDescription("Data processing and analytics services");
			productAreaRepository.save(pa3);
		}

		// Seed Roles if none exist
		if (roleRepository.count() == 0) {
			Role role1 = new Role();
			role1.setName("AO");
			role1.setDescription("Application Owner");
			roleRepository.save(role1);

			Role role2 = new Role();
			role2.setName("AO Delegate");
			role2.setDescription("Application Owner Delegate");
			roleRepository.save(role2);

			Role role3 = new Role();
			role3.setName("Developer");
			role3.setDescription("Software Developer");
			roleRepository.save(role3);

			Role role4 = new Role();
			role4.setName("Product Owner");
			role4.setDescription("Product Owner");
			roleRepository.save(role4);
		}

		// Seed Teams if none exist
		if (teamRepository.count() == 0) {
			ProductArea customerExp = productAreaRepository.findByName("Customer Experience").orElse(null);
			ProductArea identity = productAreaRepository.findByName("Identity & Security").orElse(null);
			ProductArea data = productAreaRepository.findByName("Data & Analytics").orElse(null);

			if (customerExp != null) {
				Team team1 = new Team();
				team1.setName("Customer Portal Team");
				team1.setDescription("Team responsible for customer portal development");
				team1.setProductArea(customerExp);
				teamRepository.save(team1);

				Team team2 = new Team();
				team2.setName("Preferences Team");
				team2.setDescription("Team responsible for user preferences");
				team2.setProductArea(customerExp);
				teamRepository.save(team2);
			}

			if (identity != null) {
				Team team3 = new Team();
				team3.setName("Identity Service Team");
				team3.setDescription("Team responsible for identity management");
				team3.setProductArea(identity);
				teamRepository.save(team3);
			}
		}

		// Seed Persons if none exist
		if (personRepository.count() == 0) {
			Person person1 = new Person();
			person1.setFirstName("John");
			person1.setLastName("Smith");
			person1.setSid("JSMITH");
			person1.setEmail("john.smith@example.com");
			personRepository.save(person1);

			Person person2 = new Person();
			person2.setFirstName("Jane");
			person2.setLastName("Doe");
			person2.setSid("JDOE");
			person2.setEmail("jane.doe@example.com");
			personRepository.save(person2);

			Person person3 = new Person();
			person3.setFirstName("Bob");
			person3.setLastName("Johnson");
			person3.setSid("BJOHNSON");
			person3.setEmail("bob.johnson@example.com");
			personRepository.save(person3);
		}

		// Seed Applications if none exist
		if (applicationRepository.count() == 0) {
			ProductArea customerExp = productAreaRepository.findByName("Customer Experience").orElse(null);
			ProductArea identity = productAreaRepository.findByName("Identity & Security").orElse(null);

			Application app1 = new Application();
			app1.setSealId("APP-00001");
			app1.setName("Customer Portal");
			app1.setPlatform("Web");
			app1.setOwningApg("Relationships");
			app1.setCodeRepository("https://git.example.com/customer-portal");
			app1.setCertificates("customer.example.com; portal.example.com");
			app1.setProductArea(customerExp);
			applicationRepository.save(app1);

			Application app2 = new Application();
			app2.setSealId("APP-00002");
			app2.setName("Identity Service");
			app2.setPlatform("Service");
			app2.setOwningApg("Identity");
			app2.setCodeRepository("https://git.example.com/identity-service");
			app2.setCertificates("id.example.com");
			app2.setProductArea(identity);
			applicationRepository.save(app2);

			Application app3 = new Application();
			app3.setSealId("APP-00003");
			app3.setName("Preferences API");
			app3.setPlatform("Service");
			app3.setOwningApg("Preferences");
			app3.setCodeRepository("https://git.example.com/preferences-api");
			app3.setCertificates("prefs.example.com");
			app3.setProductArea(customerExp);
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


