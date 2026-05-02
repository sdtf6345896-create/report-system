allDocsByProcess = {};

function switchMode(mode) {
    if (mode === 'order') {
        document.getElementById('modeOrder').style.display = 'flex';
        document.getElementById('modeProduct').style.display = 'none';
        document.getElementById('btnModeOrder').style.background = '#336699';
        document.getElementById('btnModeOrder').style.color = 'white';
        document.getElementById('btnModeProduct').style.background = '#e0e0e0';
        document.getElementById('btnModeProduct').style.color = '#333';
    } else {
        document.getElementById('modeOrder').style.display = 'none';
        document.getElementById('modeProduct').style.display = 'flex';
        document.getElementById('btnModeProduct').style.background = '#336699';
        document.getElementById('btnModeProduct').style.color = 'white';
        document.getElementById('btnModeOrder').style.background = '#e0e0e0';
        document.getElementById('btnModeOrder').style.color = '#333';
    }
    document.getElementById('orderInput1').value = '';
    document.getElementById('orderInput2').value = '';
    document.getElementById('orderProductNo').innerText = '';
    document.getElementById('productInput').value = '';
    document.getElementById('resultArea').innerHTML = '';
}

function searchByProduct() {
    const productNo = document.getElementById('productInput').value.trim();
    if (!productNo) {
        alert('請輸入品號！');
        return;
    }
    const area = document.getElementById('resultArea');
    area.innerHTML = '查詢中...';
    renderResults(productNo, area);
}

function renderResults(productNo, area) {
    Promise.all([
        fetch('/api/process/byProduct/' + productNo).then(r => r.json()),
        fetch('/api/document/' + productNo).then(r => r.json())
    ]).then(([processes, docs]) => {
        allDocsByProcess = {};
        docs.forEach(d => {
            if (!allDocsByProcess[d.processNo]) allDocsByProcess[d.processNo] = [];
            allDocsByProcess[d.processNo].push(d);
        });

        if (processes.length === 0) {
            area.innerHTML = '<p style="color:red;">找不到此品號的工序資料！</p>';
            return;
        }

        let html = `
            <table class="result-table">
                <thead>
                    <tr>
                        <th>工序</th>
                        <th>製程代號</th>
                        <th>製程名稱</th>
                        <th>SOP</th>
                        <th>SIP</th>
                    </tr>
                </thead>
                <tbody>
        `;

        processes.forEach(p => {
            const processDocs = allDocsByProcess[p.processNo] || [];
            const sopDocs = processDocs.filter(d => d.docType === 'SOP');
            const sipDocs = processDocs.filter(d => d.docType === 'SIP');

            html += `
                <tr>
                    <td>${p.processNo || ''}</td>
                    <td>${p.processCode || ''}</td>
                    <td>${p.processName || ''}</td>
                    <td>
                        ${sopDocs.length > 0
                ? `<button class="btn-sop-sm" onclick="showDocs('${p.processNo}', 'SOP')">SOP</button>`
                : `<span class="no-doc">－</span>`}
                    </td>
                    <td>
                        ${sipDocs.length > 0
                ? `<button class="btn-sip-sm" onclick="showDocs('${p.processNo}', 'SIP')">SIP</button>`
                : `<span class="no-doc">－</span>`}
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        area.innerHTML = html;
    });
}

function search() {
    const order1 = document.getElementById('orderInput1').value.trim();
    const order2 = document.getElementById('orderInput2').value.trim();

    if (!order1 || !order2) {
        alert('請輸入完整製令號碼！');
        return;
    }

    const order = order1 + '-' + order2;
    const area = document.getElementById('resultArea');
    area.innerHTML = '查詢中...';

    fetch('/api/workorder/' + order)
        .then(r => r.json())
        .then(wo => {
            if (!wo) { area.innerHTML = '<p style="color:red;">找不到此製令！</p>'; return; }
            document.getElementById('orderProductNo').innerText = '品號：' + wo.productNo;
            renderResults(wo.productNo, area);
        });
}

function showDocs(processNo, type) {
    const processDocs = allDocsByProcess[processNo] || [];
    const docs = processDocs.filter(d => d.docType === type);

    if (docs.length === 0) {
        alert('找不到' + type + '文件！');
        return;
    }

    if (docs.length === 1) {
        document.getElementById('modalImg').src = '/api/document/image/' + docs[0].filePath;
        document.getElementById('modal').classList.add('show');
    } else {
        showMultiDoc(docs, 0);
    }
}

let currentDocs = [];
let currentDocIndex = 0;

function showMultiDoc(docs, index) {
    currentDocs = docs;
    currentDocIndex = index;
    document.getElementById('modalImg').src = '/api/document/image/' + docs[index].filePath;

    const modal = document.getElementById('modal');
    modal.classList.add('show');

    let pageInfo = document.getElementById('modalPageInfo');
    if (!pageInfo) {
        pageInfo = document.createElement('div');
        pageInfo.id = 'modalPageInfo';
        pageInfo.style.cssText = 'position:absolute;bottom:20px;left:50%;transform:translateX(-50%);color:white;font-size:16px;display:flex;gap:20px;align-items:center;';
        modal.appendChild(pageInfo);
    }
    pageInfo.innerHTML = `
        <button onclick="prevDoc()" style="background:rgba(255,255,255,0.3);border:none;color:white;padding:5px 15px;cursor:pointer;border-radius:4px;font-size:16px;">◀</button>
        <span>${index + 1} / ${docs.length}</span>
        <button onclick="nextDoc()" style="background:rgba(255,255,255,0.3);border:none;color:white;padding:5px 15px;cursor:pointer;border-radius:4px;font-size:16px;">▶</button>
    `;
}

function prevDoc() {
    if (currentDocIndex > 0) {
        showMultiDoc(currentDocs, currentDocIndex - 1);
    }
}

function nextDoc() {
    if (currentDocIndex < currentDocs.length - 1) {
        showMultiDoc(currentDocs, currentDocIndex + 1);
    }
}

function closeModal() {
    document.getElementById('modal').classList.remove('show');
    currentDocs = [];
    currentDocIndex = 0;
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('modal').addEventListener('click', function (e) {
        if (e.target === this) closeModal();
    });

    document.getElementById('orderInput2').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') search();
    });
});