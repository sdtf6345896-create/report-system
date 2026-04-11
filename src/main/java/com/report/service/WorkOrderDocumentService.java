package com.report.service;

import com.report.model.WorkOrderDocument;
import com.report.repository.WorkOrderDocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class WorkOrderDocumentService {

    @Autowired
    private WorkOrderDocumentRepository repo;

    public List<WorkOrderDocument> findByOrderNo(String orderNo) {
        return repo.findByOrderNo(orderNo);
    }

    public List<WorkOrderDocument> findByOrderNoAndProcessNo(String orderNo, String processNo) {
        return repo.findByOrderNoAndProcessNo(orderNo, processNo);
    }

    public WorkOrderDocument save(WorkOrderDocument doc) {
        return repo.save(doc);
    }
}