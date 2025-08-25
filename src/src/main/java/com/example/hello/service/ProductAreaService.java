package com.example.hello.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.hello.model.ProductArea;
import com.example.hello.repository.ProductAreaRepository;
import java.util.List;
import java.util.Optional;

@Service
public class ProductAreaService {
    
    @Autowired
    private ProductAreaRepository productAreaRepository;
    
    public List<ProductArea> listAll() {
        return productAreaRepository.findAll();
    }
    
    public Optional<ProductArea> findById(Long id) {
        return productAreaRepository.findById(id);
    }
    
    public ProductArea create(ProductArea productArea) {
        return productAreaRepository.save(productArea);
    }
    
    public ProductArea update(Long id, ProductArea productAreaDetails) {
        return productAreaRepository.findById(id).map(productArea -> {
            productArea.setName(productAreaDetails.getName());
            productArea.setDescription(productAreaDetails.getDescription());
            return productAreaRepository.save(productArea);
        }).orElseThrow(() -> new IllegalArgumentException("ProductArea not found with ID: " + id));
    }
    
    public void delete(Long id) {
        productAreaRepository.deleteById(id);
    }
}
