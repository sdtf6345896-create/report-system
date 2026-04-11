package com.report.repository;

import com.report.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Employee findByEmployeeNo(String employeeNo);

    @Query("SELECT e.deptId FROM Employee e WHERE e.id = :employeeId")
    Long findDeptIdByEmployeeId(@Param("employeeId") Long employeeId);

    @Query("SELECT d.deptName FROM Department d WHERE d.id = (SELECT e.deptId FROM Employee e WHERE e.id = :employeeId)")
    String findDeptNameByEmployeeId(@Param("employeeId") Long employeeId);

    List<Employee> findByDeptId(Long deptId);
    List<Employee> findByDeptIdAndIdNot(Long deptId, Long id);
}