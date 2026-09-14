# Test Script — Smart Space Booking API
# Jalankan: powershell -ExecutionPolicy Bypass -File docs\test_api.ps1

$BASE = "http://localhost:3000"
$MAKER_KEY = "mk_demo_ukk_2026_paket_b"
$ERRORS = @()
$PASS = 0
$FAIL = 0

function Test-Endpoint {
    param($label, $response, $expectedStatus)
    $obj = $response | ConvertFrom-Json
    if ($obj.statusCode -eq $expectedStatus -and $obj.status -eq $true) {
        Write-Host "  [PASS] $label" -ForegroundColor Green
        $script:PASS++
        return $obj
    } else {
        Write-Host "  [FAIL] $label => statusCode=$($obj.statusCode), msg=$($obj.message)" -ForegroundColor Red
        $script:FAIL++
        $script:ERRORS += "$label => $($obj.message)"
        return $obj
    }
}

function Test-Error {
    param($label, $response, $expectedStatus)
    $obj = $response | ConvertFrom-Json
    if ($obj.statusCode -eq $expectedStatus -and $obj.status -eq $false) {
        Write-Host "  [PASS] $label (expected error $expectedStatus)" -ForegroundColor Green
        $script:PASS++
    } else {
        Write-Host "  [FAIL] $label => expected error $expectedStatus, got $($obj.statusCode)" -ForegroundColor Red
        $script:FAIL++
        $script:ERRORS += "$label => expected error $expectedStatus"
    }
}

Write-Host "`n=== SMART SPACE BOOKING API TEST ===" -ForegroundColor Cyan
Write-Host "Base URL: $BASE`n"

# ─── 1. ROOT & HEALTH ─────────────────────────────────────────────────────────
Write-Host "[1] Root & Health" -ForegroundColor Yellow
$r = Invoke-WebRequest -Uri "$BASE/" -UseBasicParsing | Select-Object -ExpandProperty Content
Test-Endpoint "GET /" $r 200 | Out-Null

$r = Invoke-WebRequest -Uri "$BASE/health" -UseBasicParsing | Select-Object -ExpandProperty Content
Test-Endpoint "GET /health" $r 200 | Out-Null

# ─── 2. APP MAKER ─────────────────────────────────────────────────────────────
Write-Host "`n[2] App Maker" -ForegroundColor Yellow

# Register (kemungkinan sudah ada, error 400 juga OK kalau duplicate)
$body = '{"name":"Test Siswa2","username":"testsiswa2","email":"test2@smk.sch.id","password":"Password123!"}'
try {
    $r = Invoke-WebRequest -Uri "$BASE/api/maker/register" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing | Select-Object -ExpandProperty Content
    Test-Endpoint "POST /api/maker/register" $r 201 | Out-Null
} catch {
    $r = $_.ErrorDetails.Message
    Test-Error "POST /api/maker/register (duplicate)" $r 400
}

# Login
$body = '{"usernameOrEmail":"demo_maker","password":"Password123!"}'
$r = Invoke-WebRequest -Uri "$BASE/api/maker/login" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing | Select-Object -ExpandProperty Content
$loginResult = Test-Endpoint "POST /api/maker/login" $r 200
$MAKER_TOKEN = ($r | ConvertFrom-Json).data.access_token

# Me
$r = Invoke-WebRequest -Uri "$BASE/api/maker/me" -Headers @{Authorization="Bearer $MAKER_TOKEN"} -UseBasicParsing | Select-Object -ExpandProperty Content
Test-Endpoint "GET /api/maker/me" $r 200 | Out-Null

# Stats
$r = Invoke-WebRequest -Uri "$BASE/api/maker/stats" -Headers @{Authorization="Bearer $MAKER_TOKEN"; "x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
Test-Endpoint "GET /api/maker/stats" $r 200 | Out-Null

# List
$r = Invoke-WebRequest -Uri "$BASE/api/maker/list" -UseBasicParsing | Select-Object -ExpandProperty Content
Test-Endpoint "GET /api/maker/list" $r 200 | Out-Null

# ─── 3. AUTH ──────────────────────────────────────────────────────────────────
Write-Host "`n[3] Auth" -ForegroundColor Yellow

# Register member
$body = '{"username":"testmember99","password":"Secret123!","nama_member":"Test Member","instansi":"SMK Test","alamat":"Jl. Test No. 1","telp":"081111111111"}'
try {
    $r = Invoke-WebRequest -Uri "$BASE/api/auth/register/member" -Method POST -ContentType "application/json" -Body $body -Headers @{"x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
    Test-Endpoint "POST /api/auth/register/member" $r 201 | Out-Null
} catch {
    $r = $_.ErrorDetails.Message
    Test-Error "POST /api/auth/register/member (duplicate)" $r 400
}

# Register admin-space
$body = '{"username":"testadmin99","password":"Admin123!","nama_coworking":"Test Coworking","nama_pemilik":"Test Owner","telp":"082222222222"}'
try {
    $r = Invoke-WebRequest -Uri "$BASE/api/auth/register/admin-space" -Method POST -ContentType "application/json" -Body $body -Headers @{"x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
    Test-Endpoint "POST /api/auth/register/admin-space" $r 201 | Out-Null
} catch {
    $r = $_.ErrorDetails.Message
    Test-Error "POST /api/auth/register/admin-space (duplicate)" $r 400
}

# Login Member
$body = '{"username":"johndoe","password":"Secret123!"}'
$r = Invoke-WebRequest -Uri "$BASE/api/auth/login" -Method POST -ContentType "application/json" -Body $body -Headers @{"x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
$loginMember = Test-Endpoint "POST /api/auth/login (member)" $r 200
$MEMBER_TOKEN = ($r | ConvertFrom-Json).data.access_token
$MEMBER_ID = ($r | ConvertFrom-Json).data.member.id

# Login Admin
$body = '{"username":"admin_moklet","password":"Admin123!"}'
$r = Invoke-WebRequest -Uri "$BASE/api/auth/login" -Method POST -ContentType "application/json" -Body $body -Headers @{"x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
$loginAdmin = Test-Endpoint "POST /api/auth/login (admin)" $r 200
$ADMIN_TOKEN = ($r | ConvertFrom-Json).data.access_token

# Profile
$r = Invoke-WebRequest -Uri "$BASE/api/auth/profile" -Headers @{Authorization="Bearer $MEMBER_TOKEN"; "x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
Test-Endpoint "GET /api/auth/profile" $r 200 | Out-Null

# Wrong password
try {
    $body = '{"username":"johndoe","password":"WRONG"}'
    $r = Invoke-WebRequest -Uri "$BASE/api/auth/login" -Method POST -ContentType "application/json" -Body $body -Headers @{"x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
    Test-Error "POST /api/auth/login (wrong pw)" $r 401
} catch {
    $r = $_.ErrorDetails.Message
    Test-Error "POST /api/auth/login (wrong pw)" $r 401
}

# ─── 4. SPACES ────────────────────────────────────────────────────────────────
Write-Host "`n[4] Spaces" -ForegroundColor Yellow

$r = Invoke-WebRequest -Uri "$BASE/api/spaces/types" -Headers @{"x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
Test-Endpoint "GET /api/spaces/types" $r 200 | Out-Null

$r = Invoke-WebRequest -Uri "$BASE/api/spaces/availability?id_space=1&tanggal=2026-12-01&jam_mulai=09:00&durasi_jam=3" -Headers @{"x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
Test-Endpoint "GET /api/spaces/availability" $r 200 | Out-Null

$r = Invoke-WebRequest -Uri "$BASE/api/spaces" -Headers @{"x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
Test-Endpoint "GET /api/spaces" $r 200 | Out-Null
$SPACE_ID = (($r | ConvertFrom-Json).data | Select-Object -First 1).id

$r = Invoke-WebRequest -Uri "$BASE/api/spaces/$SPACE_ID" -Headers @{"x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
Test-Endpoint "GET /api/spaces/:id" $r 200 | Out-Null

# Space tidak ada
try {
    $r = Invoke-WebRequest -Uri "$BASE/api/spaces/99999" -Headers @{"x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
    Test-Error "GET /api/spaces/99999 (not found)" $r 404
} catch {
    $r = $_.ErrorDetails.Message
    Test-Error "GET /api/spaces/99999 (not found)" $r 404
}

# ─── 5. DISKON ────────────────────────────────────────────────────────────────
Write-Host "`n[5] Diskon" -ForegroundColor Yellow

$r = Invoke-WebRequest -Uri "$BASE/api/diskon/active" -Headers @{"x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
Test-Endpoint "GET /api/diskon/active" $r 200 | Out-Null

$body = '{"nama_diskon":"DISKONHEMAT20"}'
$r = Invoke-WebRequest -Uri "$BASE/api/diskon/check" -Method POST -ContentType "application/json" -Body $body -Headers @{"x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
Test-Endpoint "POST /api/diskon/check (valid)" $r 200 | Out-Null
$DISKON_ID = ($r | ConvertFrom-Json).data.id

$r = Invoke-WebRequest -Uri "$BASE/api/diskon/$DISKON_ID" -Headers @{"x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
Test-Endpoint "GET /api/diskon/:id" $r 200 | Out-Null

# Kode invalid
try {
    $body = '{"nama_diskon":"KODEGAK_ADA"}'
    $r = Invoke-WebRequest -Uri "$BASE/api/diskon/check" -Method POST -ContentType "application/json" -Body $body -Headers @{"x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
    Test-Error "POST /api/diskon/check (invalid)" $r 400
} catch {
    $r = $_.ErrorDetails.Message
    Test-Error "POST /api/diskon/check (invalid)" $r 400
}

# ─── 6. RESERVASI ─────────────────────────────────────────────────────────────
Write-Host "`n[6] Reservasi" -ForegroundColor Yellow

$body = "{`"id_space`":1,`"tanggal_reservasi`":`"2026-12-15`",`"jam_mulai`":`"09:00`",`"durasi_jam`":3,`"kode_promo`":`"DISKONHEMAT20`"}"
$r = Invoke-WebRequest -Uri "$BASE/api/reservasi" -Method POST -ContentType "application/json" -Body $body -Headers @{Authorization="Bearer $MEMBER_TOKEN"; "x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
Test-Endpoint "POST /api/reservasi" $r 201 | Out-Null
$RESERVASI_ID = ($r | ConvertFrom-Json).data.id

# Duplicate booking (conflict jam)
try {
    $r2 = Invoke-WebRequest -Uri "$BASE/api/reservasi" -Method POST -ContentType "application/json" -Body $body -Headers @{Authorization="Bearer $MEMBER_TOKEN"; "x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
    Test-Error "POST /api/reservasi (conflict)" $r2 400
} catch {
    $r2 = $_.ErrorDetails.Message
    Test-Error "POST /api/reservasi (conflict)" $r2 400
}

$r = Invoke-WebRequest -Uri "$BASE/api/reservasi/my" -Headers @{Authorization="Bearer $MEMBER_TOKEN"; "x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
Test-Endpoint "GET /api/reservasi/my" $r 200 | Out-Null

$r = Invoke-WebRequest -Uri "$BASE/api/reservasi/my/history?month=12&year=2026" -Headers @{Authorization="Bearer $MEMBER_TOKEN"; "x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
Test-Endpoint "GET /api/reservasi/my/history" $r 200 | Out-Null

$r = Invoke-WebRequest -Uri "$BASE/api/reservasi/$RESERVASI_ID/e-ticket" -Headers @{Authorization="Bearer $MEMBER_TOKEN"; "x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
Test-Endpoint "GET /api/reservasi/:id/e-ticket" $r 200 | Out-Null

$r = Invoke-WebRequest -Uri "$BASE/api/reservasi/$RESERVASI_ID" -Headers @{Authorization="Bearer $MEMBER_TOKEN"; "x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
Test-Endpoint "GET /api/reservasi/:id" $r 200 | Out-Null

# Buat reservasi ke-2 untuk test cancel
$body2 = "{`"id_space`":2,`"tanggal_reservasi`":`"2026-12-20`",`"jam_mulai`":`"10:00`",`"durasi_jam`":2}"
$r = Invoke-WebRequest -Uri "$BASE/api/reservasi" -Method POST -ContentType "application/json" -Body $body2 -Headers @{Authorization="Bearer $MEMBER_TOKEN"; "x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
$CANCEL_ID = ($r | ConvertFrom-Json).data.id
$r = Invoke-WebRequest -Uri "$BASE/api/reservasi/$CANCEL_ID/cancel" -Method PATCH -Headers @{Authorization="Bearer $MEMBER_TOKEN"; "x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
Test-Endpoint "PATCH /api/reservasi/:id/cancel" $r 200 | Out-Null

# ─── 7. ADMIN PROFIL ──────────────────────────────────────────────────────────
Write-Host "`n[7] Admin Profile" -ForegroundColor Yellow

$r = Invoke-WebRequest -Uri "$BASE/api/admin/profile" -Headers @{Authorization="Bearer $ADMIN_TOKEN"; "x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
Test-Endpoint "GET /api/admin/profile" $r 200 | Out-Null

$body = '{"nama_coworking":"Moklet Hub Updated","nama_pemilik":"Ahmad Bidin, S.Kom","telp":"081298765432"}'
$r = Invoke-WebRequest -Uri "$BASE/api/admin/profile" -Method PUT -ContentType "application/json" -Body $body -Headers @{Authorization="Bearer $ADMIN_TOKEN"; "x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
Test-Endpoint "PUT /api/admin/profile" $r 200 | Out-Null

# ─── 8. ADMIN MEMBER CRUD ─────────────────────────────────────────────────────
Write-Host "`n[8] Admin Members CRUD" -ForegroundColor Yellow

$r = Invoke-WebRequest -Uri "$BASE/api/admin/members" -Headers @{Authorization="Bearer $ADMIN_TOKEN"; "x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
Test-Endpoint "GET /api/admin/members" $r 200 | Out-Null

$body = '{"username":"newmember_crud","password":"Secret123!","nama_member":"New Member CRUD","instansi":"SMK Telkom","alamat":"Jl. CRUD No. 1","telp":"089999999999"}'
$r = Invoke-WebRequest -Uri "$BASE/api/admin/members" -Method POST -ContentType "application/json" -Body $body -Headers @{Authorization="Bearer $ADMIN_TOKEN"; "x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
Test-Endpoint "POST /api/admin/members" $r 201 | Out-Null
$NEW_MEMBER_ID = ($r | ConvertFrom-Json).data.id

$r = Invoke-WebRequest -Uri "$BASE/api/admin/members/$NEW_MEMBER_ID" -Headers @{Authorization="Bearer $ADMIN_TOKEN"; "x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
Test-Endpoint "GET /api/admin/members/:id" $r 200 | Out-Null

$body = '{"nama_member":"New Member Updated","instansi":"PT Updated"}'
$r = Invoke-WebRequest -Uri "$BASE/api/admin/members/$NEW_MEMBER_ID" -Method PUT -ContentType "application/json" -Body $body -Headers @{Authorization="Bearer $ADMIN_TOKEN"; "x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
Test-Endpoint "PUT /api/admin/members/:id" $r 200 | Out-Null

$r = Invoke-WebRequest -Uri "$BASE/api/admin/members/$NEW_MEMBER_ID" -Method DELETE -Headers @{Authorization="Bearer $ADMIN_TOKEN"; "x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
Test-Endpoint "DELETE /api/admin/members/:id" $r 200 | Out-Null

# ─── 9. ADMIN SPACE CRUD ──────────────────────────────────────────────────────
Write-Host "`n[9] Admin Spaces CRUD" -ForegroundColor Yellow

$r = Invoke-WebRequest -Uri "$BASE/api/admin/spaces" -Headers @{Authorization="Bearer $ADMIN_TOKEN"; "x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
Test-Endpoint "GET /api/admin/spaces" $r 200 | Out-Null

$body = '{"nama_space":"Test Desk CRUD","harga_per_jam":25000,"tipe":"desk","kapasitas":1,"deskripsi":"Meja test untuk CRUD"}'
$r = Invoke-WebRequest -Uri "$BASE/api/admin/spaces" -Method POST -ContentType "application/json" -Body $body -Headers @{Authorization="Bearer $ADMIN_TOKEN"; "x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
Test-Endpoint "POST /api/admin/spaces" $r 201 | Out-Null
$NEW_SPACE_ID = ($r | ConvertFrom-Json).data.id

$r = Invoke-WebRequest -Uri "$BASE/api/admin/spaces/$NEW_SPACE_ID" -Headers @{Authorization="Bearer $ADMIN_TOKEN"; "x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
Test-Endpoint "GET /api/admin/spaces/:id" $r 200 | Out-Null

$body = '{"harga_per_jam":30000,"kapasitas":2}'
$r = Invoke-WebRequest -Uri "$BASE/api/admin/spaces/$NEW_SPACE_ID" -Method PUT -ContentType "application/json" -Body $body -Headers @{Authorization="Bearer $ADMIN_TOKEN"; "x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
Test-Endpoint "PUT /api/admin/spaces/:id" $r 200 | Out-Null

$r = Invoke-WebRequest -Uri "$BASE/api/admin/spaces/$NEW_SPACE_ID" -Method DELETE -Headers @{Authorization="Bearer $ADMIN_TOKEN"; "x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
Test-Endpoint "DELETE /api/admin/spaces/:id" $r 200 | Out-Null

# ─── 10. ADMIN DISKON CRUD ────────────────────────────────────────────────────
Write-Host "`n[10] Admin Diskon CRUD" -ForegroundColor Yellow

$r = Invoke-WebRequest -Uri "$BASE/api/admin/diskon" -Headers @{Authorization="Bearer $ADMIN_TOKEN"; "x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
Test-Endpoint "GET /api/admin/diskon" $r 200 | Out-Null

$body = '{"nama_diskon":"TESTCRUD99","persentase_diskon":15,"tanggal_awal":"2026-09-01T00:00:00Z","tanggal_akhir":"2026-12-31T23:59:59Z"}'
$r = Invoke-WebRequest -Uri "$BASE/api/admin/diskon" -Method POST -ContentType "application/json" -Body $body -Headers @{Authorization="Bearer $ADMIN_TOKEN"; "x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
Test-Endpoint "POST /api/admin/diskon" $r 201 | Out-Null
$NEW_DISKON_ID = ($r | ConvertFrom-Json).data.id

$r = Invoke-WebRequest -Uri "$BASE/api/admin/diskon/$NEW_DISKON_ID" -Headers @{Authorization="Bearer $ADMIN_TOKEN"; "x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
Test-Endpoint "GET /api/admin/diskon/:id" $r 200 | Out-Null

$body = '{"persentase_diskon":20}'
$r = Invoke-WebRequest -Uri "$BASE/api/admin/diskon/$NEW_DISKON_ID" -Method PUT -ContentType "application/json" -Body $body -Headers @{Authorization="Bearer $ADMIN_TOKEN"; "x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
Test-Endpoint "PUT /api/admin/diskon/:id" $r 200 | Out-Null

$r = Invoke-WebRequest -Uri "$BASE/api/admin/diskon/$NEW_DISKON_ID" -Method DELETE -Headers @{Authorization="Bearer $ADMIN_TOKEN"; "x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
Test-Endpoint "DELETE /api/admin/diskon/:id" $r 200 | Out-Null

# ─── 11. ADMIN RESERVASI ──────────────────────────────────────────────────────
Write-Host "`n[11] Admin Reservasi" -ForegroundColor Yellow

$r = Invoke-WebRequest -Uri "$BASE/api/admin/reservasi" -Headers @{Authorization="Bearer $ADMIN_TOKEN"; "x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
Test-Endpoint "GET /api/admin/reservasi" $r 200 | Out-Null

$r = Invoke-WebRequest -Uri "$BASE/api/admin/reservasi?month=12&year=2026&status=belum_dikonfirm" -Headers @{Authorization="Bearer $ADMIN_TOKEN"; "x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
Test-Endpoint "GET /api/admin/reservasi (filter)" $r 200 | Out-Null

$body = '{"status":"disetujui"}'
$r = Invoke-WebRequest -Uri "$BASE/api/admin/reservasi/$RESERVASI_ID/status" -Method PATCH -ContentType "application/json" -Body $body -Headers @{Authorization="Bearer $ADMIN_TOKEN"; "x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
Test-Endpoint "PATCH /api/admin/reservasi/:id/status (disetujui)" $r 200 | Out-Null

$r = Invoke-WebRequest -Uri "$BASE/api/admin/reservasi/$RESERVASI_ID/check-in" -Method POST -Headers @{Authorization="Bearer $ADMIN_TOKEN"; "x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
Test-Endpoint "POST /api/admin/reservasi/:id/check-in" $r 200 | Out-Null

$r = Invoke-WebRequest -Uri "$BASE/api/admin/reservasi/$RESERVASI_ID/check-out" -Method POST -Headers @{Authorization="Bearer $ADMIN_TOKEN"; "x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
Test-Endpoint "POST /api/admin/reservasi/:id/check-out" $r 200 | Out-Null

# ─── 12. ADMIN REPORTS ────────────────────────────────────────────────────────
Write-Host "`n[12] Admin Reports" -ForegroundColor Yellow

$r = Invoke-WebRequest -Uri "$BASE/api/admin/reports/monthly?month=12&year=2026" -Headers @{Authorization="Bearer $ADMIN_TOKEN"; "x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
Test-Endpoint "GET /api/admin/reports/monthly" $r 200 | Out-Null

$r = Invoke-WebRequest -Uri "$BASE/api/admin/reports/income?month=12&year=2026" -Headers @{Authorization="Bearer $ADMIN_TOKEN"; "x-maker-key"=$MAKER_KEY} -UseBasicParsing | Select-Object -ExpandProperty Content
Test-Endpoint "GET /api/admin/reports/income" $r 200 | Out-Null

# ─── SUMMARY ──────────────────────────────────────────────────────────────────
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "HASIL: $PASS PASS | $FAIL FAIL" -ForegroundColor $(if ($FAIL -eq 0) { "Green" } else { "Yellow" })
if ($ERRORS.Count -gt 0) {
    Write-Host "`nErrors:" -ForegroundColor Red
    $ERRORS | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
}
Write-Host "========================================`n" -ForegroundColor Cyan
