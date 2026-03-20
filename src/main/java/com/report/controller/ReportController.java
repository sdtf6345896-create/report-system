package com.report.controller;

import com.report.model.WorkReport;
import com.report.model.WorkReportMachine;
import com.report.repository.WorkReportMachineRepository;
import com.report.service.WorkReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/report")
@CrossOrigin(origins = "*")
public class ReportController {

    @Autowired
    private WorkReportService svc;

    @Autowired
    private WorkReportMachineRepository machineRepo;

    @GetMapping("/list")
    public List<WorkReport> list() { return svc.findAll(); }

    @PostMapping("/save")
    public WorkReport save(@RequestBody Map<String, Object> body) {
        WorkReport r = new WorkReport();
        r.setProductionDate((String) body.get("productionDate"));
        r.setEmployeeNo((String) body.get("employeeNo"));
        r.setWorkOrder((String) body.get("workOrder"));
        r.setProcess((String) body.get("process"));
        r.setMachineCode((String) body.get("machineCode"));
        r.setCompletedQty(body.get("completedQty") != null ? ((Number) body.get("completedQty")).intValue() : null);
        r.setScrapQty(body.get("scrapQty") != null ? ((Number) body.get("scrapQty")).intValue() : null);
        r.setLaborTimeStart((String) body.get("laborTimeStart"));
        r.setLaborTimeEnd((String) body.get("laborTimeEnd"));
        r.setMachineTimeStart((String) body.get("machineTimeStart"));
        r.setMachineTimeEnd((String) body.get("machineTimeEnd"));
        r.setRemarks((String) body.get("remarks"));
        r.setIsComplete(body.get("isComplete") != null && (Boolean) body.get("isComplete"));

        // 處理多台機台
        List<WorkReportMachine> machines = new java.util.ArrayList<>();
        Object machineRaw = body.get("machines");
        if (machineRaw instanceof List) {
            for (Object item : (List<?>) machineRaw) {
                if (item instanceof Map) {
                    Map<?, ?> m = (Map<?, ?>) item;
                    WorkReportMachine wm = new WorkReportMachine();
                    wm.setMachineCode((String) m.get("machineCode"));
                    wm.setMachineTimeStart((String) m.get("machineTimeStart"));
                    wm.setMachineTimeEnd((String) m.get("machineTimeEnd"));
                    machines.add(wm);
                }
            }
        }
        return svc.save(r, machines);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return svc.findById(id).map(existing -> {
            existing.setProductionDate((String) body.get("productionDate"));
            existing.setEmployeeNo((String) body.get("employeeNo"));
            existing.setWorkOrder((String) body.get("workOrder"));
            existing.setProcess((String) body.get("process"));
            existing.setMachineCode((String) body.get("machineCode"));
            existing.setCompletedQty(body.get("completedQty") != null ? ((Number) body.get("completedQty")).intValue() : null);
            existing.setScrapQty(body.get("scrapQty") != null ? ((Number) body.get("scrapQty")).intValue() : null);
            existing.setLaborTimeStart((String) body.get("laborTimeStart"));
            existing.setLaborTimeEnd((String) body.get("laborTimeEnd"));
            existing.setMachineTimeStart((String) body.get("machineTimeStart"));
            existing.setMachineTimeEnd((String) body.get("machineTimeEnd"));
            existing.setRemarks((String) body.get("remarks"));
            existing.setIsComplete(body.get("isComplete") != null && (Boolean) body.get("isComplete"));

            // 更新機台資料
            machineRepo.deleteByReportId(id);
            List<WorkReportMachine> machines = new java.util.ArrayList<>();
            Object machineRaw = body.get("machines");
            if (machineRaw instanceof List) {
                for (Object item : (List<?>) machineRaw) {
                    if (item instanceof Map) {
                        Map<?, ?> m = (Map<?, ?>) item;
                        WorkReportMachine wm = new WorkReportMachine();
                        wm.setReportId(id);
                        wm.setMachineCode((String) m.get("machineCode"));
                        wm.setMachineTimeStart((String) m.get("machineTimeStart"));
                        wm.setMachineTimeEnd((String) m.get("machineTimeEnd"));
                        machines.add(wm);
                    }
                }
            }
            machineRepo.saveAll(machines);
            return ResponseEntity.ok(svc.saveReport(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/totalHours/{employeeNo}/{date}")
    public double getTotalHours(@PathVariable String employeeNo, @PathVariable String date) {
        return svc.calcTotalHours(employeeNo, date);
    }

    @GetMapping("/listByDate/{date}")
    public List<WorkReport> listByDate(@PathVariable String date,
            @RequestParam(required = false) String employeeNo) {
        if (employeeNo != null && !employeeNo.isEmpty()) {
            return svc.findByDateAndEmployee(date, employeeNo);
        }
        return svc.findByDate(date);
    }
}