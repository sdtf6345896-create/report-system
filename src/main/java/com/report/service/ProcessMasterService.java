package com.report.service;

import com.report.model.ProcessMaster;
import com.report.repository.ProcessMasterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProcessMasterService {

    @Autowired
    private ProcessMasterRepository repo;

    public List<ProcessMaster> findByProcessNo(String processNo) {
        return repo.findByProcessNo(processNo);
    }

    public List<ProcessMaster> findAll() {
        return repo.findAll();
    }

    public List<ProcessMaster> findByOrderNo(String orderNo) {
        return repo.findByOrderNo(orderNo);
    }

    public List<ProcessMaster> findByOrderNoAndProcessNo(String orderNo, String processNo) {
        return repo.findByOrderNoAndProcessNo(orderNo, processNo);
    }
}