package com.example.hello.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.hello.model.Role;
import com.example.hello.repository.RoleRepository;
import java.util.List;
import java.util.Optional;

@Service
public class RoleService {
    
    @Autowired
    private RoleRepository roleRepository;
    
    public List<Role> listAll() {
        return roleRepository.findAll();
    }
    
    public Optional<Role> findById(Long id) {
        return roleRepository.findById(id);
    }
    
    public Role create(Role role) {
        return roleRepository.save(role);
    }
    
    public Role update(Long id, Role roleDetails) {
        return roleRepository.findById(id).map(role -> {
            role.setName(roleDetails.getName());
            role.setDescription(roleDetails.getDescription());
            return roleRepository.save(role);
        }).orElseThrow(() -> new IllegalArgumentException("Role not found with ID: " + id));
    }
    
    public void delete(Long id) {
        roleRepository.deleteById(id);
    }
}
