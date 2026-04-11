package com.report.repository;

import com.report.model.Machine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MachineRepository extends JpaRepository<Machine, Long> {
    List<Machine> findByProcessType(String processType);
    List<Machine> findByMachineCode(String machineCode);
}