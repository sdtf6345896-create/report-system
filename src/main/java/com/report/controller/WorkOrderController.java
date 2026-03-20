package com.report.controller;

import com.report.model.WorkOrder;
import com.report.service.WorkOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/workorder")
@CrossOrigin(origins = "*")
public class WorkOrderController {

    @Autowired
    private WorkOrderService svc;

    @GetMapping("/{orderNo}")
    public WorkOrder getByOrderNo(@PathVariable String orderNo) {
        return svc.findByOrderNo(orderNo);
    }
}