package com.report.controller;

import com.report.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employee")
@CrossOrigin(origins = "*")
public class EmployeeController {

    @Autowired
    private EmployeeService svc;

    @GetMapping("/{employeeNo}")
    public String getName(@PathVariable String employeeNo) {
        return svc.findNameByNo(employeeNo);
    }
}
