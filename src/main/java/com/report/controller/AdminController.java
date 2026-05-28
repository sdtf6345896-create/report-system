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
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

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

    @Autowired
    private com.report.repository.WorkOrderRepository workOrderRepo;

    @Autowired
    private com.report.repository.ProcessMasterRepository processMasterRepo;

    @Autowired
    private com.report.repository.WorkOrderDocumentRepository workOrderDocumentRepo;

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
    public List<Map<String, Object>> getAllEmployees() {
        List<Employee> emps = employeeRepo.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        emps.forEach(e -> {
            Map<String, Object> item = new HashMap<>();
            item.put("employeeNo", e.getEmployeeNo());
            item.put("employeeName", e.getEmployeeName());
            item.put("deptId", e.getDeptId());
            item.put("hireDate", e.getHireDate());
            item.put("gender", e.getGender());
            item.put("position", e.getPosition());
            item.put("phone", e.getPhone());
            item.put("idNumber", e.getIdNumber());
            item.put("emergencyContact", e.getEmergencyContact());
            item.put("emergencyPhone", e.getEmergencyPhone());
            item.put("emergencyRelation", e.getEmergencyRelation());
            item.put("photo", e.getPhoto());
            String deptName = e.getDeptId() != null ?
                    deptRepo.findById(e.getDeptId()).map(d -> d.getDeptName()).orElse("") : "";
            item.put("deptName", deptName);
            result.add(item);
        });
        return result;
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

    @PostMapping("/product")
    public ResponseEntity<?> addProduct(@RequestBody Map<String, Object> body) {
        String productNo = (String) body.get("productNo");
        if (productNo == null || productNo.isEmpty()) {
            return ResponseEntity.badRequest().body("品號不能為空");
        }
        List<com.report.model.WorkOrder> existing = workOrderRepo.findAll()
                .stream().filter(w -> productNo.equals(w.getProductNo())).collect(java.util.stream.Collectors.toList());
        if (!existing.isEmpty()) {
            return ResponseEntity.badRequest().body("品號已存在");
        }
        return ResponseEntity.ok().build();
    }

    @PostMapping("/workorder")
    public ResponseEntity<?> addWorkOrder(@RequestBody Map<String, Object> body) {
        String orderNo = (String) body.get("orderNo");
        String productNo = (String) body.get("productNo");
        if (orderNo == null || productNo == null) {
            return ResponseEntity.badRequest().body("資料不完整");
        }
        if (workOrderRepo.findByOrderNo(orderNo).isPresent()) {
            return ResponseEntity.badRequest().body("製令已存在");
        }
        com.report.model.WorkOrder wo = new com.report.model.WorkOrder();
        wo.setOrderNo(orderNo);
        wo.setProductNo(productNo);
        workOrderRepo.save(wo);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/process")
    public ResponseEntity<?> addProcess(@RequestBody Map<String, Object> body) {
        String productNo = (String) body.get("productNo");
        String processNo = (String) body.get("processNo");
        String processCode = (String) body.get("processCode");
        String processName = (String) body.get("processName");
        if (productNo == null || processNo == null || processCode == null || processName == null) {
            return ResponseEntity.badRequest().body("資料不完整");
        }
        com.report.model.ProcessMaster pm = new com.report.model.ProcessMaster();
        pm.setProductNo(productNo);
        pm.setProcessNo(processNo);
        pm.setProcessCode(processCode);
        pm.setProcessName(processName);
        processMasterRepo.save(pm);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/process/{productNo}/{processNo}")
    public ResponseEntity<?> updateProcess(@PathVariable String productNo, @PathVariable String processNo, @RequestBody Map<String, Object> body) {
        String newProcessNo = (String) body.get("processNo");
        String processCode = (String) body.get("processCode");
        String processName = (String) body.get("processName");

        List<com.report.model.ProcessMaster> processes = processMasterRepo.findByProductNoOrderByProcessNoAsc(productNo);
        processes.stream()
                .filter(p -> processNo.equals(p.getProcessNo()))
                .findFirst()
                .ifPresent(p -> {
                    p.setProcessNo(newProcessNo);
                    p.setProcessCode(processCode);
                    p.setProcessName(processName);
                    processMasterRepo.save(p);
                });

        if (newProcessNo != null && !newProcessNo.equals(processNo)) {
            List<com.report.model.WorkOrderDocument> docs = workOrderDocumentRepo.findByProductNoAndProcessNo(productNo, processNo);
            docs.forEach(doc -> {
                doc.setProcessNo(newProcessNo);
                workOrderDocumentRepo.save(doc);
            });
        }

        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/process/{productNo}/{processNo}")
    public ResponseEntity<?> deleteProcess(@PathVariable String productNo, @PathVariable String processNo) {
        List<com.report.model.ProcessMaster> processes = processMasterRepo.findByProductNoOrderByProcessNoAsc(productNo);
        processes.stream()
                .filter(p -> processNo.equals(p.getProcessNo()))
                .findFirst()
                .ifPresent(p -> processMasterRepo.delete(p));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/product/{productNo}")
    public ResponseEntity<?> deleteProduct(@PathVariable String productNo) {
        List<com.report.model.ProcessMaster> processes = processMasterRepo.findByProductNoOrderByProcessNoAsc(productNo);
        processMasterRepo.deleteAll(processes);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/workorder/{id}")
    public ResponseEntity<?> deleteWorkOrder(@PathVariable Long id) {
        if (!workOrderRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        workOrderRepo.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("productNo") String productNo,
            @RequestParam("processNo") String processNo,
            @RequestParam("docType") String docType) {
        try {
            String uploadDir = "uploads/";
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            String fileName = productNo + "_" + processNo + "_" + docType + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(uploadDir + fileName);
            Files.write(filePath, file.getBytes());

            // 存進資料庫
            List<com.report.model.WorkOrderDocument> existing = workOrderDocumentRepo.findByProductNoAndProcessNoAndDocType(productNo, processNo, docType);
            com.report.model.WorkOrderDocument doc;
            if (!existing.isEmpty()) {
                doc = existing.get(0);
            } else {
                doc = new com.report.model.WorkOrderDocument();
                doc.setProductNo(productNo);
                doc.setProcessNo(processNo);
                doc.setDocType(docType);
            }
            doc.setFilePath(fileName);
            workOrderDocumentRepo.save(doc);

            return ResponseEntity.ok(Map.of("fileName", fileName, "path", "/api/admin/file/" + fileName));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("上傳失敗：" + e.getMessage());
        }
    }

    @PostMapping("/employee")
    public ResponseEntity<?> addEmployee(@RequestBody Map<String, Object> body) {
        String employeeNo = (String) body.get("employeeNo");
        String employeeName = (String) body.get("employeeName");
        Integer deptId = (Integer) body.get("deptId");
        String hireDate = (String) body.get("hireDate");
        String gender = (String) body.get("gender");
        String position = (String) body.get("position");
        String phone = (String) body.get("phone");
        String idNumber = (String) body.get("idNumber");
        String emergencyContact = (String) body.get("emergencyContact");
        String emergencyPhone = (String) body.get("emergencyPhone");
        String emergencyRelation = (String) body.get("emergencyRelation");
        if (employeeNo == null || employeeName == null || deptId == null) {
            return ResponseEntity.badRequest().body("資料不完整");
        }
        if (employeeRepo.findByEmployeeNo(employeeNo) != null) {
            return ResponseEntity.badRequest().body("員工編號已存在");
        }
        Employee emp = new Employee();
        emp.setEmployeeNo(employeeNo);
        emp.setEmployeeName(employeeName);
        emp.setDeptId(deptId.longValue());
        emp.setHireDate(hireDate);
        emp.setGender(gender);
        emp.setPosition(position);
        emp.setPhone(phone);
        emp.setIdNumber(idNumber);
        emp.setEmergencyContact(emergencyContact);
        emp.setEmergencyPhone(emergencyPhone);
        emp.setEmergencyRelation(emergencyRelation);
        String photo = (String) body.get("photo");
        if (photo != null && !photo.isEmpty()) emp.setPhoto(photo);
        employeeRepo.save(emp);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/employee/{employeeNo}")
    public ResponseEntity<?> updateEmployee(@PathVariable String employeeNo, @RequestBody Map<String, Object> body) {
        Employee emp = employeeRepo.findByEmployeeNo(employeeNo);
        if (emp == null) {
            return ResponseEntity.notFound().build();
        }
        if (body.get("employeeName") != null) emp.setEmployeeName((String) body.get("employeeName"));
        if (body.get("deptId") != null) emp.setDeptId(((Integer) body.get("deptId")).longValue());
        if (body.get("hireDate") != null) emp.setHireDate((String) body.get("hireDate"));
        if (body.get("gender") != null) emp.setGender((String) body.get("gender"));
        if (body.get("position") != null) emp.setPosition((String) body.get("position"));
        if (body.get("phone") != null) emp.setPhone((String) body.get("phone"));
        if (body.get("idNumber") != null) emp.setIdNumber((String) body.get("idNumber"));
        if (body.get("emergencyContact") != null) emp.setEmergencyContact((String) body.get("emergencyContact"));
        if (body.get("emergencyPhone") != null) emp.setEmergencyPhone((String) body.get("emergencyPhone"));
        if (body.get("emergencyRelation") != null) emp.setEmergencyRelation((String) body.get("emergencyRelation"));
        if (body.get("photo") != null && !((String) body.get("photo")).isEmpty()) emp.setPhoto((String) body.get("photo"));
        employeeRepo.save(emp);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/employee/{employeeNo}")
    public ResponseEntity<?> deleteEmployee(@PathVariable String employeeNo) {
        Employee emp = employeeRepo.findByEmployeeNo(employeeNo);
        if (emp == null) {
            return ResponseEntity.notFound().build();
        }
        employeeRepo.delete(emp);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/file/{fileName}")
    public ResponseEntity<org.springframework.core.io.Resource> getFile(@PathVariable String fileName) throws java.io.IOException {
        Path filePath = Paths.get("uploads/" + fileName);
        org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(filePath.toUri());
        if (resource.exists()) {
            return ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.APPLICATION_OCTET_STREAM)
                    .body(resource);
        }
        return ResponseEntity.notFound().build();
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