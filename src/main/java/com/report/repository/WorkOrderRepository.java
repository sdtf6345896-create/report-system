package com.report.repository;

import com.report.model.WorkOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {
    Optional<WorkOrder> findByOrderNo(String orderNo);
}