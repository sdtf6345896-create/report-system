let currentEditId = null;
let currentEmployeeId = null;

document.addEventListener('DOMContentLoaded', function () {
    checkLogin();
});

function checkLogin() {
    fetch('/api/auth/check', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
            if (!data.loggedIn) {
                window.location.href = '/login.html';
                return;
            }
            if (data.role !== 'LEADER') {
                window.location.href = '/index.html';
                return;
            }
            currentEmployeeId = data.employeeId;
            loadLeaderInfo();
            loadEmployees();
            loadReports();
        });
}

function loadLeaderInfo() {
    fetch('/api/leader/info/' + currentEmployeeId, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
            document.getElementById('leaderInfo').innerText = data.deptName + ' － ' + data.leaderName + ' 組長';
            document.getElementById('deptName').innerText = data.deptName + ' 報工紀錄';
        });
}

function loadEmployees() {
    fetch('/api/leader/employees/' + currentEmployeeId, { credentials: 'include' })
        .then(res => res.json())
        .then(list => {
            const select = document.getElementById('filterEmployee');
            select.innerHTML = '<option value="">全部</option>';
            list.forEach(e => {
                const option = document.createElement('option');
                option.value = e.employeeNo;
                option.innerText = e.employeeName;
                select.appendChild(option);
            });
        });
}

function loadReports() {
    const date = document.getElementById('filterDate').value.trim();
    const empNo = document.getElementById('filterEmployee').value;

    let url = '/api/leader/reports/' + currentEmployeeId;
    const params = [];
    if (date) params.push('date=' + date);
    if (empNo) params.push('employeeNo=' + empNo);
    if (params.length > 0) url += '?' + params.join('&');

    fetch(url, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById('reportBody');
            tbody.innerHTML = '';

            if (data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="14" style="text-align:center;">查無報工紀錄</td></tr>';
                return;
            }

            const grouped = {};
            data.forEach(r => {
                const date = r.productionDate || '未知日期';
                if (!grouped[date]) grouped[date] = [];
                grouped[date].push(r);
            });

            const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

            sortedDates.forEach(date => {
                if (tbody.children.length > 0) {
                    const spaceRow = document.createElement('tr');
                    spaceRow.innerHTML = '<td colspan="14" style="height:15px;background:#f5f5f5;border:none;"></td>';
                    tbody.appendChild(spaceRow);
                }

                const dateRow = document.createElement('tr');
                dateRow.innerHTML = `
                    <td colspan="14" class="date-header">
                        ${date.substring(0, 4)}/${date.substring(4, 6)}/${date.substring(6, 8)}
                    </td>
                `;
                tbody.appendChild(dateRow);

                const headerRow = document.createElement('tr');
                headerRow.className = 'sub-header';
                headerRow.innerHTML = `
                    <td>人員</td>
                    <td>工號</td>
                    <td>製令</td>
                    <td>製令工序</td>
                    <td>製程代號</td>
                    <td>人時(起)</td>
                    <td>人時(迄)</td>
                    <td>機台</td>
                    <td>機時(起)</td>
                    <td>機時(迄)</td>
                    <td>數量</td>
                    <td>報廢數量</td>
                    <td>備註</td>
                    <td>操作</td>
                `;
                tbody.appendChild(headerRow);

                const groupedByEmp = {};
                grouped[date].forEach(r => {
                    const key = r.employeeNo;
                    if (!groupedByEmp[key]) groupedByEmp[key] = [];
                    groupedByEmp[key].push(r);
                });

                Object.keys(groupedByEmp).forEach(empNo => {
                    const empReports = groupedByEmp[empNo];
                    empReports.forEach((r, index) => {
                        const isFirst = index === 0;
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            ${isFirst ? `<td rowspan="${empReports.length}">${r.employeeName || ''}</td>` : ''}
                            ${isFirst ? `<td rowspan="${empReports.length}">${r.employeeNo || ''}</td>` : ''}
                            <td>${r.workOrder || ''}</td>
                            <td>${r.process || ''}</td>
                            <td>${r.processCode || ''}</td>
                            <td>${r.laborTimeStart || ''}</td>
                            <td>${r.laborTimeEnd || ''}</td>
                            <td>${r.machineList && r.machineList.length > 0 ? r.machineList.map(m => m.machineCode).join(', ') : r.machineCode || ''}</td>
                            <td>${r.machineTimeStart || ''}</td>
                            <td>${r.machineTimeEnd || ''}</td>
                            <td>${r.completedQty !== null ? r.completedQty : ''}</td>
                            <td>${r.scrapQty !== null ? r.scrapQty : ''}</td>
                            <td>${r.remarks || ''}</td>
                            <td><button class="btn-edit" onclick="openEdit(${JSON.stringify(r).replace(/"/g, '&quot;')})">編輯</button></td>
                        `;
                        tbody.appendChild(row);
                    });
                });
            });
        });
}

function clearFilter() {
    document.getElementById('filterDate').value = '';
    document.getElementById('filterEmployee').value = '';
    loadReports();
}

function openEdit(r) {
    currentEditId = r.id;
    window._editAvailableMachines = [];

    const orderParts = (r.workOrder || '').split('-');
    document.getElementById('editProductionDate').value = r.productionDate || '';
    document.getElementById('editWorkOrder1').value = orderParts[0] || '';
    document.getElementById('editWorkOrder2').value = orderParts[1] || '';
    document.getElementById('editLaborStart').value = r.laborTimeStart || '';
    document.getElementById('editLaborEnd').value = r.laborTimeEnd || '';
    document.getElementById('editMachineTimeStart').value = r.machineTimeStart || '';
    document.getElementById('editMachineTimeEnd').value = r.machineTimeEnd || '';
    document.getElementById('editCompletedQty').value = r.completedQty !== null ? r.completedQty : '';
    document.getElementById('editScrapQty').value = r.scrapQty !== null ? r.scrapQty : '';
    document.getElementById('editRemarks').value = r.remarks || '';
    document.getElementById('editIsComplete').checked = r.isComplete || false;

    window._editProductNo = r.productNo || '';
    fetch('/api/process/byProduct/' + (r.productNo || ''))
        .then(res => res.json())
        .then(list => {
            const select = document.getElementById('editProcess');
            select.innerHTML = '<option value="">--</option>';
            list.forEach(p => {
                const option = document.createElement('option');
                option.value = p.processNo;
                option.innerText = p.processNo;
                select.appendChild(option);
            });
            select.value = r.process || '';
            document.getElementById('editProcessCode').value = r.processCode || '';

            if (r.processCode) {
                fetch('/api/machine/byProcess/' + r.processCode)
                    .then(res => res.json())
                    .then(machines => {
                        window._editAvailableMachines = machines;
                        const machineList = r.machineList || [];
                        document.getElementById('editMachineQty').value = machineList.length > 0 ? machineList.length : '0';
                        onEditMachineQtyChange();
                        setTimeout(() => {
                            machineList.forEach((m, i) => {
                                const mc = document.getElementById('editMachineCode' + (i + 1));
                                if (mc) mc.value = m.machineCode || '';
                            });
                        }, 100);
                    });
            } else {
                document.getElementById('editMachineQty').value = '0';
                document.getElementById('editMachineArea').innerHTML = '';
            }
        });

    document.getElementById('editModal').classList.add('show');
    document.getElementById('editLaborStart').oninput = function() {
        if (document.getElementById('editMachineQty').value > 0) {
            document.getElementById('editMachineTimeStart').value = this.value;
        }
    };
    document.getElementById('editLaborEnd').oninput = function() {
        if (document.getElementById('editMachineQty').value > 0) {
            document.getElementById('editMachineTimeStart').value = document.getElementById('editLaborStart').value;
            document.getElementById('editMachineTimeEnd').value = this.value;
        }
    };
}

function loadEditProcessList() {
    const order1 = document.getElementById('editWorkOrder1').value.trim();
    const order2 = document.getElementById('editWorkOrder2').value.trim();
    if (!order1 || !order2) { alert('請輸入完整製令號！'); return; }
    const order = order1 + '-' + order2;

    fetch('/api/workorder/' + order)
        .then(res => res.json())
        .then(data => {
            if (!data) { alert('無此製令號！'); return Promise.reject(); }
            window._editProductNo = data.productNo;
            return fetch('/api/process/byProduct/' + data.productNo);
        })
        .then(res => res.json())
        .then(list => {
            const select = document.getElementById('editProcess');
            select.innerHTML = '<option value="">--</option>';
            list.forEach(p => {
                const option = document.createElement('option');
                option.value = p.processNo;
                option.innerText = p.processNo;
                select.appendChild(option);
            });
            document.getElementById('editProcessCode').value = '';
            window._editAvailableMachines = [];
            document.getElementById('editMachineArea').innerHTML = '';
        });
}

function onEditProcessChange() {
    const processNo = document.getElementById('editProcess').value;
    if (!processNo) {
        document.getElementById('editProcessCode').value = '';
        window._editAvailableMachines = [];
        return;
    }

    fetch('/api/process/byProduct/' + (window._editProductNo || '') + '/' + processNo)
        .then(res => res.json())
        .then(data => {
            if (data.length > 0) {
                document.getElementById('editProcessCode').value = data[0].processCode;
                fetch('/api/machine/byProcess/' + data[0].processCode)
                    .then(res => res.json())
                    .then(machines => {
                        window._editAvailableMachines = machines;
                        onEditMachineQtyChange();
                    });
            } else {
                document.getElementById('editProcessCode').value = '';
                window._editAvailableMachines = [];
            }
        });
}

function onEditMachineQtyChange() {
    const qty = parseInt(document.getElementById('editMachineQty').value);
    const area = document.getElementById('editMachineArea');
    area.innerHTML = '';
    const machines = window._editAvailableMachines || [];
    const laborStart = document.getElementById('editLaborStart').value;
    const laborEnd = document.getElementById('editLaborEnd').value;

    if (qty === 0) {
        document.getElementById('editMachineTimeStart').value = '';
        document.getElementById('editMachineTimeEnd').value = '';
    } else {
        document.getElementById('editMachineTimeStart').value = laborStart;
        document.getElementById('editMachineTimeEnd').value = laborEnd;
    }

    for (let i = 1; i <= qty; i++) {
        const div = document.createElement('div');
        div.className = 'form-group';
        div.innerHTML = `<label>機台${i}</label>`;

        const select = document.createElement('select');
        select.id = 'editMachineCode' + i;
        select.innerHTML = '<option value="">--選擇機台--</option>';
        machines.forEach(m => {
            const option = document.createElement('option');
            option.value = m.machineCode;
            option.innerText = m.machineCode;
            select.appendChild(option);
        });
        div.appendChild(select);
        area.appendChild(div);
    }
}

function closeModal() {
    document.getElementById('editModal').classList.remove('show');
    currentEditId = null;
}

function saveEdit() {
    const order1 = document.getElementById('editWorkOrder1').value.trim();
    const order2 = document.getElementById('editWorkOrder2').value.trim();
    const workOrder = order1 + '-' + order2;
    const qty = parseInt(document.getElementById('editMachineQty').value);
    const laborStart = document.getElementById('editLaborStart').value;
    const laborEnd = document.getElementById('editLaborEnd').value;
    const machineTimeStart = document.getElementById('editMachineTimeStart').value;
    const machineTimeEnd = document.getElementById('editMachineTimeEnd').value;

    if (!laborStart || !laborEnd || laborStart === '0' || laborEnd === '0') {
        alert('請填寫人時！'); return;
    }
    if (laborStart.length !== 4 || laborEnd.length !== 4) {
        alert('人時格式錯誤，請填寫4位數（例如：0800）！'); return;
    }
    if (qty > 0) {
        if (!machineTimeStart || !machineTimeEnd || machineTimeStart === '0' || machineTimeEnd === '0') {
            alert('請填寫機時！'); return;
        }
        if (machineTimeStart.length !== 4 || machineTimeEnd.length !== 4) {
            alert('機時格式錯誤，請填寫4位數（例如：0800）！'); return;
        }
        for (let i = 1; i <= qty; i++) {
            const mc = document.getElementById('editMachineCode' + i);
            if (mc && !mc.value) {
                alert('請選擇機台！'); return;
            }
        }
    }
    const machines = [];
    for (let i = 1; i <= qty; i++) {
        const mc = document.getElementById('editMachineCode' + i);
        if (mc && mc.value) {
            machines.push({
                machineCode: mc.value,
                machineTimeStart: document.getElementById('editMachineTimeStart').value,
                machineTimeEnd: document.getElementById('editMachineTimeEnd').value
            });
        }
    }

    const data = {
        productionDate: document.getElementById('editProductionDate').value,
        workOrder: workOrder,
        productNo: window._editProductNo || '',
        process: document.getElementById('editProcess').value,
        machineCode: machines.length > 0 ? machines[0].machineCode : '',
        laborTimeStart: document.getElementById('editLaborStart').value,
        laborTimeEnd: document.getElementById('editLaborEnd').value,
        machineTimeStart: document.getElementById('editMachineTimeStart').value,
        machineTimeEnd: document.getElementById('editMachineTimeEnd').value,
        completedQty: document.getElementById('editCompletedQty').value !== '' ? parseInt(document.getElementById('editCompletedQty').value) : null,
        scrapQty: document.getElementById('editScrapQty').value !== '' ? parseInt(document.getElementById('editScrapQty').value) : null,
        remarks: document.getElementById('editRemarks').value,
        isComplete: document.getElementById('editIsComplete').checked,
        machines: machines
    };

    fetch('/api/report/update/' + currentEditId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
    })
        .then(res => {
            if (res.ok) {
                alert('更新成功！');
                closeModal();
                loadReports();
            } else {
                alert('更新失敗！');
            }
        });
}

function deleteReport() {
    if (!confirm('確定要刪除此報工紀錄嗎？')) return;
    fetch('/api/report/delete/' + currentEditId, {
        method: 'DELETE',
        credentials: 'include'
    })
        .then(res => {
            if (res.ok) {
                alert('刪除成功！');
                closeModal();
                loadReports();
            } else {
                alert('刪除失敗！');
            }
        });
}

function logout() {
    fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
        .then(() => { window.location.href = '/login.html'; });
}

