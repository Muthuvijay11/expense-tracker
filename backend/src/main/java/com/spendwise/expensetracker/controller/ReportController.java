package com.spendwise.expensetracker.controller;

import com.spendwise.expensetracker.dto.common.ApiResponse;
import com.spendwise.expensetracker.dto.report.CategoryBreakdownDto;
import com.spendwise.expensetracker.dto.report.DashboardSummaryDto;
import com.spendwise.expensetracker.dto.report.PeriodReportDto;
import com.spendwise.expensetracker.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardSummaryDto>> getDashboardSummary() {
        DashboardSummaryDto summary = reportService.getDashboardSummary();
        return ResponseEntity.ok(ApiResponse.ok(summary));
    }

    @GetMapping("/period")
    public ResponseEntity<ApiResponse<PeriodReportDto>> getPeriodReport(
            @RequestParam(defaultValue = "WEEKLY") String type) {
        PeriodReportDto report = reportService.getPeriodReport(type);
        return ResponseEntity.ok(ApiResponse.ok(report));
    }

    @GetMapping("/category-breakdown")
    public ResponseEntity<ApiResponse<List<CategoryBreakdownDto>>> getCategoryBreakdown() {
        List<CategoryBreakdownDto> breakdown = reportService.getCategoryBreakdown();
        return ResponseEntity.ok(ApiResponse.ok(breakdown));
    }
}
