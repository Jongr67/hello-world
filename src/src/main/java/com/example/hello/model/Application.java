package com.example.hello.model;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "applications")
public class Application {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	/**
	 * Unique application key used to link FARM findings (matches FarmFinding.applicationSealId)
	 */
	@Column(unique = true, nullable = false)
	private String sealId;

	@Column(nullable = false)
	private String name;

	private String platform;

	private String owningApg;

	private String codeRepository;

	/**
	 * Simple representation of certificates (comma-separated or free text)
	 */
	private String certificates;

	@ManyToOne
	@JoinColumn(name = "product_area_id")
	private ProductArea productArea;

	@OneToMany(mappedBy = "application")
	@JsonManagedReference
	private List<Certificate> certificateEntities = new ArrayList<>();

	public Application() {
	}

	public Long getId() {
		return id;
	}

	public String getSealId() {
		return sealId;
	}

	public void setSealId(String sealId) {
		this.sealId = sealId;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getPlatform() {
		return platform;
	}

	public void setPlatform(String platform) {
		this.platform = platform;
	}

	public String getOwningApg() {
		return owningApg;
	}

	public void setOwningApg(String owningApg) {
		this.owningApg = owningApg;
	}

	public String getCodeRepository() {
		return codeRepository;
	}

	public void setCodeRepository(String codeRepository) {
		this.codeRepository = codeRepository;
	}

	public String getCertificates() {
		return certificates;
	}

	public void setCertificates(String certificates) {
		this.certificates = certificates;
	}

	public ProductArea getProductArea() {
		return productArea;
	}

	public void setProductArea(ProductArea productArea) {
		this.productArea = productArea;
	}

	public List<Certificate> getCertificateEntities() {
		return certificateEntities;
	}

	public void setCertificateEntities(List<Certificate> certificateEntities) {
		this.certificateEntities = certificateEntities;
	}
}



