package com.report.controller;

import com.report.model.ProcessMaster;
import com.report.service.ProcessMasterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/process")
@CrossOrigin(origins = "*")
public class ProcessMasterController {

    @Autowired
    private ProcessMasterService svc;

    @GetMapping("/list")
    public List<ProcessMaster> getAll() {
        return svc.findAll();
    }

    @GetMapping("/{processNo}")
    public List<ProcessMaster> getByProcessNo(@PathVariable String processNo) {
        return svc.findByProcessNo(processNo);
    }

    @GetMapping("/byOrder/{orderNo}")
    public List<ProcessMaster> getByOrderNo(@PathVariable String orderNo) {
        return svc.findByOrderNo(orderNo);
    }

    @GetMapping("/byOrder/{orderNo}/{processNo}")
    public List<ProcessMaster> getByOrderNoAndProcessNo(
            @PathVariable String orderNo,
            @PathVariable String processNo) {
        return svc.findByOrderNoAndProcessNo(orderNo, processNo);
    }
}