package com.report.controller;

import com.report.model.Department;
import com.report.model.Employee;
import com.report.model.Machine;
import com.report.model.WorkReport;
import com.report.model.WorkReportMachine;
import com.report.repository.DepartmentRepository;
import com.report.repository.EmployeeRepository;
import com.report.repository.MachineRepository;
import com.report.repository.WorkReportRepository;
import com.report.repository.WorkReportMachineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class AdminController {

    @Autowired
    private EmployeeRepository employeeRepo;

    @Autowired
    private WorkReportRepository reportRepo;

    @Autowired
    private WorkReportMachineRepository machineRepo;

    @Autowired
    private DepartmentRepository deptRepo;

    @Autowired
    private MachineRepository machineRepo2;

    @GetMapping("/reports")
    public List<Map<String, Object>> getReports(
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String employeeNo,
            @RequestParam(required = false) Long deptId) {

        List<Employee> allEmployees = employeeRepo.findAll();
        List<String> empNos = new ArrayList<>();

        if (employeeNo != null && !employeeNo.isEmpty()) {
            empNos.add(employeeNo);
        } else if (deptId != null) {
            allEmployees.stream()
                    .filter(e -> deptId.equals(e.getDeptId()))
                    .forEach(e -> empNos.add(e.getEmployeeNo()));
        } else {
            allEmployees.forEach(e -> empNos.add(e.getEmployeeNo()));
        }

        List<Object[]> rows;
        if (date != null && !date.isEmpty()) {
            rows = reportRepo.findByEmployeeNoInAndDateWithProcessCode(empNos, date);
        } else {
            rows = reportRepo.findByEmployeeNoInWithProcessCode(empNos);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rows) {
            WorkReport r = (WorkReport) row[0];
            r.setProcessCode((String) row[1]);
            r.setMachineList(machineRepo.findByReportId(r.getId()));

            Employee emp = employeeRepo.findByEmployeeNo(r.getEmployeeNo());
            String empName = emp != null ? emp.getEmployeeName() : "";
            String deptName = "";
            if (emp != null && emp.getDeptId() != null) {
                deptName = deptRepo.findById(emp.getDeptId())
                        .map(d -> d.getDeptName()).orElse("");
            }

            Map<String, Object> item = new HashMap<>();
            item.put("report", r);
            item.put("employeeName", empName);
            item.put("deptName", deptName);
            result.add(item);
        }
        return result;
    }

    @GetMapping("/departments")
    public List<Department> getDepartments() {
        return deptRepo.findAll();
    }

    @GetMapping("/employees")
    public List<Employee> getAllEmployees() {
        return employeeRepo.findAll();
    }

    @GetMapping("/stats/employee")
    public List<Map<String, Object>> getEmployeeStats(
            @RequestParam(required = false) String employeeNo,
            @RequestParam(required = false) Long deptId) {

        List<Employee> employees;
        if (employeeNo != null && !employeeNo.isEmpty()) {
            Employee emp = employeeRepo.findByEmployeeNo(employeeNo);
            employees = emp != null ? List.of(emp) : new ArrayList<>();
        } else if (deptId != null) {
            employees = employeeRepo.findByDeptId(deptId);
        } else {
            employees = employeeRepo.findAll();
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Employee emp : employees) {
            List<WorkReport> reports = reportRepo.findByEmployeeNoIn(List.of(emp.getEmployeeNo()));

            double totalHours = 0;
            Map<String, Double> dateHours = new LinkedHashMap<>();
            for (WorkReport r : reports) {
                double hours = calcHours(r.getLaborTimeStart(), r.getLaborTimeEnd());
                totalHours += hours;
                dateHours.merge(r.getProductionDate(), hours, Double::sum);
            }

            List<Map<String, Object>> details = new ArrayList<>();
            dateHours.forEach((d, hours) -> {
                Map<String, Object> detail = new HashMap<>();
                detail.put("date", d);
                detail.put("hours", Math.round(hours * 100.0) / 100.0);
                details.add(detail);
            });

            String deptName = emp.getDeptId() != null ?
                    deptRepo.findById(emp.getDeptId()).map(dept -> dept.getDeptName()).orElse("") : "";

            Map<String, Object> item = new HashMap<>();
            item.put("employeeNo", emp.getEmployeeNo());
            item.put("employeeName", emp.getEmployeeName());
            item.put("deptName", deptName);
            item.put("totalHours", Math.round(totalHours * 100.0) / 100.0);
            item.put("details", details);
            result.add(item);
        }
        return result;
    }

    @GetMapping("/stats/machine")
    public List<Map<String, Object>> getMachineStats(
            @RequestParam(required = false) String machineCode) {

        List<Machine> allMachines;
        if (machineCode != null && !machineCode.isEmpty()) {
            allMachines = machineRepo2.findByMachineCode(machineCode);
        } else {
            allMachines = machineRepo2.findAll();
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Machine machine : allMachines) {
            List<WorkReportMachine> records = machineRepo.findByMachineCode(machine.getMachineCode());

            double totalHours = 0;
            Map<String, Double> dateHours = new LinkedHashMap<>();
            for (WorkReportMachine m : records) {
                WorkReport r = reportRepo.findById(m.getReportId()).orElse(null);
                if (r == null) continue;
                double hours = calcHours(m.getMachineTimeStart(), m.getMachineTimeEnd());
                totalHours += hours;
                dateHours.merge(r.getProductionDate(), hours, Double::sum);
            }

            List<Map<String, Object>> details = new ArrayList<>();
            dateHours.forEach((d, hours) -> {
                Map<String, Object> detail = new HashMap<>();
                detail.put("date", d);
                detail.put("hours", Math.round(hours * 100.0) / 100.0);
                details.add(detail);
            });

            Map<String, Object> item = new HashMap<>();
            item.put("machineCode", machine.getMachineCode());
            item.put("machineType", machine.getMachineType());
            item.put("totalHours", Math.round(totalHours * 100.0) / 100.0);
            item.put("details", details);
            result.add(item);
        }
        return result;
    }

    private double calcHours(String start, String end) {
        if (start == null || end == null || start.length() != 4 || end.length() != 4) return 0;
        int startH = Integer.parseInt(start.substring(0, 2));
        int startM = Integer.parseInt(start.substring(2, 4));
        int endH = Integer.parseInt(end.substring(0, 2));
        int endM = Integer.parseInt(end.substring(2, 4));

        int startMinutes = startH * 60 + startM;
        int endMinutes = endH * 60 + endM;
        int workMinutes = endMinutes - startMinutes;

        int lunchStart = 12 * 60;
        int lunchEnd = 13 * 60;
        if (startMinutes < lunchEnd && endMinutes > lunchStart) {
            int overlapStart = Math.max(startMinutes, lunchStart);
            int overlapEnd = Math.min(endMinutes, lunchEnd);
            workMinutes -= (overlapEnd - overlapStart);
        }
        return Math.round(workMinutes / 60.0 * 100.0) / 100.0;
    }
}