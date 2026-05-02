package com.report.service;

import com.report.model.Employee;
import com.report.model.WorkReport;
import com.report.model.WorkReportMachine;
import com.report.repository.EmployeeRepository;
import com.report.repository.WorkReportRepository;
import com.report.repository.WorkReportMachineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class WorkReportService {

    @Autowired
    private WorkReportRepository repo;

    @Autowired
    private WorkReportMachineRepository machineRepo;

    @Autowired
    private EmployeeRepository employeeRepo;

    public List<WorkReport> findAll() { return repo.findAll(); }

    public WorkReport save(WorkReport r, List<WorkReportMachine> machines) {
        WorkReport saved = repo.save(r);
        if (machines != null) {
            for (WorkReportMachine m : machines) {
                m.setReportId(saved.getId());
                machineRepo.save(m);
            }
        }
        return saved;
    }

    public List<WorkReport> findByDate(String date) {
        List<Object[]> rows = repo.findByDateWithProcessCode(date);
        List<WorkReport> list = new java.util.ArrayList<>();
        for (Object[] row : rows) {
            WorkReport r = (WorkReport) row[0];
            r.setProcessCode((String) row[1]);
            Employee emp = employeeRepo.findByEmployeeNo(r.getEmployeeNo());
            if (emp != null) r.setEmployeeName(emp.getEmployeeName());
            r.setMachineList(machineRepo.findByReportId(r.getId()));
            list.add(r);
        }
        return list;
    }

    public double calcTotalHours(String employeeNo, String date) {
        List<WorkReport> list = repo.findByProductionDateAndEmployeeNo(date, employeeNo);
        double total = 0;
        for (WorkReport r : list) {
            if (r.getLaborTimeStart() != null && r.getLaborTimeEnd() != null
                    && r.getLaborTimeStart().length() == 4 && r.getLaborTimeEnd().length() == 4) {
                int startH = Integer.parseInt(r.getLaborTimeStart().substring(0, 2));
                int startM = Integer.parseInt(r.getLaborTimeStart().substring(2, 4));
                int endH = Integer.parseInt(r.getLaborTimeEnd().substring(0, 2));
                int endM = Integer.parseInt(r.getLaborTimeEnd().substring(2, 4));
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
                total += workMinutes;
            }
        }
        return Math.round(total / 60.0 * 100.0) / 100.0;
    }

    public List<WorkReport> findByDateAndEmployee(String date, String employeeNo) {
        List<Object[]> rows = repo.findByDateAndEmployeeWithProcessCode(date, employeeNo);
        List<WorkReport> list = new java.util.ArrayList<>();
        for (Object[] row : rows) {
            WorkReport r = (WorkReport) row[0];
            r.setProcessCode((String) row[1]);
            Employee emp = employeeRepo.findByEmployeeNo(r.getEmployeeNo());
            if (emp != null) r.setEmployeeName(emp.getEmployeeName());
            r.setMachineList(machineRepo.findByReportId(r.getId()));
            list.add(r);
        }
        return list;
    }

    public java.util.Optional<WorkReport> findById(Long id) {
        return repo.findById(id);
    }

    public WorkReport saveReport(WorkReport r) {
        return repo.save(r);
    }

    public void deleteById(Long id) {
        repo.deleteById(id);
    }
}