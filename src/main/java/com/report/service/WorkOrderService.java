package com.report.service;

import com.report.model.WorkOrder;
import com.report.repository.WorkOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class WorkOrderService {

    @Autowired
    private WorkOrderRepository repo;

    public WorkOrder findByOrderNo(String orderNo) {
        Optional<WorkOrder> result = repo.findByOrderNo(orderNo);
        return result.orElse(null);
    }
}