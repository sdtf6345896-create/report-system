let currentEditId = null;
let currentMachineId = null;

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
    ['report', 'hours', 'master', 'employee', 'machine'].forEach(t => {
        document.getElementById('tab-' + t).style.display = 'none';
    });
    document.getElementById('tab-' + tab).style.display = 'block';
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    if (tab === 'master') { loadProductNos(); loadProductList(); }
    if (tab === 'employee') {
        loadEmployeeList();
        fetch('/api/admin/departments', { credentials: 'include' })
            .then(res => res.json())
            .then(depts => {
                const filterSelect = document.getElementById('filterEmpDept');
                filterSelect.innerHTML = '<option value="">全部</option>';
                depts.forEach(d => {
                    const option = document.createElement('option');
                    option.value = d.id;
                    option.innerText = d.deptName;
                    filterSelect.appendChild(option);
                });
            });
    }
    if (tab === 'machine') {
        loadMachineFilters();
        loadMachineList();
    }
}

// ===================== 機台管理 =====================

function toggleMachineFilter() {
    const type = document.getElementById('machineFilterType').value;
    document.getElementById('machineTypeFilter').style.display = type === 'type' ? '' : 'none';
    document.getElementById('machineProcessFilter').style.display = type === 'process' ? '' : 'none';
}

function loadMachineFilters() {
    fetch('/api/machine/list', { credentials: 'include' })
        .then(res => res.json())
        .then(list => {
            // 機台類型下拉
            const typeNames = [...new Set(list.map(m => m.machineType).filter(Boolean))];
            const typeSelect = document.getElementById('filterMachineTypeName');
            typeSelect.innerHTML = '<option value="">全部</option>';
            typeNames.forEach(t => {
                const option = document.createElement('option');
                option.value = t;
                option.innerText = t;
                typeSelect.appendChild(option);
            });

            // 製程類型下拉
            const processTypes = [...new Set(list.map(m => m.processType).filter(Boolean))];
            const processSelect = document.getElementById('filterMachineType');
            processSelect.innerHTML = '<option value="">全部</option>';
            processTypes.forEach(t => {
                const option = document.createElement('option');
                option.value = t;
                option.innerText = t;
                processSelect.appendChild(option);
            });
        });
}

function loadMachineList() {
    const filterMode = document.getElementById('machineFilterType').value;
    const typeName = filterMode === 'type' ? document.getElementById('filterMachineTypeName').value : '';
    const processType = filterMode === 'process' ? document.getElementById('filterMachineType').value : '';

    fetch('/api/machine/list', { credentials: 'include' })
        .then(res => res.json())
        .then(list => {
            // 前端篩選
            if (typeName) list = list.filter(m => m.machineType === typeName);
            if (processType) list = list.filter(m => m.processType === processType);

            const tbody = document.getElementById('machineBody');
            tbody.innerHTML = '';

            if (list.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">查無機台資料</td></tr>';
                return;
            }

            // 依 machineType 分組
            const grouped = {};
            list.forEach(m => {
                const type = m.machineType || '未分類';
                if (!grouped[type]) grouped[type] = [];
                grouped[type].push(m);
            });

            Object.keys(grouped).forEach(typeName => {
                // 群組標題列
                const titleRow = document.createElement('tr');
                titleRow.className = 'date-header';
                titleRow.innerHTML = `<td colspan="4">${typeName}</td>`;
                tbody.appendChild(titleRow);

                // 子表頭
                const headerRow = document.createElement('tr');
                headerRow.className = 'sub-header';
                headerRow.innerHTML = '<td>機台類型</td><td>機台編號</td><td>製程類型</td><td>操作</td>';
                tbody.appendChild(headerRow);

                // 資料列
                grouped[typeName].forEach(m => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${m.machineType || ''}</td>
                        <td>${m.machineCode || ''}</td>
                        <td>${m.processType || ''}</td>
                        <td>
                            <button class="btn-edit" style="font-size:12px;padding:3px 8px;margin-right:4px;"
                                onclick="openEditMachine(${JSON.stringify(m).replace(/"/g, '&quot;')})">編輯</button>
                            <button class="btn-delete" style="font-size:12px;padding:3px 8px;"
                                onclick="deleteMachine(${m.id})">刪除</button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            });
        });
}

function clearMachineFilter() {
    document.getElementById('filterMachineTypeName').value = '';
    document.getElementById('filterMachineType').value = '';
    document.getElementById('machineFilterType').value = 'type';
    toggleMachineFilter();
    loadMachineList();
}

function openAddMachine() {
    currentMachineId = null;
    document.getElementById('machineModalTitle').innerText = '新增機台';
    document.getElementById('machineCode').value = '';
    document.getElementById('machineType').value = '';
    document.getElementById('machineProcessType').value = '';
    document.getElementById('addMachineModal').classList.add('show');
}

function openEditMachine(m) {
    currentMachineId = m.id;
    document.getElementById('machineModalTitle').innerText = '編輯機台';
    document.getElementById('machineCode').value = m.machineCode || '';
    document.getElementById('machineType').value = m.machineType || '';
    document.getElementById('machineProcessType').value = m.processType || '';
    document.getElementById('addMachineModal').classList.add('show');
}

function closeAddMachine() {
    document.getElementById('addMachineModal').classList.remove('show');
    currentMachineId = null;
}

function saveMachine() {
    const machineCode = document.getElementById('machineCode').value.trim();
    const machineType = document.getElementById('machineType').value.trim();
    const processType = document.getElementById('machineProcessType').value.trim().toUpperCase();

    if (!machineCode) { alert('請輸入機台編號！'); return; }
    if (!processType) { alert('請輸入製程類型！'); return; }

    const body = { machineCode, machineType, processType };
    const isEdit = currentMachineId !== null;
    const url = isEdit ? '/api/machine/' + currentMachineId : '/api/machine/save';
    const method = isEdit ? 'PUT' : 'POST';

    fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
    })
        .then(res => {
            if (res.ok) {
                alert(isEdit ? '修改成功！' : '新增成功！');
                closeAddMachine();
                loadMachineFilters();
                loadMachineList();
            } else {
                alert(isEdit ? '修改失敗！' : '新增失敗！');
            }
        });
}

function deleteMachine(id) {
    if (!confirm('確定要刪除此機台嗎？')) return;
    fetch('/api/machine/' + id, {
        method: 'DELETE',
        credentials: 'include'
    })
        .then(res => {
            if (res.ok) {
                alert('刪除成功！');
                loadMachineFilters();
                loadMachineList();
            } else {
                alert('刪除失敗！');
            }
        });
}

// ===================== 以下原本的 JS =====================

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
                    spaceRow.innerHTML = '<td colspan="15" style="height:8px;background:transparent;border:none;"></td>';
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
            if (mc && !mc.value) { alert('請選擇機台！'); return; }
        }
    }

    const machines = [];
    for (let i = 1; i <= qty; i++) {
        const mc = document.getElementById('editMachineCode' + i);
        if (mc && mc.value) {
            machines.push({
                machineCode: mc.value,
                machineTimeStart: machineTimeStart,
                machineTimeEnd: machineTimeEnd
            });
        }
    }

    const data = {
        productionDate: document.getElementById('editProductionDate').value,
        workOrder: workOrder,
        productNo: window._editProductNo || '',
        process: document.getElementById('editProcess').value,
        machineCode: machines.length > 0 ? machines[0].machineCode : '',
        laborTimeStart: laborStart,
        laborTimeEnd: laborEnd,
        machineTimeStart: machineTimeStart,
        machineTimeEnd: machineTimeEnd,
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

function loadProductNos() {
    fetch('/api/process/allProductNos', { credentials: 'include' })
        .then(res => res.json())
        .then(productNos => {
            ['newOrderProductNo', 'addOrderProductNo'].forEach(id => {
                const select = document.getElementById(id);
                if (!select) return;
                select.innerHTML = '<option value="">--選擇品號--</option>';
                productNos.forEach(p => {
                    const option = document.createElement('option');
                    option.value = p;
                    option.innerText = p;
                    select.appendChild(option);
                });
            });
        });
}

function switchMaster(sub, btn) {
    document.getElementById('master-product').style.display = 'none';
    document.getElementById('master-order').style.display = 'none';
    document.getElementById('master-' + sub).style.display = 'block';
    document.querySelectorAll('.btn-sub').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (sub === 'product') loadProductList();
    if (sub === 'order') loadOrderList();
}

function loadProductList() {
    fetch('/api/process/allProductNos', { credentials: 'include' })
        .then(res => res.json())
        .then(productNos => {
            const tbody = document.getElementById('productBody');
            tbody.innerHTML = '';
            const headerRow = document.createElement('tr');
            headerRow.className = 'sub-header';
            headerRow.innerHTML = '<td>品號</td><td>工序數量</td><td>操作</td>';
            tbody.appendChild(headerRow);
            if (productNos.length === 0) {
                tbody.innerHTML += '<tr><td colspan="3" style="text-align:center;">查無品號</td></tr>';
                return;
            }
            productNos.forEach(p => {
                fetch('/api/process/byProduct/' + p)
                    .then(res => res.json())
                    .then(processes => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${p}</td>
                            <td>${processes.length}</td>
                            <td><button class="btn-edit" onclick="openProductDetail('${p}')">查看/編輯</button></td>
                        `;
                        tbody.appendChild(row);
                    });
            });
        });
}

function loadOrderList() {
    fetch('/api/workorder/list', { credentials: 'include' })
        .then(res => res.json())
        .then(list => {
            const tbody = document.getElementById('orderBody');
            tbody.innerHTML = '';
            const headerRow = document.createElement('tr');
            headerRow.className = 'sub-header';
            headerRow.innerHTML = '<td>製令號</td><td>品號</td><td>操作</td>';
            tbody.appendChild(headerRow);
            if (list.length === 0) {
                tbody.innerHTML += '<tr><td colspan="3" style="text-align:center;">查無製令</td></tr>';
                return;
            }
            list.forEach(w => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${w.orderNo}</td>
                    <td>${w.productNo || ''}</td>
                    <td><button class="btn-delete" style="font-size:12px;padding:3px 8px;" onclick="deleteOrder(${w.id})">刪除</button></td>
                `;
                tbody.appendChild(row);
            });
        });
}

function openAddProduct() {
    document.getElementById('addProductNo').value = '';
    document.getElementById('addProductImage').value = '';
    const table = document.getElementById('addProcessTable');
    while (table.rows.length > 1) table.deleteRow(1);
    document.getElementById('addProductModal').classList.add('show');
}

function closeAddProduct() {
    document.getElementById('addProductModal').classList.remove('show');
}

function addProcessRow() {
    const table = document.getElementById('addProcessTable');
    const row = table.insertRow();
    row.innerHTML = `
        <td><input type="text" placeholder="0010" style="width:70px;" /></td>
        <td><input type="text" placeholder="EH21" style="width:70px;" /></td>
        <td><input type="text" placeholder="組裝" style="width:80px;" /></td>
        <td><button class="btn-delete" style="font-size:12px;padding:3px 8px;" onclick="this.closest('tr').remove()">刪除</button></td>
    `;
}

function saveNewProduct() {
    const productNo = document.getElementById('addProductNo').value.trim();
    if (!productNo) { alert('請輸入品號！'); return; }

    const table = document.getElementById('addProcessTable');
    const processes = [];
    for (let i = 1; i < table.rows.length; i++) {
        const row = table.rows[i];
        const inputs = row.querySelectorAll('input');
        if (inputs[0].value && inputs[1].value && inputs[2].value) {
            processes.push({
                processNo: inputs[0].value.trim(),
                processCode: inputs[1].value.trim(),
                processName: inputs[2].value.trim()
            });
        }
    }

    if (processes.length === 0) { alert('請至少新增一筆工序！'); return; }

    const imageFile = document.getElementById('addProductImage').files[0];

    const saveProcesses = () => {
        const promises = processes.map(p =>
            fetch('/api/admin/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ productNo, ...p })
            })
        );
        Promise.all(promises).then(() => {
            closeAddProduct();
            loadProductList();
            loadProductNos();
            openProductDetail(productNo);
        });
    };

    if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('productNo', productNo);
        formData.append('processNo', 'product');
        formData.append('docType', 'IMG');
        fetch('/api/admin/upload', {
            method: 'POST',
            credentials: 'include',
            body: formData
        }).then(() => saveProcesses());
    } else {
        saveProcesses();
    }
}

function openAddOrder() {
    document.getElementById('addOrderNo1').value = '';
    document.getElementById('addOrderNo2').value = '';
    loadProductNos();
    document.getElementById('addOrderModal').classList.add('show');
}

function closeAddOrder() {
    document.getElementById('addOrderModal').classList.remove('show');
}

function saveNewOrder() {
    const order1 = document.getElementById('addOrderNo1').value.trim();
    const order2 = document.getElementById('addOrderNo2').value.trim();
    const productNo = document.getElementById('addOrderProductNo').value;
    if (!order1 || !order2) { alert('請輸入完整製令號！'); return; }
    if (!productNo) { alert('請選擇品號！'); return; }

    fetch('/api/admin/workorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ orderNo: order1 + '-' + order2, productNo })
    }).then(res => {
        if (res.ok) {
            alert('製令新增成功！');
            closeAddOrder();
            loadOrderList();
        } else {
            alert('新增失敗，製令可能已存在！');
        }
    });
}

function deleteOrder(id) {
    if (!confirm('確定要刪除此製令嗎？')) return;
    fetch('/api/admin/workorder/' + id, {
        method: 'DELETE',
        credentials: 'include'
    }).then(res => {
        if (res.ok) {
            alert('刪除成功！');
            loadOrderList();
        } else {
            alert('刪除失敗！');
        }
    });
}

function saveProductImage() {
    const productNo = document.getElementById('detailProductNo').value;
    const file = document.getElementById('updateProductImage').files[0];
    if (!file) { alert('請先選擇圖片！'); return; }
    uploadDoc(productNo, 'product', 'IMG', document.getElementById('updateProductImage'));
}

function deleteProductImage() {
    const productNo = document.getElementById('detailProductNo').value;
    if (!confirm('確定要刪除此品號圖片嗎？')) return;

    fetch('/api/document/' + productNo)
        .then(res => res.json())
        .then(docs => {
            const imgDoc = docs.find(d => d.docType === 'IMG' && d.processNo === 'product');
            if (!imgDoc) { alert('沒有圖片可刪除！'); return; }

            // 刪除後端文件紀錄（需要後端支援）
            // 這裡先清除前端顯示
            document.getElementById('detailProductImage').innerHTML = '';
            document.getElementById('updateProductImage').value = '';
            alert('圖片已移除！');
        });
}

function zoomProductImage() {
    const img = document.querySelector('#detailProductImage img');
    if (!img) return;
    document.getElementById('zoomImg').src = img.src;
    document.getElementById('imageZoomModal').style.display = 'flex';
}

function openProductDetail(productNo) {
    document.getElementById('detailProductNo').value = productNo;
    document.getElementById('detailProductImage').innerHTML = '';
    document.getElementById('updateProductImage').value = '';

// 查詢品號圖片
    fetch('/api/document/' + productNo)
        .then(res => res.json())
        .then(docs => {
            const imgDoc = docs.find(d => d.docType === 'IMG' && d.processNo === 'product');
            if (imgDoc) {
                document.getElementById('detailProductImage').innerHTML = `
                <img src="/api/document/image/${imgDoc.filePath}"
                     style="width:120px;height:120px;object-fit:cover;margin-bottom:8px;border-radius:4px;"><br>
            `;
            }
        });

    fetch('/api/process/byProduct/' + productNo)
        .then(res => res.json())
        .then(processes => {
            const table = document.getElementById('detailProcessTable');
            while (table.rows.length > 1) table.deleteRow(1);
            processes.forEach(p => {
                const row = table.insertRow();
                row.innerHTML = `
                    <td>${p.processNo}</td>
                    <td>${p.processCode}</td>
                    <td>${p.processName || ''}</td>
                    <td id="sop_${p.processNo}">
                        <input type="file" accept="image/*" style="font-size:11px;" onchange="uploadDoc('${productNo}', '${p.processNo}', 'SOP', this)" />
                    </td>
                    <td id="sip_${p.processNo}">
                        <input type="file" accept="image/*" style="font-size:11px;" onchange="uploadDoc('${productNo}', '${p.processNo}', 'SIP', this)" />
                    </td>
                    <td>
                        <button class="btn-edit" style="font-size:12px;padding:3px 8px;margin-right:4px;" onclick="openEditProcess('${productNo}', '${p.processNo}', '${p.processCode}', '${p.processName || ''}')">編輯</button>
                        <button class="btn-delete" style="font-size:12px;padding:3px 8px;" onclick="deleteProcess('${productNo}', '${p.processNo}')">刪除</button>
                    </td>
                `;

                fetch('/api/document/' + productNo + '/' + p.processNo)
                    .then(res => res.json())
                    .then(docs => {
                        docs.forEach(doc => {
                            const cellId = doc.docType === 'SOP' ? 'sop_' + p.processNo : 'sip_' + p.processNo;
                            const cell = document.getElementById(cellId);
                            if (cell) {
                                cell.innerHTML = `
                                    <span style="color:green;font-size:11px;">✔ ${doc.filePath ? doc.filePath.split('/').pop() : ''}</span>
                                    <br>
                                    <input type="file" accept="image/*" style="font-size:11px;" onchange="uploadDoc('${productNo}', '${p.processNo}', '${doc.docType}', this)" />
                                `;
                            }
                        });
                    });
            });
        });

    document.getElementById('productDetailModal').classList.add('show');


}

function closeProductDetail() {
    document.getElementById('productDetailModal').classList.remove('show');
}

function deleteProduct() {
    const productNo = document.getElementById('detailProductNo').value;
    if (!confirm('確定要刪除品號 ' + productNo + ' 及所有工序嗎？')) return;
    fetch('/api/admin/product/' + encodeURIComponent(productNo), {
        method: 'DELETE',
        credentials: 'include'
    }).then(res => {
        if (res.ok) {
            alert('刪除成功！');
            closeProductDetail();
            loadProductList();
        } else {
            alert('刪除失敗！');
        }
    });
}

function uploadDoc(productNo, processNo, docType, input) {
    const file = input.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('productNo', productNo);
    formData.append('processNo', processNo);
    formData.append('docType', docType);

    fetch('/api/admin/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
    }).then(res => {
        if (res.ok) {
            return res.json();
        } else {
            throw new Error('上傳失敗');
        }
    }).then(data => {
        alert(docType + ' 上傳成功！');
        if (docType === 'IMG') {
            document.getElementById('detailProductImage').innerHTML = `
                <img src="/api/document/image/${data.fileName}"
                     style="width:100px;height:100px;object-fit:cover;border-radius:6px;cursor:pointer;"
                     onclick="zoomProductImage()" />
            `;
            document.getElementById('updateProductImage').value = '';
        } else {
            const cell = input.parentNode;
            cell.innerHTML = `
                <span style="color:green;font-size:11px;">✔ ${data.fileName ? data.fileName.split('/').pop() : ''}</span>
                <br>
                <input type="file" accept="image/*" style="font-size:11px;" onchange="uploadDoc('${productNo}', '${processNo}', '${docType}', this)" />
            `;
        }
    }).catch(err => {
        alert('上傳失敗：' + err.message);
        input.value = '';
    });
}

function loadEmployeeList(deptId) {
    fetch('/api/admin/employees', { credentials: 'include' })
        .then(res => res.json())
        .then(emps => {
            if (deptId) emps = emps.filter(e => String(e.deptId) === String(deptId));
            const tbody = document.getElementById('employeeBody');
            tbody.innerHTML = '';
            const headerRow = document.createElement('tr');
            headerRow.className = 'sub-header';
            headerRow.innerHTML = '<td>員工編號</td><td>姓名</td><td>部門</td><td>到職日期</td><td>操作</td>';
            tbody.appendChild(headerRow);
            if (emps.length === 0) {
                tbody.innerHTML += '<tr><td colspan="5" style="text-align:center;">查無員工</td></tr>';
                return;
            }
            emps.forEach(e => {
                const row = document.createElement('tr');
                const hireDate = e.hireDate ? e.hireDate.substring(0,4) + '/' + e.hireDate.substring(4,6) + '/' + e.hireDate.substring(6,8) : '';
                row.innerHTML = `
                    <td>${e.employeeNo}</td>
                    <td>${e.employeeName}</td>
                    <td>${e.deptName || ''}</td>
                    <td>${hireDate}</td>
                    <td>
                        <button class="btn-edit" style="font-size:12px;padding:3px 8px;margin-right:4px;" onclick="openEditEmployee(${JSON.stringify(e).replace(/"/g, '&quot;')})">細項</button>
                        <button class="btn-delete" style="font-size:12px;padding:3px 8px;" onclick="deleteEmployee('${e.employeeNo}')">刪除</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        });
}

function openAddEmployee() {
    fetch('/api/admin/employees', { credentials: 'include' })
        .then(res => res.json())
        .then(emps => {
            let maxNo = 0;
            emps.forEach(e => {
                const no = parseInt(e.employeeNo);
                if (!isNaN(no) && no > maxNo) maxNo = no;
            });
            const nextNo = String(maxNo + 1).padStart(5, '0');
            document.getElementById('newEmpNo').value = nextNo;
        });

    const select = document.getElementById('newEmpDept');
    select.innerHTML = '<option value="">--選擇部門--</option>';
    fetch('/api/admin/departments', { credentials: 'include' })
        .then(res => res.json())
        .then(depts => {
            depts.forEach(d => {
                const option = document.createElement('option');
                option.value = d.id;
                option.innerText = d.deptName;
                select.appendChild(option);
            });
        });

    document.getElementById('newEmpName').value = '';
    fetch('/api/admin/departments', { credentials: 'include' })
        .then(res => res.json())
        .then(depts => {
            const filterSelect = document.getElementById('filterEmpDept');
            filterSelect.innerHTML = '<option value="">全部</option>';
            depts.forEach(d => {
                const option = document.createElement('option');
                option.value = d.id;
                option.innerText = d.deptName;
                filterSelect.appendChild(option);
            });
        });
    document.getElementById('addEmployeeModal').classList.add('show');
}

function closeAddEmployee() {
    document.getElementById('addEmployeeModal').classList.remove('show');
}

function saveNewEmployee() {
    const empNo = document.getElementById('newEmpNo').value;
    const empName = document.getElementById('newEmpName').value.trim();
    const deptId = document.getElementById('newEmpDept').value;
    const hireDate = document.getElementById('newEmpHireDate').value.trim();
    const gender = document.getElementById('newEmpGender').value;
    const position = document.getElementById('newEmpPosition').value.trim();
    const phone = document.getElementById('newEmpPhone').value.trim();
    const idNumber = document.getElementById('newEmpIdNumber').value.trim();
    const emergencyContact = document.getElementById('newEmpEmergencyContact').value.trim();
    const emergencyPhone = document.getElementById('newEmpEmergencyPhone').value.trim();
    const emergencyRelation = document.getElementById('newEmpEmergencyRelation').value.trim();
    const photoFile = document.getElementById('newEmpPhoto').files[0];

    if (!empName) { alert('請輸入姓名！'); return; }
    if (!deptId) { alert('請選擇部門！'); return; }

    const saveEmployee = (photoPath) => {
        fetch('/api/admin/employee', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                employeeNo: empNo,
                employeeName: empName,
                deptId: parseInt(deptId),
                hireDate,
                gender,
                position,
                phone,
                idNumber,
                emergencyContact,
                emergencyPhone,
                emergencyRelation,
                photo: photoPath || ''
            })
        }).then(res => {
            if (res.ok) {
                alert('員工新增成功！');
                closeAddEmployee();
                loadEmployeeList();
                loadDepartments();
            } else {
                alert('新增失敗！');
            }
        });
    };

    if (photoFile) {
        const formData = new FormData();
        formData.append('file', photoFile);
        formData.append('productNo', 'employee');
        formData.append('processNo', empNo);
        formData.append('docType', 'PHOTO');
        fetch('/api/admin/upload', {
            method: 'POST',
            credentials: 'include',
            body: formData
        }).then(res => res.json())
            .then(data => saveEmployee(data.path))
            .catch(() => saveEmployee(''));
    } else {
        saveEmployee('');
    }
}

function deleteEmployee(employeeNo) {
    if (!confirm('確定要刪除員工 ' + employeeNo + ' 嗎？')) return;
    fetch('/api/admin/employee/' + employeeNo, {
        method: 'DELETE',
        credentials: 'include'
    }).then(res => {
        if (res.ok) {
            alert('刪除成功！');
            loadEmployeeList();
            loadDepartments();
        } else {
            alert('刪除失敗！');
        }
    });
}

function openAddProcessToProduct() {
    const productNo = document.getElementById('detailProductNo').value;
    window._processModalMode = 'add';
    window._processModalProductNo = productNo;
    window._processModalOldProcessNo = null;
    document.getElementById('processModalTitle').innerText = '新增工序';
    document.getElementById('processModalNo').value = '';
    document.getElementById('processModalCode').value = '';
    document.getElementById('processModalName').value = '';
    document.getElementById('processModalNo').readOnly = false;
    document.getElementById('processModal').classList.add('show');
}

function openEditProcess(productNo, processNo, processCode, processName) {
    window._processModalMode = 'edit';
    window._processModalProductNo = productNo;
    window._processModalOldProcessNo = processNo;
    document.getElementById('processModalTitle').innerText = '編輯工序';
    document.getElementById('processModalNo').value = processNo;
    document.getElementById('processModalCode').value = processCode;
    document.getElementById('processModalName').value = processName;
    document.getElementById('processModalNo').readOnly = false;
    document.getElementById('processModal').classList.add('show');
}

function closeProcessModal() {
    document.getElementById('processModal').classList.remove('show');
}

function saveProcessModal() {
    const productNo = window._processModalProductNo;
    const processNo = document.getElementById('processModalNo').value.trim();
    const processCode = document.getElementById('processModalCode').value.trim();
    const processName = document.getElementById('processModalName').value.trim();

    if (!processNo) { alert('請輸入工序號！'); return; }
    if (!processCode) { alert('請輸入製程代號！'); return; }
    if (!processName) { alert('請輸入工序名稱！'); return; }

    if (window._processModalMode === 'add') {
        fetch('/api/admin/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ productNo, processNo, processCode, processName })
        }).then(res => {
            if (res.ok) {
                alert('工序新增成功！');
                closeProcessModal();
                openProductDetail(productNo);
            } else {
                alert('新增失敗！');
            }
        });
    } else {
        fetch('/api/admin/process/' + encodeURIComponent(productNo) + '/' + encodeURIComponent(window._processModalOldProcessNo), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ productNo, processNo, processCode, processName })
        }).then(res => {
            if (res.ok) {
                alert('工序修改成功！');
                closeProcessModal();
                openProductDetail(productNo);
            } else {
                alert('修改失敗！');
            }
        });
    }
}

function deleteProcess(productNo, processNo) {
    if (!confirm('確定要刪除工序 ' + processNo + ' 嗎？')) return;
    fetch('/api/admin/process/' + encodeURIComponent(productNo) + '/' + encodeURIComponent(processNo), {
        method: 'DELETE',
        credentials: 'include'
    }).then(res => {
        if (res.ok) {
            alert('刪除成功！');
            openProductDetail(productNo);
        } else {
            alert('刪除失敗！');
        }
    });
}

function openEditEmployee(e) {
    document.getElementById('editEmpNo').value = e.employeeNo;
    document.getElementById('editEmpName').value = e.employeeName || '';
    document.getElementById('editEmpGender').value = e.gender || '';
    document.getElementById('editEmpPosition').value = e.position || '';
    document.getElementById('editEmpHireDate').value = e.hireDate || '';
    document.getElementById('editEmpPhone').value = e.phone || '';
    document.getElementById('editEmpIdNumber').value = e.idNumber || '';
    document.getElementById('editEmpEmergencyContact').value = e.emergencyContact || '';
    document.getElementById('editEmpEmergencyPhone').value = e.emergencyPhone || '';
    document.getElementById('editEmpEmergencyRelation').value = e.emergencyRelation || '';
    document.getElementById('editEmpPhoto').value = '';
    window._editEmpCurrentPhoto = e.photo || '';

    if (e.photo) {
        const fileName = e.photo.split('/').pop();
        document.getElementById('editEmpPhotoPreview').innerHTML = `<img src="/api/admin/file/${fileName}" style="width:80px;height:80px;object-fit:cover;margin-bottom:5px;"><br>`;
    } else {
        document.getElementById('editEmpPhotoPreview').innerHTML = '';
    }

    const select = document.getElementById('editEmpDept');
    select.innerHTML = '<option value="">--選擇部門--</option>';
    fetch('/api/admin/departments', { credentials: 'include' })
        .then(res => res.json())
        .then(depts => {
            depts.forEach(d => {
                const option = document.createElement('option');
                option.value = d.id;
                option.innerText = d.deptName;
                select.appendChild(option);
            });
            select.value = String(e.deptId) || '';
        });

    document.getElementById('editEmployeeModal').classList.add('show');
}

function closeEditEmployee() {
    document.getElementById('editEmployeeModal').classList.remove('show');
}

function saveEditEmployee() {
    const empNo = document.getElementById('editEmpNo').value;
    const empName = document.getElementById('editEmpName').value.trim();
    const deptId = document.getElementById('editEmpDept').value;
    const hireDate = document.getElementById('editEmpHireDate').value.trim();
    const gender = document.getElementById('editEmpGender').value;
    const position = document.getElementById('editEmpPosition').value;
    const phone = document.getElementById('editEmpPhone').value.trim();
    const idNumber = document.getElementById('editEmpIdNumber').value.trim();
    const emergencyContact = document.getElementById('editEmpEmergencyContact').value.trim();
    const emergencyPhone = document.getElementById('editEmpEmergencyPhone').value.trim();
    const emergencyRelation = document.getElementById('editEmpEmergencyRelation').value.trim();
    const photoFile = document.getElementById('editEmpPhoto').files[0];

    if (!empName) { alert('請輸入姓名！'); return; }
    if (!deptId) { alert('請選擇部門！'); return; }

    const updateEmployee = (photoPath) => {
        fetch('/api/admin/employee/' + empNo, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                employeeName: empName,
                deptId: parseInt(deptId),
                hireDate,
                gender,
                position,
                phone,
                idNumber,
                emergencyContact,
                emergencyPhone,
                emergencyRelation,
                photo: photoPath
            })
        }).then(res => {
            if (res.ok) {
                alert('更新成功！');
                closeEditEmployee();
                loadEmployeeList();
            } else {
                alert('更新失敗！');
            }
        });
    };

    if (photoFile) {
        const formData = new FormData();
        formData.append('file', photoFile);
        formData.append('productNo', 'employee');
        formData.append('processNo', empNo);
        formData.append('docType', 'PHOTO');
        fetch('/api/admin/upload', {
            method: 'POST',
            credentials: 'include',
            body: formData
        }).then(res => res.json())
            .then(data => updateEmployee(data.path))
            .catch(() => updateEmployee(''));
    } else {
        updateEmployee(window._editEmpCurrentPhoto || '');
    }
}