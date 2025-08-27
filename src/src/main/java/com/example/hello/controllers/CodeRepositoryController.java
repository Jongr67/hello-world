package com.example.hello.controllers;

import com.example.hello.model.CodeRepository;
import com.example.hello.model.Application;
import com.example.hello.model.Team;
import com.example.hello.service.CodeRepositoryService;
import com.example.hello.service.ApplicationService;
import com.example.hello.service.TeamService;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/code-repositories")
public class CodeRepositoryController {

    private final CodeRepositoryService codeRepositoryService;
    private final ApplicationService applicationService;
    private final TeamService teamService;

    public CodeRepositoryController(CodeRepositoryService codeRepositoryService,
                                  ApplicationService applicationService,
                                  TeamService teamService) {
        this.codeRepositoryService = codeRepositoryService;
        this.applicationService = applicationService;
        this.teamService = teamService;
    }

    @GetMapping
    public List<CodeRepository> list() {
        return codeRepositoryService.getAll();
    }

    @GetMapping("/{id}")
    public CodeRepository get(@PathVariable Long id) {
        return codeRepositoryService.getById(id);
    }

    @PostMapping
    public CodeRepository create(@RequestBody CodeRepositoryRequest request) {
        CodeRepository codeRepository = new CodeRepository();
        codeRepository.setRepositoryUrl(request.repositoryUrl);
        codeRepository.setProjectId(request.projectId);
        
        if (request.applicationId != null) {
            Application application = applicationService.getById(request.applicationId);
            codeRepository.setApplication(application);
        }
        
        if (request.teamId != null) {
            Team team = teamService.findById(request.teamId).orElseThrow(() -> 
                new IllegalArgumentException("Team not found with ID: " + request.teamId));
            codeRepository.setTeam(team);
        }
        
        return codeRepositoryService.create(codeRepository);
    }

    @PutMapping("/{id}")
    public CodeRepository update(@PathVariable Long id, @RequestBody CodeRepositoryRequest request) {
        CodeRepository codeRepository = codeRepositoryService.getById(id);
        codeRepository.setRepositoryUrl(request.repositoryUrl);
        codeRepository.setProjectId(request.projectId);
        
        if (request.applicationId != null) {
            Application application = applicationService.getById(request.applicationId);
            codeRepository.setApplication(application);
        } else {
            codeRepository.setApplication(null);
        }
        
        if (request.teamId != null) {
            Team team = teamService.findById(request.teamId).orElseThrow(() -> 
                new IllegalArgumentException("Team not found with ID: " + request.teamId));
            codeRepository.setTeam(team);
        } else {
            codeRepository.setTeam(null);
        }
        
        return codeRepositoryService.update(id, codeRepository);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        codeRepositoryService.delete(id);
    }

    @GetMapping("/export")
    public ResponseEntity<ByteArrayResource> exportToExcel() throws IOException {
        byte[] data = codeRepositoryService.exportToExcel();
        ByteArrayResource resource = new ByteArrayResource(data);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=code-repositories.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .contentLength(data.length)
                .body(resource);
    }

    @PostMapping("/import")
    public ResponseEntity<String> importFromExcel(@RequestParam("file") MultipartFile file) {
        try {
            codeRepositoryService.importFromExcel(file);
            return ResponseEntity.ok("Import completed successfully");
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Import failed: " + e.getMessage());
        }
    }

    public static class CodeRepositoryRequest {
        public String repositoryUrl;
        public String projectId;
        public Long applicationId;
        public Long teamId;
    }
}
