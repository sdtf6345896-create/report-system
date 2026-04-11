let currentEditId = null;

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
            if (data.role !== 'ADMIN') {
                window.location.href = '/index.html';
                return;
            }
            loadDepartments();
            loadReports();
        });
}

function switchTab(tab, btn) {
    document.getElementById('tab-report').style.display = 'none';
    document.getElementById('tab-hours').style.display = 'none';
    document.getElementById('tab-' + tab).style.display = 'block';
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
}

function toggleHoursFilter() {
    const type = document.getElementById('hoursType').value;
    document.getElementById('empFilter').style.display = type === 'employee' ? '' : 'none';
    document.getElementById('machineFilter').style.display = type === 'machine' ? '' : 'none';
}

function loadDepartments() {
    fetch('/api/admin/departments', { credentials: 'include' })
        .then(res => res.json())
        .then(depts => {
            ['filterDept', 'filterHoursDept'].forEach(id => {
                const select = document.getElementById(id);
                select.innerHTML = '<option value="">全部</option>';
                depts.forEach(d => {
                    const option = document.createElement('option');
                    option.value = d.id;
                    option.innerText = d.deptName;
                    select.appendChild(option);
                });
            });
        });

    fetch('/api/admin/employees', { credentials: 'include' })
        .then(res => res.json())
        .then(emps => {
            ['filterEmployee', 'filterHoursEmp'].forEach(id => {
                const select = document.getElementById(id);
                select.innerHTML = '<option value="">全部</option>';
                emps.forEach(e => {
                    const option = document.createElement('option');
                    option.value = e.employeeNo;
                    option.innerText = e.employeeName;
                    select.appendChild(option);
                });
            });
        });
}

function loadReports() {
    const date = document.getElementById('filterDate').value.trim();
    const deptId = document.getElementById('filterDept').value;
    const empNo = document.getElementById('filterEmployee').value;

    let url = '/api/admin/reports';
    const params = [];
    if (date) params.push('date=' + date);
    if (deptId) params.push('deptId=' + deptId);
    if (empNo) params.push('employeeNo=' + empNo);
    if (params.length > 0) url += '?' + params.join('&');

    fetch(url, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById('reportBody');
            tbody.innerHTML = '';

            if (data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="15" style="text-align:center;">查無報工紀錄</td></tr>';
                return;
            }

            const groupedByDate = {};
            data.forEach(item => {
                const d = item.report.productionDate || '未知日期';
                if (!groupedByDate[d]) groupedByDate[d] = [];
                groupedByDate[d].push(item);
            });

            const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

            sortedDates.forEach(date => {
                if (tbody.children.length > 0) {
                    const spaceRow = document.createElement('tr');
                    spaceRow.innerHTML = '<td colspan="15" style="height:15px;background:#f5f5f5;border:none;"></td>';
                    tbody.appendChild(spaceRow);
                }

                const dateRow = document.createElement('tr');
                dateRow.className = 'date-header';
                dateRow.innerHTML = `<td colspan="15">${date.substring(0,4)}/${date.substring(4,6)}/${date.substring(6,8)}</td>`;
                tbody.appendChild(dateRow);

                const headerRow = document.createElement('tr');
                headerRow.className = 'sub-header';
                headerRow.innerHTML = `
                    <td>組別</td><td>人員</td><td>工號</td><td>製令</td>
                    <td>製令工序</td><td>製程代號</td><td>人時(起)</td><td>人時(迄)</td>
                    <td>機台</td><td>機時(起)</td><td>機時(迄)</td>
                    <td>數量</td><td>報廢數量</td><td>備註</td><td>操作</td>
                `;
                tbody.appendChild(headerRow);

                const groupedByDept = {};
                groupedByDate[date].forEach(item => {
                    const dept = item.deptName || '未分組';
                    if (!groupedByDept[dept]) groupedByDept[dept] = [];
                    groupedByDept[dept].push(item);
                });

                Object.keys(groupedByDept).forEach(deptName => {
                    const deptItems = groupedByDept[deptName];
                    const groupedByEmp = {};
                    deptItems.forEach(item => {
                        const key = item.report.employeeNo;
                        if (!groupedByEmp[key]) groupedByEmp[key] = [];
                        groupedByEmp[key].push(item);
                    });

                    let deptFirstRow = true;
                    const deptRowCount = deptItems.length;

                    Object.keys(groupedByEmp).forEach(empNo => {
                        const empItems = groupedByEmp[empNo];
                        empItems.forEach((item, index) => {
                            const r = item.report;
                            const isFirstEmp = index === 0;
                            const row = document.createElement('tr');
                            let html = '';

                            if (deptFirstRow) {
                                html += `<td rowspan="${deptRowCount}" class="dept-cell">${deptName}</td>`;
                                deptFirstRow = false;
                            }

                            if (isFirstEmp) {
                                html += `<td rowspan="${empItems.length}" class="emp-cell">${item.employeeName || ''}</td>`;
                                html += `<td rowspan="${empItems.length}" class="emp-cell">${r.employeeNo || ''}</td>`;
                            }

                            html += `
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
                            row.innerHTML = html;
                            tbody.appendChild(row);
                        });
                    });
                });
            });
        });
}

function loadHoursStats() {
    const type = document.getElementById('hoursType').value;

    if (type === 'employee') {
        const deptId = document.getElementById('filterHoursDept').value;
        const empNo = document.getElementById('filterHoursEmp').value;
        let url = '/api/admin/stats/employee';
        const params = [];
        if (deptId) params.push('deptId=' + deptId);
        if (empNo) params.push('employeeNo=' + empNo);
        if (params.length > 0) url += '?' + params.join('&');
        fetch(url, { credentials: 'include' })
            .then(res => res.json())
            .then(data => renderEmpStats(data));
    } else {
        const machineCode = document.getElementById('filterMachine').value.trim();
        let url = '/api/admin/stats/machine';
        if (machineCode) url += '?machineCode=' + machineCode;
        fetch(url, { credentials: 'include' })
            .then(res => res.json())
            .then(data => renderMachineStats(data));
    }
}

function renderEmpStats(data) {
    const tbody = document.getElementById('hoursBody');
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">查無資料</td></tr>';
        return;
    }

    const headerRow = document.createElement('tr');
    headerRow.className = 'hours-header';
    headerRow.innerHTML = '<td>組別</td><td>員工</td><td>工號</td><td>總工時</td><td>細項</td>';
    tbody.appendChild(headerRow);

    const groupedByDept = {};
    data.forEach(item => {
        const dept = item.deptName || '未分組';
        if (!groupedByDept[dept]) groupedByDept[dept] = [];
        groupedByDept[dept].push(item);
    });

    Object.keys(groupedByDept).forEach(deptName => {
        const deptItems = groupedByDept[deptName];
        deptItems.forEach((item, index) => {
            const isFirst = index === 0;
            const row = document.createElement('tr');
            let html = '';

            if (isFirst) {
                html += `<td rowspan="${deptItems.length}" class="dept-cell">${deptName}</td>`;
            }

            html += `
                <td class="emp-cell">${item.employeeName || ''}</td>
                <td class="emp-cell">${item.employeeNo || ''}</td>
                <td>${item.totalHours} 小時</td>
                <td><button class="btn-edit" onclick='showEmpDetail(${JSON.stringify(item)})'>細項</button></td>
            `;
            row.innerHTML = html;
            tbody.appendChild(row);
        });
    });
}

function renderMachineStats(data) {
    const tbody = document.getElementById('hoursBody');
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">查無資料</td></tr>';
        return;
    }

    const headerRow = document.createElement('tr');
    headerRow.className = 'hours-header';
    headerRow.innerHTML = '<td>機台類型</td><td>機台</td><td>總工時</td><td>細項</td>';
    tbody.appendChild(headerRow);

    const groupedByType = {};
    data.forEach(item => {
        const type = item.machineType || '未分類';
        if (!groupedByType[type]) groupedByType[type] = [];
        groupedByType[type].push(item);
    });

    Object.keys(groupedByType).forEach(typeName => {
        const typeItems = groupedByType[typeName];
        typeItems.forEach((item, index) => {
            const isFirst = index === 0;
            const row = document.createElement('tr');
            let html = '';

            if (isFirst) {
                html += `<td rowspan="${typeItems.length}" class="dept-cell">${typeName}</td>`;
            }

            html += `
                <td>${item.machineCode || ''}</td>
                <td>${item.totalHours} 小時</td>
                <td><button class="btn-edit" onclick='showMachineDetail(${JSON.stringify(item)})'>細項</button></td>
            `;
            row.innerHTML = html;
            tbody.appendChild(row);
        });
    });
}

function showEmpDetail(item) {
    document.getElementById('detailTitle').innerText = item.employeeName + ' 工時細項';
    const tbody = document.getElementById('detailBody');
    tbody.innerHTML = '<tr class="hours-header"><td>日期</td><td>工時</td></tr>';

    if (!item.details || item.details.length === 0) {
        tbody.innerHTML += '<tr><td colspan="2" style="text-align:center;">尚無紀錄</td></tr>';
    } else {
        item.details.forEach(d => {
            const date = d.date || '';
            const formatted = date.length === 8 ?
                `${date.substring(0,4)}/${date.substring(4,6)}/${date.substring(6,8)}` : date;
            const row = document.createElement('tr');
            row.innerHTML = `<td>${formatted}</td><td>${d.hours} 小時</td>`;
            tbody.appendChild(row);
        });
    }
    document.getElementById('detailModal').classList.add('show');
}

function showMachineDetail(item) {
    document.getElementById('detailTitle').innerText = item.machineCode + ' 工時細項';
    const tbody = document.getElementById('detailBody');
    tbody.innerHTML = '<tr class="hours-header"><td>日期</td><td>工時</td></tr>';

    if (!item.details || item.details.length === 0) {
        tbody.innerHTML += '<tr><td colspan="2" style="text-align:center;">尚無紀錄</td></tr>';
    } else {
        item.details.forEach(d => {
            const date = d.date || '';
            const formatted = date.length === 8 ?
                `${date.substring(0,4)}/${date.substring(4,6)}/${date.substring(6,8)}` : date;
            const row = document.createElement('tr');
            row.innerHTML = `<td>${formatted}</td><td>${d.hours} 小時</td>`;
            tbody.appendChild(row);
        });
    }
    document.getElementById('detailModal').classList.add('show');
}

function closeDetailModal() {
    document.getElementById('detailModal').classList.remove('show');
}

function clearFilter() {
    document.getElementById('filterDate').value = '';
    document.getElementById('filterDept').value = '';
    document.getElementById('filterEmployee').value = '';
    loadReports();
}

function clearHoursFilter() {
    document.getElementById('filterHoursDept').value = '';
    document.getElementById('filterHoursEmp').value = '';
    document.getElementById('filterMachine').value = '';
    document.getElementById('hoursBody').innerHTML = '<tr><td colspan="5" style="text-align:center;">請選擇條件後按查詢</td></tr>';
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

    fetch('/api/process/byOrder/' + (r.workOrder || ''))
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
}

function loadEditProcessList() {
    const order1 = document.getElementById('editWorkOrder1').value.trim();
    const order2 = document.getElementById('editWorkOrder2').value.trim();
    if (!order1 || !order2) { alert('請輸入完整製令號！'); return; }
    const order = order1 + '-' + order2;

    fetch('/api/process/byOrder/' + order)
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
    const order1 = document.getElementById('editWorkOrder1').value.trim();
    const order2 = document.getElementById('editWorkOrder2').value.trim();
    const order = order1 + '-' + order2;

    fetch('/api/process/byOrder/' + order + '/' + processNo)
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