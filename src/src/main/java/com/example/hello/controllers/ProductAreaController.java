package com.example.hello.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.hello.model.ProductArea;
import com.example.hello.service.ProductAreaService;
import java.util.List;

@RestController
@RequestMapping("/api/product-areas")
@CrossOrigin(origins = "*")
public class ProductAreaController {
    
    @Autowired
    private ProductAreaService productAreaService;
    
    @GetMapping
    public List<ProductArea> listAll() {
        return productAreaService.listAll();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ProductArea> getById(@PathVariable Long id) {
        return productAreaService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ProductArea create(@RequestBody ProductArea productArea) {
        return productAreaService.create(productArea);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ProductArea> update(@PathVariable Long id, @RequestBody ProductArea productArea) {
        try {
            ProductArea updated = productAreaService.update(id, productArea);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            productAreaService.delete(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
