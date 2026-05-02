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

    public List<WorkOrderDocument> findByProductNo(String productNo) {
        return repo.findByProductNo(productNo);
    }

    public List<WorkOrderDocument> findByProductNoAndProcessNo(String productNo, String processNo) {
        return repo.findByProductNoAndProcessNo(productNo, processNo);
    }

    public WorkOrderDocument save(WorkOrderDocument doc) {
        return repo.save(doc);
    }
}