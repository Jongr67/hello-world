package com.example.hello.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.hello.model.Role;

public interface RoleRepository extends JpaRepository<Role, Long> {
}
