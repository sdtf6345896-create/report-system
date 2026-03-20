# 報工系統

Eclipse 匯入步驟:
1. File > Import > Maven > Existing Maven Projects
2. 選 report-system 資料夾
3. 修改 application.properties 資料庫帳密
4. MySQL: CREATE DATABASE report_db
5. 執行 ReportSystemApplication.java
6. 開啟 http://localhost:8080

API:
GET /api/report/list
POST /api/report/save
