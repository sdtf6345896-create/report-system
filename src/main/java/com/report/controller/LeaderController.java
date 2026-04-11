package com.report.controller;

import com.report.model.Employee;
import com.report.model.WorkReport;
import com.report.repository.EmployeeRepository;
import com.report.repository.WorkReportRepository;
import com.report.repository.WorkReportMachineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/leader")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class LeaderController {

    @Autowired
    private EmployeeRepository employeeRepo;

    @Autowired
    private WorkReportRepository reportRepo;

    @Autowired
    private WorkReportMachineRepository machineRepo;

    @GetMapping("/info/{employeeId}")
    public Map<String, Object> getLeaderInfo(@PathVariable Long employeeId) {
        Map<String, Object> result = new HashMap<>();
        Employee leader = employeeRepo.findById(employeeId).orElse(null);
        if (leader == null) return result;
        result.put("leaderName", leader.getEmployeeName());
        String deptName = employeeRepo.findDeptNameByEmployeeId(employeeId);
        result.put("deptName", deptName != null ? deptName : "");
        return result;
    }

    @GetMapping("/employees/{employeeId}")
    public List<Employee> getEmployees(@PathVariable Long employeeId) {
        Long deptId = employeeRepo.findDeptIdByEmployeeId(employeeId);
        return employeeRepo.findByDeptId(deptId);
    }

    @GetMapping("/reports/{employeeId}")
    public List<WorkReport> getReports(
            @PathVariable Long employeeId,
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String employeeNo) {

        Long deptId = employeeRepo.findDeptIdByEmployeeId(employeeId);
        List<Employee> employees = employeeRepo.findByDeptId(deptId);
        List<String> empNos = new ArrayList<>();
        employees.forEach(e -> empNos.add(e.getEmployeeNo()));

        Employee leader = employeeRepo.findById(employeeId).orElse(null);
        if (leader != null && !empNos.contains(leader.getEmployeeNo())) {
            empNos.add(leader.getEmployeeNo());
        }

        if (employeeNo != null && !employeeNo.isEmpty()) {
            empNos.clear();
            empNos.add(employeeNo);
        }

        List<Object[]> rows;
        if (date != null && !date.isEmpty()) {
            rows = reportRepo.findByEmployeeNoInAndDateWithProcessCode(empNos, date);
        } else {
            rows = reportRepo.findByEmployeeNoInWithProcessCode(empNos);
        }

        List<WorkReport> reports = new ArrayList<>();
        for (Object[] row : rows) {
            WorkReport r = (WorkReport) row[0];
            r.setProcessCode((String) row[1]);
            Employee emp = employeeRepo.findByEmployeeNo(r.getEmployeeNo());
            if (emp != null) r.setEmployeeName(emp.getEmployeeName());
            r.setMachineList(machineRepo.findByReportId(r.getId()));
            reports.add(r);
        }

        return reports;
    }
}