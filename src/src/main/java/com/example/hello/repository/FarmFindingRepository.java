package com.example.hello.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.hello.model.FarmFinding;

public interface FarmFindingRepository extends JpaRepository<FarmFinding, Long> {

	@Query("select f.assignedApg as apg, count(f) as total from FarmFinding f where f.assignedApg is not null group by f.assignedApg")
	List<Object[]> countByAssignedApg();
}


