package com.example.hello.service;

import com.example.hello.model.CodeRepository;
import com.example.hello.model.Application;
import com.example.hello.model.Team;
import com.example.hello.repository.CodeRepositoryRepository;
import com.example.hello.repository.ApplicationRepository;
import com.example.hello.repository.TeamRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class CodeRepositoryService {

    private final CodeRepositoryRepository codeRepositoryRepository;
    private final ApplicationRepository applicationRepository;
    private final TeamRepository teamRepository;

    public CodeRepositoryService(CodeRepositoryRepository codeRepositoryRepository, 
                               ApplicationRepository applicationRepository,
                               TeamRepository teamRepository) {
        this.codeRepositoryRepository = codeRepositoryRepository;
        this.applicationRepository = applicationRepository;
        this.teamRepository = teamRepository;
    }

    public List<CodeRepository> getAll() {
        return codeRepositoryRepository.findAll();
    }

    public CodeRepository getById(Long id) {
        return codeRepositoryRepository.findById(id).orElseThrow();
    }

    public Optional<CodeRepository> getByRepositoryUrl(String repositoryUrl) {
        return codeRepositoryRepository.findByRepositoryUrl(repositoryUrl);
    }

    public Optional<CodeRepository> getByProjectId(String projectId) {
        return codeRepositoryRepository.findByProjectId(projectId);
    }

    @Transactional
    public CodeRepository create(CodeRepository codeRepository) {
        return codeRepositoryRepository.save(codeRepository);
    }

    @Transactional
    public CodeRepository update(Long id, CodeRepository updated) {
        CodeRepository existing = getById(id);
        existing.setRepositoryUrl(updated.getRepositoryUrl());
        existing.setProjectId(updated.getProjectId());
        existing.setApplication(updated.getApplication());
        existing.setTeam(updated.getTeam());
        return codeRepositoryRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        codeRepositoryRepository.deleteById(id);
    }

    public byte[] exportToExcel() throws IOException {
        List<CodeRepository> repositories = getAll();
        
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            
            Sheet sheet = workbook.createSheet("Code Repositories");
            
            // Create header row
            Row headerRow = sheet.createRow(0);
            headerRow.createCell(0).setCellValue("Repository URL");
            headerRow.createCell(1).setCellValue("Project ID");
            headerRow.createCell(2).setCellValue("Application Name");
            headerRow.createCell(3).setCellValue("Assigned Team");
            headerRow.createCell(4).setCellValue("Created Date");
            
            // Create data rows
            int rowNum = 1;
            for (CodeRepository repo : repositories) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(repo.getRepositoryUrl());
                row.createCell(1).setCellValue(repo.getProjectId());
                row.createCell(2).setCellValue(repo.getApplication() != null ? repo.getApplication().getName() : "");
                row.createCell(3).setCellValue(repo.getTeam() != null ? repo.getTeam().getName() : "");
                row.createCell(4).setCellValue(repo.getCreatedDate() != null ? repo.getCreatedDate().toString() : "");
            }
            
            // Auto-size columns
            for (int i = 0; i < 5; i++) {
                sheet.autoSizeColumn(i);
            }
            
            workbook.write(out);
            return out.toByteArray();
        }
    }

    @Transactional
    public void importFromExcel(MultipartFile file) throws IOException {
        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                
                String repositoryUrl = getCellValue(row.getCell(0));
                String projectId = getCellValue(row.getCell(1));
                String applicationName = getCellValue(row.getCell(2));
                String teamName = getCellValue(row.getCell(3));
                
                if (repositoryUrl == null || projectId == null) continue;
                
                // Check if repository already exists
                if (codeRepositoryRepository.existsByRepositoryUrl(repositoryUrl) || 
                    codeRepositoryRepository.existsByProjectId(projectId)) {
                    continue; // Skip duplicates
                }
                
                CodeRepository codeRepository = new CodeRepository();
                codeRepository.setRepositoryUrl(repositoryUrl);
                codeRepository.setProjectId(projectId);
                
                // Find application by name
                if (applicationName != null && !applicationName.trim().isEmpty()) {
                    applicationRepository.findByName(applicationName).ifPresent(codeRepository::setApplication);
                }
                
                // Find team by name
                if (teamName != null && !teamName.trim().isEmpty()) {
                    teamRepository.findByName(teamName).ifPresent(codeRepository::setTeam);
                }
                
                codeRepositoryRepository.save(codeRepository);
            }
        }
    }

    private String getCellValue(Cell cell) {
        if (cell == null) return null;
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                return String.valueOf((long) cell.getNumericCellValue());
            default:
                return null;
        }
    }
}
