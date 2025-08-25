package com.example.hello.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.hello.model.Person;
import com.example.hello.repository.PersonRepository;
import java.util.List;
import java.util.Optional;

@Service
public class PersonService {
    
    @Autowired
    private PersonRepository personRepository;
    
    public List<Person> listAll() {
        return personRepository.findAll();
    }
    
    public Optional<Person> findById(Long id) {
        return personRepository.findById(id);
    }
    
    public Optional<Person> findBySid(String sid) {
        return personRepository.findBySid(sid);
    }
    
    public Person create(Person person) {
        return personRepository.save(person);
    }
    
    public Person update(Long id, Person personDetails) {
        return personRepository.findById(id).map(person -> {
            person.setFirstName(personDetails.getFirstName());
            person.setLastName(personDetails.getLastName());
            person.setSid(personDetails.getSid());
            person.setEmail(personDetails.getEmail());
            return personRepository.save(person);
        }).orElseThrow(() -> new IllegalArgumentException("Person not found with ID: " + id));
    }
    
    public void delete(Long id) {
        personRepository.deleteById(id);
    }
}
