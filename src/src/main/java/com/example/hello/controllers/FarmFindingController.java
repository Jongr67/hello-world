package com.example.hello.controllers;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.hello.model.FarmFinding;
import com.example.hello.model.ResolverTicket;
import com.example.hello.service.FarmFindingService;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/findings")
public class FarmFindingController {

	private final FarmFindingService service;

	public FarmFindingController(FarmFindingService service) {
		this.service = service;
	}

	@GetMapping
	public List<FarmFinding> listFindings() {
		return service.getAllFindings();
	}

	@GetMapping("/summary/apg")
	public Map<String, Long> summaryByApg() {
		return service.countFindingsByApg();
	}

	@PostMapping
	public FarmFinding createFinding(@RequestBody FarmFinding finding) {
		return service.createFinding(finding);
	}

	@PutMapping("/{id}")
	public FarmFinding updateFinding(@PathVariable Long id, @RequestBody FarmFinding finding) {
		return service.updateFinding(id, finding);
	}

	@DeleteMapping("/{id}")
	public void deleteFinding(@PathVariable Long id) {
		service.deleteFinding(id);
	}

	@GetMapping("/{findingId}/tickets")
	public List<ResolverTicket> listTickets(@PathVariable Long findingId) {
		return service.listTickets(findingId);
	}

	@PostMapping("/{findingId}/tickets")
	public ResolverTicket addTicket(@PathVariable Long findingId, @RequestBody ResolverTicket ticket) {
		return service.addTicket(findingId, ticket);
	}

	@PutMapping("/{findingId}/tickets/{ticketId}")
	public ResolverTicket updateTicket(@PathVariable Long findingId, @PathVariable Long ticketId, @RequestBody ResolverTicket ticket) {
		return service.updateTicket(findingId, ticketId, ticket);
	}

	@DeleteMapping("/{findingId}/tickets/{ticketId}")
	public void deleteTicket(@PathVariable Long findingId, @PathVariable Long ticketId) {
		service.deleteTicket(findingId, ticketId);
	}

	@GetMapping("/export")
	public ResponseEntity<byte[]> exportFindingsExcel() throws Exception {
		List<FarmFinding> findings = service.getAllFindings();
		try (Workbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
			Sheet sheet = wb.createSheet("Findings");
			int r = 0;
			String[] cols = new String[] { "id", "description", "applicationSealId", "severity", "criticality", "targetDate", "assignedApg", "createdDate" };
			Row header = sheet.createRow(r++);
			for (int i = 0; i < cols.length; i++) header.createCell(i).setCellValue(cols[i]);
			for (FarmFinding f : findings) {
				Row row = sheet.createRow(r++);
				int c = 0;
				row.createCell(c++).setCellValue(f.getId() != null ? f.getId() : 0);
				row.createCell(c++).setCellValue(nz(f.getDescription()));
				row.createCell(c++).setCellValue(nz(f.getApplicationSealId()));
				row.createCell(c++).setCellValue(nz(f.getSeverity()));
				row.createCell(c++).setCellValue(nz(f.getCriticality()));
				row.createCell(c++).setCellValue(f.getTargetDate() != null ? f.getTargetDate().toString() : "");
				row.createCell(c++).setCellValue(nz(f.getAssignedApg()));
				row.createCell(c++).setCellValue(f.getCreatedDate() != null ? f.getCreatedDate().toString() : "");
			}
			for (int i = 0; i < cols.length; i++) sheet.autoSizeColumn(i);
			wb.write(out);
			return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=findings.xlsx")
				.contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
				.body(out.toByteArray());
		}
	}

	@PostMapping("/import")
	public Map<String, Object> importFindingsExcel(@RequestParam("file") MultipartFile file) throws Exception {
		int created = 0, updated = 0, skipped = 0;
		try (Workbook wb = new XSSFWorkbook(new ByteArrayInputStream(file.getBytes()))) {
			Sheet sheet = wb.getSheetAt(0);
			boolean headerRow = true;
			for (Row row : sheet) {
				if (headerRow) { headerRow = false; continue; }
				if (row == null) continue;
				Long id = (long) getNumeric(row, 0);
				String description = getString(row, 1);
				String applicationSealId = getString(row, 2);
				String severity = getString(row, 3);
				String criticality = getString(row, 4);
				String targetDateStr = getString(row, 5);
				String assignedApg = getString(row, 6);
				// createdDate is ignored on import (server sets on create)

				FarmFinding finding = null;
				if (id != null && id > 0) finding = service.getAllFindings().stream().filter(f -> f.getId().equals(id)).findFirst().orElse(null);
				if (finding == null) { finding = new FarmFinding(); }

				finding.setDescription(description);
				finding.setApplicationSealId(applicationSealId);
				finding.setSeverity(severity);
				finding.setCriticality(criticality);
				if (targetDateStr != null && !targetDateStr.isBlank()) finding.setTargetDate(LocalDate.parse(targetDateStr));
				finding.setAssignedApg(assignedApg);

				if (finding.getId() == null) { service.createFinding(finding); created++; } else { service.updateFinding(finding.getId(), finding); updated++; }
			}
		}
		Map<String, Object> result = new LinkedHashMap<>();
		result.put("created", created);
		result.put("updated", updated);
		result.put("skipped", skipped);
		return result;
	}

	private static String nz(String s) { return s == null ? "" : s; }
	private static String getString(Row row, int idx) {
		Cell cell = row.getCell(idx);
		if (cell == null) return null;
		if (cell.getCellType() == CellType.STRING) {
			String v = cell.getStringCellValue();
			return (v != null && !v.isBlank()) ? v.trim() : null;
		}
		if (cell.getCellType() == CellType.NUMERIC) {
			return String.valueOf((long) cell.getNumericCellValue());
		}
		return null;
	}
	private static double getNumeric(Row row, int idx) {
		Cell cell = row.getCell(idx);
		if (cell == null) return 0d;
		if (cell.getCellType() == CellType.NUMERIC) return cell.getNumericCellValue();
		if (cell.getCellType() == CellType.STRING) {
			try { return Double.parseDouble(cell.getStringCellValue()); } catch (Exception ignored) { return 0d; }
		}
		return 0d;
	}
}


