package com.example.hello.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.hello.model.ProductArea;
import java.util.Optional;

public interface ProductAreaRepository extends JpaRepository<ProductArea, Long> {
    Optional<ProductArea> findByName(String name);
}
