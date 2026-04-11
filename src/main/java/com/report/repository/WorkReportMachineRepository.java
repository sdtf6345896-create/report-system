package com.report.repository;

import com.report.model.WorkReportMachine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface WorkReportMachineRepository extends JpaRepository<WorkReportMachine, Long> {
    List<WorkReportMachine> findByReportId(Long reportId);

    @Transactional
    void deleteByReportId(Long reportId);

    List<WorkReportMachine> findByMachineCode(String machineCode);
}