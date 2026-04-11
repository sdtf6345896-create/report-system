package com.report.controller;

import com.report.model.Machine;
import com.report.repository.MachineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/machine")
@CrossOrigin(origins = "*")
public class MachineController {

    @Autowired
    private MachineRepository machineRepo;

    @GetMapping("/byProcess/{processCode}")
    public List<Machine> getByProcessCode(@PathVariable String processCode) {
        String processType = processCode.substring(0, 2).toUpperCase();
        return machineRepo.findByProcessType(processType);
    }
}