package com.report.controller;

import com.report.model.WorkOrder;
import com.report.service.WorkOrderService;
import com.report.repository.WorkOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/workorder")
@CrossOrigin(origins = "*")
public class WorkOrderController {

    @Autowired
    private WorkOrderService svc;

    @Autowired
    private WorkOrderRepository workOrderRepo;

    @GetMapping("/{orderNo}")
    public WorkOrder getByOrderNo(@PathVariable String orderNo) {
        return svc.findByOrderNo(orderNo);
    }

    @GetMapping("/list")
    public List<WorkOrder> getAll() {
        return workOrderRepo.findAll();
    }
}