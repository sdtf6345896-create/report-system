package com.report.model;

import jakarta.persistence.*;

@Entity
@Table(name = "employee")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String employeeNo;
    private String employeeName;

    public Long getId() { return id; }
    public void setId(Long v) { id = v; }
    public String getEmployeeNo() { return employeeNo; }
    public void setEmployeeNo(String v) { employeeNo = v; }
    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String v) { employeeName = v; }
}