package com.report.service;

import com.report.model.WorkReport;
import com.report.model.WorkReportMachine;
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
                total += (endH * 60 + endM) - (startH * 60 + startM);
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
}