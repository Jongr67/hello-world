package com.example.hello.controllers;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.hello.model.FarmFinding;
import com.example.hello.model.ResolverTicket;
import com.example.hello.repository.FarmFindingRepository;
import com.example.hello.repository.ResolverTicketRepository;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/tickets")
public class ResolverTicketController {

	private final ResolverTicketRepository resolverTicketRepository;
	private final FarmFindingRepository farmFindingRepository;

	public ResolverTicketController(ResolverTicketRepository resolverTicketRepository, FarmFindingRepository farmFindingRepository) {
		this.resolverTicketRepository = resolverTicketRepository;
		this.farmFindingRepository = farmFindingRepository;
	}

	@GetMapping
	public List<Map<String, Object>> listAllTickets() {
		return resolverTicketRepository.findAll()
			.stream()
			.map(t -> {
				Long findingId = t.getFinding() != null ? t.getFinding().getId() : null;
				String applicationSealId = null;
				if (findingId != null) {
					applicationSealId = farmFindingRepository.findById(findingId)
						.map(f -> f.getApplicationSealId())
						.orElse(null);
				}
				Map<String, Object> row = new LinkedHashMap<>();
				row.put("id", t.getId());
				row.put("jiraKey", t.getJiraKey());
				row.put("jiraUrl", t.getJiraUrl());
				row.put("apg", t.getApg());
				row.put("status", t.getStatus());
				row.put("findingId", findingId);
				row.put("applicationSealId", applicationSealId);
				return row;
			})
			.collect(Collectors.toList());
	}

	@GetMapping("/export")
	public ResponseEntity<byte[]> exportTicketsExcel() throws Exception {
		List<ResolverTicket> tickets = resolverTicketRepository.findAll();
		try (Workbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
			Sheet sheet = wb.createSheet("ResolverTickets");
			int r = 0;
			Row header = sheet.createRow(r++);
			String[] cols = new String[] { "id", "findingId", "applicationSealId", "jiraKey", "jiraUrl", "apg", "status" };
			for (int i = 0; i < cols.length; i++) {
				Cell c = header.createCell(i);
				c.setCellValue(cols[i]);
			}
			for (ResolverTicket t : tickets) {
				Row row = sheet.createRow(r++);
				Long findingId = t.getFinding() != null ? t.getFinding().getId() : null;
				String applicationSealId = null;
				if (findingId != null) {
					applicationSealId = farmFindingRepository.findById(findingId).map(FarmFinding::getApplicationSealId).orElse(null);
				}
				int c = 0;
				row.createCell(c++).setCellValue(t.getId() != null ? t.getId() : 0);
				row.createCell(c++).setCellValue(findingId != null ? findingId : 0);
				row.createCell(c++).setCellValue(applicationSealId != null ? applicationSealId : "");
				row.createCell(c++).setCellValue(t.getJiraKey() != null ? t.getJiraKey() : "");
				row.createCell(c++).setCellValue(t.getJiraUrl() != null ? t.getJiraUrl() : "");
				row.createCell(c++).setCellValue(t.getApg() != null ? t.getApg() : "");
				row.createCell(c++).setCellValue(t.getStatus() != null ? t.getStatus() : "");
			}
			for (int i = 0; i < cols.length; i++) sheet.autoSizeColumn(i);
			wb.write(out);
			byte[] bytes = out.toByteArray();
			return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=resolver_tickets.xlsx")
				.contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
				.body(bytes);
		}
	}

	@PostMapping("/import")
	public Map<String, Object> importTicketsExcel(@RequestParam("file") MultipartFile file) throws Exception {
		int created = 0, updated = 0, skipped = 0;
		try (Workbook wb = new XSSFWorkbook(new ByteArrayInputStream(file.getBytes()))) {
			Sheet sheet = wb.getSheetAt(0);
			boolean headerRow = true;
			for (Row row : sheet) {
				if (headerRow) { headerRow = false; continue; }
				if (row == null) continue;
				Long id = (long) getNumeric(row, 0);
				Long findingId = (long) getNumeric(row, 1);
				String applicationSealId = getString(row, 2);
				String jiraKey = getString(row, 3);
				String jiraUrl = getString(row, 4);
				String apg = getString(row, 5);
				String status = getString(row, 6);

				ResolverTicket ticket = null;
				if (id != null && id > 0) {
					ticket = resolverTicketRepository.findById(id).orElse(null);
				}
				if (ticket == null) { ticket = new ResolverTicket(); }

				FarmFinding finding = null;
				if (findingId != null && findingId > 0) {
					finding = farmFindingRepository.findById(findingId).orElse(null);
				}
				if (finding == null && applicationSealId != null && !applicationSealId.isBlank()) {
					finding = farmFindingRepository.findAll().stream()
						.filter(f -> applicationSealId.equals(f.getApplicationSealId()))
						.findFirst().orElse(null);
				}
				if (finding == null) { skipped++; continue; }

				ticket.setFinding(finding);
				ticket.setJiraKey(jiraKey);
				ticket.setJiraUrl(jiraUrl);
				ticket.setApg(apg);
				ticket.setStatus(status);

				resolverTicketRepository.save(ticket);
				if (id != null && id > 0) updated++; else created++;
			}
		}
		Map<String, Object> result = new LinkedHashMap<>();
		result.put("created", created);
		result.put("updated", updated);
		result.put("skipped", skipped);
		return result;
	}

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



