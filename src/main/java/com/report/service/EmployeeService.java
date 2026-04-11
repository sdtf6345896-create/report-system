package com.report.service;

import com.report.model.Employee;
import com.report.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository repo;

    public String findNameByNo(String employeeNo) {
        Employee emp = repo.findByEmployeeNo(employeeNo);
        return emp != null ? emp.getEmployeeName() : null;
    }
}