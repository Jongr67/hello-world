package com.example.hello.model;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Transient;

@Entity
public class Certificate {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	/** Common Name (CN) */
	private String cn;

	private String serial;

	private LocalDate expirationDate;

	@ManyToOne
	@JsonBackReference
	private Application application;

	// Holds application id from JSON input when application entity is not initialized
	@Transient
	private Long applicationIdShadow;

	public Certificate() {
	}

	public Long getId() {
		return id;
	}

	public String getCn() {
		return cn;
	}

	public void setCn(String cn) {
		this.cn = cn;
	}

	public String getSerial() {
		return serial;
	}

	public void setSerial(String serial) {
		this.serial = serial;
	}

	public LocalDate getExpirationDate() {
		return expirationDate;
	}

	public void setExpirationDate(LocalDate expirationDate) {
		this.expirationDate = expirationDate;
	}

	public Application getApplication() {
		return application;
	}

	public void setApplication(Application application) {
		this.application = application;
	}

	@Transient
	@JsonProperty("applicationId")
	public Long getApplicationId() {
		return application != null ? application.getId() : applicationIdShadow;
	}

	@Transient
	@JsonProperty("applicationId")
	public void setApplicationId(Long applicationId) {
		this.applicationIdShadow = applicationId;
	}
}




