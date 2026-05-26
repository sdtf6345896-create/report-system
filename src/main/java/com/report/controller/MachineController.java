package com.report.controller;

import com.report.model.Machine;
import com.report.repository.MachineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/machine")
@CrossOrigin(origins = "*")
public class MachineController {

    @Autowired
    private MachineRepository machineRepo;

    // 原本的 — 報工用，不動
    @GetMapping("/byProcess/{processCode}")
    public List<Machine> getByProcessCode(@PathVariable String processCode) {
        String processType = processCode.substring(0, 2).toUpperCase();
        return machineRepo.findByProcessType(processType);
    }

    // 新增 — 查全部機台
    @GetMapping("/list")
    public List<Machine> getAllMachines() {
        return machineRepo.findAll();
    }

    // 新增 — 新增機台
    @PostMapping("/save")
    public ResponseEntity<?> saveMachine(@RequestBody Machine machine) {
        machineRepo.save(machine);
        return ResponseEntity.ok("新增成功");
    }

    // 新增 — 刪除機台
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMachine(@PathVariable Long id) {
        machineRepo.deleteById(id);
        return ResponseEntity.ok("刪除成功");
    }

    // 新增 — 修改機台
    @PutMapping("/{id}")
    public ResponseEntity<?> updateMachine(@PathVariable Long id, @RequestBody Machine machine) {
        machine.setId(id);
        machineRepo.save(machine);
        return ResponseEntity.ok("修改成功");
    }
}