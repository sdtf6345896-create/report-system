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

    @GetMapping("/byProduct/{productNo}")
    public List<ProcessMaster> getByProductNo(@PathVariable String productNo) {
        return svc.findByProductNo(productNo);
    }

    @GetMapping("/byProduct/{productNo}/{processNo}")
    public List<ProcessMaster> getByProductNoAndProcessNo(
            @PathVariable String productNo,
            @PathVariable String processNo) {
        return svc.findByProductNoAndProcessNo(productNo, processNo);
    }
}