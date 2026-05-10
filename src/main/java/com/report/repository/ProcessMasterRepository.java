package com.report.repository;

import com.report.model.ProcessMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProcessMasterRepository extends JpaRepository<ProcessMaster, Long> {
    List<ProcessMaster> findByProcessNo(String processNo);
    List<ProcessMaster> findByProductNoOrderByProcessNoAsc(String productNo);
    List<ProcessMaster> findByProductNoAndProcessNo(String productNo, String processNo);
}