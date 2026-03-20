package com.report.service;

import com.report.model.Employee;
import com.report.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository repo;

    public String findNameByNo(String employeeNo) {
        Optional<Employee> emp = repo.findByEmployeeNo(employeeNo);
        return emp.map(Employee::getEmployeeName).orElse(null);
    }
}