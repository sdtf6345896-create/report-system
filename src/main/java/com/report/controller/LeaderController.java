package com.report.controller;

import com.report.model.Employee;
import com.report.model.User;
import com.report.model.WorkReport;
import com.report.repository.EmployeeRepository;
import com.report.repository.UserRepository;
import com.report.repository.WorkReportRepository;
import com.report.repository.WorkReportMachineRepository;
import com.report.repository.DepartmentRepository;
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

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private DepartmentRepository deptRepo;

    @GetMapping("/info/{employeeId}")
    public Map<String, Object> getLeaderInfo(@PathVariable Long employeeId) {
        Map<String, Object> result = new HashMap<>();
        User user = userRepo.findById(employeeId).orElse(null);
        if (user == null) return result;

        Long deptId = user.getDeptId();
        String deptName = deptId != null ?
                deptRepo.findById(deptId).map(d -> d.getDeptName()).orElse("") : "";
        result.put("deptName", deptName);

        // 找組長姓名（該部門中職位是組長的員工）
        List<Employee> deptEmps = employeeRepo.findByDeptId(deptId);
        String leaderName = deptEmps.stream()
                .filter(e -> "組長".equals(e.getPosition()))
                .map(Employee::getEmployeeName)
                .findFirst()
                .orElse(user.getUsername());
        result.put("leaderName", leaderName);

        return result;
    }

    @GetMapping("/employees/{employeeId}")
    public List<Employee> getEmployees(@PathVariable Long employeeId) {
        User user = userRepo.findById(employeeId).orElse(null);
        if (user == null) return new ArrayList<>();
        Long deptId = user.getDeptId();
        return employeeRepo.findByDeptId(deptId);
    }

    @GetMapping("/reports/{employeeId}")
    public List<WorkReport> getReports(
            @PathVariable Long employeeId,
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String employeeNo) {

        User user = userRepo.findById(employeeId).orElse(null);
        if (user == null) return new ArrayList<>();
        Long deptId = user.getDeptId();

        List<Employee> employees = employeeRepo.findByDeptId(deptId);
        List<String> empNos = new ArrayList<>();
        employees.forEach(e -> empNos.add(e.getEmployeeNo()));

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