// =====================
// 取得所有輸入框
// =====================
const productionDate  = document.getElementById('productionDate');
const employeeNo      = document.getElementById('employeeNo');
const workOrder1      = document.getElementById('workOrder1');
const workOrder2      = document.getElementById('workOrder2');
const process         = document.getElementById('process');
const completedQty    = document.getElementById('completedQty');
const scrapQty        = document.getElementById('scrapQty');
const laborTimeStart  = document.getElementById('laborTimeStart');
const laborTimeEnd    = document.getElementById('laborTimeEnd');
const machineTimeStart= document.getElementById('machineTimeStart');
const machineTimeEnd  = document.getElementById('machineTimeEnd');
const remarks         = document.getElementById('remarks');
const isComplete      = document.getElementById('isComplete');

window.onload = function() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    productionDate.value = year + month + day;
};

function loadReportList(date, empNo) {
    let url = '/api/report/listByDate/' + date;
    if (empNo) url += '?employeeNo=' + empNo;
    fetch(url)
        .then(function (res) { return res.json(); })
        .then(function (data) {
            const table = document.getElementById('reportList');
            while (table.rows.length > 1) { table.deleteRow(1); }
            if (data.length === 0) {
                const row = table.insertRow();
                const cell = row.insertCell();
                cell.colSpan = 15;
                cell.style.textAlign = 'center';
                cell.innerText = '尚無報工紀錄';
                return;
            }
            data.forEach(function (r) {
                const row = table.insertRow();
                row.insertCell().innerText = r.productionDate || '';
                row.insertCell().innerText = r.employeeNo || '';
                row.insertCell().innerText = r.employeeName || '';
                row.insertCell().innerText = r.workOrder || '';
                row.insertCell().innerText = r.process || '';
                row.insertCell().innerText = r.processCode || '';
                row.insertCell().innerText = r.laborTimeStart || '';
                row.insertCell().innerText = r.laborTimeEnd || '';
                let machineCodes = '';
                if (r.machineList && r.machineList.length > 0) {
                    machineCodes = r.machineList.map(function(m) { return m.machineCode; }).join('\n');
                } else {
                    machineCodes = r.machineCode || '';
                }
                row.insertCell().innerText = machineCodes;
                row.insertCell().innerText = r.machineTimeStart || '';
                row.insertCell().innerText = r.machineTimeEnd || '';
                row.insertCell().innerText = r.completedQty !== null && r.completedQty !== undefined ? r.completedQty : '';
                row.insertCell().innerText = r.scrapQty !== null && r.scrapQty !== undefined ? r.scrapQty : '';
                row.insertCell().innerText = r.remarks || '';
                const editCell = row.insertCell();
                const editBtn = document.createElement('button');
                editBtn.innerText = '編輯';
                editBtn.className = 'btn';
                editBtn.style.padding = '2px 8px';
                editBtn.style.fontSize = '12px';
                editBtn.addEventListener('click', function () {
                    loadToForm(r);
                });
                editCell.appendChild(editBtn);
            });
        });
}

employeeNo.addEventListener('blur', function () {
    const no = employeeNo.value.trim();
    if (!no) return;
    fetch('/api/employee/' + no)
        .then(function (res) {
            if (res.ok) return res.text();
            return null;
        })
        .then(function (name) {
            if (name) {
                window._employeeName = name;
                updateEmployeeInfo();
                loadReportList(productionDate.value, no);
            } else {
                window._employeeName = '';
                document.getElementById('employeeInfo').innerText = '';
                alert('找不到此員工編號！');
            }
        });
});

workOrder2.addEventListener('blur', function () {
    const order = workOrder1.value.trim() + '-' + workOrder2.value.trim();
    if (!workOrder1.value || !workOrder2.value) return;
    fetch('/api/workorder/' + order)
        .then(function (res) { return res.json(); })
        .then(function (data) {
            if (data) {
                document.getElementById('productNo').innerText = data.productNo;
                window._productNo = data.productNo;
                fetch('/api/process/byProduct/' + data.productNo)
                    .then(function (res) { return res.json(); })
                    .then(function (list) {
                        const select = document.getElementById('process');
                        select.innerHTML = '<option value="">--</option>';
                        list.forEach(function (p) {
                            const option = document.createElement('option');
                            option.value = p.processNo;
                            option.innerText = p.processNo;
                            select.appendChild(option);
                        });
                    });
            } else {
                document.getElementById('productNo').innerText = '';
                alert('無此製令號！');
            }
        });
});

laborTimeStart.addEventListener('input', function () {
    if (parseInt(document.getElementById('machineQty').value) > 0) {
        machineTimeStart.value = laborTimeStart.value;
    }
});

laborTimeEnd.addEventListener('input', function () {
    if (parseInt(document.getElementById('machineQty').value) > 0) {
        machineTimeStart.value = laborTimeStart.value;
        machineTimeEnd.value = laborTimeEnd.value;
    }
});

productionDate.addEventListener('change', function () {
    const no = employeeNo.value.trim();
    if (!no) return;
    updateEmployeeInfo();
    loadReportList(productionDate.value, no);
});

function updateEmployeeInfo() {
    const name = window._employeeName || '';
    const no = employeeNo.value.trim();
    const date = productionDate.value.trim();
    if (!name || !no || !date) {
        document.getElementById('employeeInfo').innerText = name;
        return;
    }
    fetch('/api/report/totalHours/' + no + '/' + date)
        .then(function (res) { return res.text(); })
        .then(function (hours) {
            document.getElementById('employeeInfo').innerText = name + '(' + hours + '小時)';
        });
}

document.getElementById('btnSave').addEventListener('click', function () {
    if (!productionDate.value) { alert('請填寫生產日期！'); productionDate.focus(); return; }
    if (!employeeNo.value) { alert('請填寫員工編號！'); employeeNo.focus(); return; }
    if (!workOrder1.value || !workOrder2.value) { alert('請填寫製令單！'); workOrder1.focus(); return; }
    if (!laborTimeStart.value || !laborTimeEnd.value || laborTimeStart.value === '0' || laborTimeEnd.value === '0') {
        alert('請填寫人時！');
        laborTimeStart.focus();
        return;
    }
    if (laborTimeStart.value.length !== 4 || laborTimeEnd.value.length !== 4) {
        alert('人時格式錯誤，請填寫4位數（例如：0800）！');
        laborTimeStart.focus();
        return;
    }

    const workOrder = workOrder1.value + '-' + workOrder2.value;
    const machines = [];
    const qty = parseInt(document.getElementById('machineQty').value);
    if (qty > 0) {
        if (!machineTimeStart.value || !machineTimeEnd.value || machineTimeStart.value === '0' || machineTimeEnd.value === '0') {
            alert('請填寫機時！');
            machineTimeStart.focus();
            return;
        }
        if (machineTimeStart.value.length !== 4 || machineTimeEnd.value.length !== 4) {
            alert('機時格式錯誤，請填寫4位數（例如：0800）！');
            machineTimeStart.focus();
            return;
        }
        for (let i = 1; i <= qty; i++) {
            const mc = document.getElementById('machineCode' + i);
            if (mc && !mc.value) {
                alert('請選擇機台！');
                mc.focus();
                return;
            }
        }
    }
    const machineSet = new Set();
    for (let i = 1; i <= qty; i++) {
        const mc = document.getElementById('machineCode' + i);
        if (mc) {
            const code = mc.value.trim();
            if (code && machineSet.has(code)) {
                alert('機台代號重複：' + code + '，請確認！');
                return;
            }
            if (code) machineSet.add(code);
            machines.push({
                machineCode: code,
                machineTimeStart: machineTimeStart.value,
                machineTimeEnd: machineTimeEnd.value
            });
        }
    }

    const data = {
        productionDate:   productionDate.value,
        employeeNo:       employeeNo.value,
        workOrder:        workOrder,
        productNo:        window._productNo || '',
        process:          process.value,
        machineCode:      machines.length > 0 ? machines[0].machineCode : '',
        completedQty:     completedQty.value !== '' ? parseInt(completedQty.value) : null,
        scrapQty:         scrapQty.value !== '' ? parseInt(scrapQty.value) : null,
        laborTimeStart:   laborTimeStart.value,
        laborTimeEnd:     laborTimeEnd.value,
        machineTimeStart: machineTimeStart.value,
        machineTimeEnd:   machineTimeEnd.value,
        remarks:          remarks.value,
        isComplete:       isComplete.checked,
        machines:         machines
    };

    const isEdit = !!window._editId;
    const url = isEdit ? '/api/report/update/' + window._editId : '/api/report/save';
    const method = isEdit ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(function (res) {
            if (res.ok) {
                const date = productionDate.value;
                const no = employeeNo.value;
                const name = window._employeeName;
                alert(isEdit ? '更新成功！' : '儲存成功！');
                window._editId = null;
                document.getElementById('btnSave').innerText = '確認送出';
                clearForm();
                productionDate.value = date;
                employeeNo.value = no;
                window._employeeName = name;
                updateEmployeeInfo();
                loadReportList(date, no);
            } else {
                alert(isEdit ? '更新失敗！' : '儲存失敗，請再試一次！');
            }
        })
        .catch(function (err) { alert('發生錯誤：' + err.message); });
});

document.getElementById('btnClear').addEventListener('click', function () { clearForm(); });

function clearForm() {
    employeeNo.value = '';
    workOrder1.value = '';
    workOrder2.value = '';
    process.value = '';
    completedQty.value = '';
    scrapQty.value = '';
    laborTimeStart.value = '';
    laborTimeEnd.value = '';
    machineTimeStart.value = '';
    machineTimeEnd.value = '';
    remarks.value = '';
    isComplete.checked = false;
    document.getElementById('employeeInfo').innerText = '';
    document.getElementById('processInput').value = '';
    document.getElementById('processCode').value = '';
    document.getElementById('productNo').innerText = '';
    document.getElementById('machineCodeCell').innerHTML = '';
    document.getElementById('machineCodeRow').style.display = 'none';
    document.getElementById('machineQty').value = '0';
    window._availableMachines = [];
    const select = document.getElementById('process');
    select.innerHTML = '<option value="">--</option>';
    document.getElementById('btnDelete').style.display = 'none';
    window._editId = null;
}

document.getElementById('btnDelete').addEventListener('click', function () {
    if (!window._editId) return;
    if (!confirm('確定要刪除此報工紀錄嗎？')) return;
    fetch('/api/report/delete/' + window._editId, { method: 'DELETE' })
        .then(function (res) {
            if (res.ok) {
                alert('刪除成功！');
                const date = productionDate.value;
                const no = employeeNo.value;
                clearForm();
                productionDate.value = date;
                employeeNo.value = no;
                window._employeeName = window._employeeName || '';
                updateEmployeeInfo();
                loadReportList(date, no);
            } else {
                alert('刪除失敗！');
            }
        });
});

// 製令工序選擇後自動帶出製程代碼和對應機台
document.getElementById('process').addEventListener('change', function () {
    const processNo = this.value;
    document.getElementById('processInput').value = processNo;
    if (!processNo) {
        document.getElementById('processCode').value = '';
        window._availableMachines = [];
        return;
    }
    fetch('/api/process/byProduct/' + (window._productNo || '') + '/' + processNo)
        .then(function (res) { return res.json(); })
        .then(function (data) {
            if (data.length > 0) {
                document.getElementById('processCode').value = data[0].processCode;
                const processCode = data[0].processCode;
                fetch('/api/machine/byProcess/' + processCode)
                    .then(function (res) { return res.json(); })
                    .then(function (machines) {
                        window._availableMachines = machines;
                        updateMachineInputs();
                    });
            } else {
                document.getElementById('processCode').value = '';
                window._availableMachines = [];
            }
        });
});

function updateMachineInputs() {
    const qty = parseInt(document.getElementById('machineQty').value);
    const machines = window._availableMachines || [];
    for (let i = 1; i <= qty; i++) {
        const mc = document.getElementById('machineCode' + i);
        if (mc) {
            const select = document.createElement('select');
            select.id = 'machineCode' + i;
            select.className = 'machine-input';
            select.innerHTML = '<option value="">--選擇機台--</option>';
            machines.forEach(function (m) {
                const option = document.createElement('option');
                option.value = m.machineCode;
                option.innerText = m.machineCode;
                select.appendChild(option);
            });
            mc.parentNode.replaceChild(select, mc);
        }
    }
}

// 機台數量選擇 → 動態產生機台代號輸入框
document.getElementById('machineQty').addEventListener('change', function () {
    const qty = parseInt(this.value);
    const row = document.getElementById('machineCodeRow');
    const cell = document.getElementById('machineCodeCell');
    cell.innerHTML = '';
    if (qty === 0) {
        row.style.display = 'none';
        machineTimeStart.value = '';
        machineTimeEnd.value = '';
    } else {
        row.style.display = '';
        machineTimeStart.value = laborTimeStart.value;
        machineTimeEnd.value = laborTimeEnd.value;
        for (let i = 1; i <= qty; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.id = 'machineCode' + i;
            input.className = 'machine-input';
            cell.appendChild(input);
        }
        setTimeout(function() { updateMachineInputs(); }, 50);
    }
});

document.getElementById('machineCodeRow').style.display = 'none';

function loadToForm(r) {
    window._editId = r.id;
    productionDate.value = r.productionDate || '';
    employeeNo.value = r.employeeNo || '';
    window._employeeName = r.employeeName || '';
    updateEmployeeInfo();
    workOrder1.value = (r.workOrder || '').split('-')[0] || '';
    workOrder2.value = (r.workOrder || '').split('-')[1] || '';
    document.getElementById('productNo').innerText = r.productNo || '';
    window._productNo = r.productNo || '';
    fetch('/api/process/byProduct/' + (r.productNo || ''))
        .then(function (res) { return res.json(); })
        .then(function (list) {
            const select = document.getElementById('process');
            select.innerHTML = '<option value="">--</option>';
            list.forEach(function (p) {
                const option = document.createElement('option');
                option.value = p.processNo;
                option.innerText = p.processNo;
                select.appendChild(option);
            });
            select.value = r.process || '';
            document.getElementById('processInput').value = r.process || '';
            document.getElementById('processCode').value = r.processCode || '';

            if (r.processCode) {
                fetch('/api/machine/byProcess/' + r.processCode)
                    .then(function (res) { return res.json(); })
                    .then(function (machines) {
                        window._availableMachines = machines;
                        const machineList = r.machineList || [];
                        document.getElementById('machineQty').value = machineList.length > 0 ? machineList.length : '0';
                        document.getElementById('machineQty').dispatchEvent(new Event('change'));
                        setTimeout(function () {
                            machineList.forEach(function (m, i) {
                                const mc = document.getElementById('machineCode' + (i + 1));
                                if (mc) mc.value = m.machineCode || '';
                            });
                        }, 200);
                    });
            }
        });
    laborTimeStart.value = r.laborTimeStart || '';
    laborTimeEnd.value = r.laborTimeEnd || '';
    machineTimeStart.value = r.machineTimeStart || '';
    machineTimeEnd.value = r.machineTimeEnd || '';
    completedQty.value = r.completedQty !== null && r.completedQty !== undefined ? r.completedQty : '';
    scrapQty.value = r.scrapQty !== null && r.scrapQty !== undefined ? r.scrapQty : '';
    remarks.value = r.remarks || '';
    isComplete.checked = r.isComplete || false;
    window.scrollTo(0, 0);
    document.getElementById('btnSave').innerText = '確認更新';
    document.getElementById('btnDelete').style.display = '';
}