package com.report.controller;

import com.report.model.WorkOrderDocument;
import com.report.service.WorkOrderDocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;
import java.nio.file.*;
import java.util.List;

@RestController
@RequestMapping("/api/document")
@CrossOrigin(origins = "*")
public class WorkOrderDocumentController {

    @Autowired
    private WorkOrderDocumentService svc;

    private final String UPLOAD_DIR = "uploads/";

    // 查詢品號+工序的所有文件
    @GetMapping("/{productNo}/{processNo}")
    public List<WorkOrderDocument> getByProductAndProcess(
            @PathVariable String productNo,
            @PathVariable String processNo) {
        return svc.findByProductNoAndProcessNo(productNo, processNo);
    }

    // 查詢品號的所有文件
    @GetMapping("/{productNo}")
    public List<WorkOrderDocument> getByProductNo(@PathVariable String productNo) {
        return svc.findByProductNo(productNo);
    }

    // 取得檔案（圖片或PDF）
    @GetMapping("/image/{fileName}")
    public ResponseEntity<Resource> getImage(@PathVariable String fileName) throws IOException {
        // 判斷 Content-Type
        String contentType = "application/octet-stream";
        if (fileName.toLowerCase().endsWith(".pdf")) {
            contentType = "application/pdf";
        } else if (fileName.toLowerCase().endsWith(".jpg") || fileName.toLowerCase().endsWith(".jpeg")) {
            contentType = "image/jpeg";
        } else if (fileName.toLowerCase().endsWith(".png")) {
            contentType = "image/png";
        }

        // 先找 uploads/ 資料夾
        Path path = Paths.get(UPLOAD_DIR + fileName);
        Resource resource = new UrlResource(path.toUri());
        if (resource.exists()) {
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header("Content-Disposition", "inline; filename=\"" + fileName + "\"")
                    .body(resource);
        }

        // fallback 到 static/uploads/
        Resource staticResource = new ClassPathResource("static/uploads/" + fileName);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header("Content-Disposition", "inline; filename=\"" + fileName + "\"")
                .body(staticResource);
    }
}