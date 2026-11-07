# 14 · Communication Instructions (Modbus / Open User Communication / S7)

The four S7-1200/1500 communication families are all FBs that require an instance DB (the "Call options" dialog creates the instance; each concurrent connection needs its own instance DB). SCL calls take the form `"Inst_DB"(IN:=x, OUT=>y);` (see [07](07-instruction-set.md)). Parameter names are taken from official/community sources; all calls use verified SCL FB call syntax.

> Note: The local source-cache generator emits only basic LAD/DB/UDT XML and no communication FB calls (a grep across the entire cache, including the official GitHub repo, returned zero hits). Communication FB shapes in this chapter follow the official documentation.

## 1. Modbus TCP (over the integrated PROFINET port, default port 502)

**MB_CLIENT (client / master)**:
- In: `REQ` (rising edge issues one request), `DISCONNECT`, `MB_MODE`, `MB_DATA_ADDR`, `MB_DATA_LEN`, `MB_DATA_PTR` (VARIANT pointer, points to the whole array, not the first element), `CONNECT` (VARIANT → connection description `TCON_IP_v4`)
- Out: `DONE`/`BUSY`/`ERROR`/`STATUS`
- > ⚠️ **Correction**: `MB_MODE=0` reads, `=1` writes, **`=2` is a write variant (not diagnostics!)**; diagnostics use a higher code. A generator that emits `MB_MODE:=2` expecting diagnostics will silently perform a write instead.

**MB_SERVER (server / slave)**: `DISCONNECT`, `MB_HOLD_REG` (pointer to the holding-register area exposed to clients), `CONNECT` (`TCON_IP_v4`); out `NDR` (client wrote new data)/`DR` (client read data)/`ERROR`/`STATUS`.

**`TCON_IP_v4` fields** (note the lowercase v): `InterfaceId` (PN interface HW id), `ID` (connection id 1–4095), `ConnectionType` (`11`=TCP), `ActiveEstablished` (TRUE=client/active), `RemoteAddress` (nested `ADDR[1..4]`, 4-byte IP), `RemotePort`, `LocalPort`.

```scl
"MB_CLIENT_DB"(REQ := startReq, DISCONNECT := FALSE,
               MB_MODE := 0, MB_DATA_ADDR := 40001, MB_DATA_LEN := 10,
               MB_DATA_PTR := "DataDB".HoldRegs, CONNECT := "ConnDB".Conn_TCON_IP_v4,
               DONE => done, BUSY => busy, ERROR => err, STATUS => status);
```

## 2. Modbus RTU (point-to-point, CM/CB 1241 modules)

> RTU uses `MODE`/`DATA_ADDR`/`DATA_LEN`/`DATA_PTR` without the `MB_` prefix (distinct from TCP's `MB_*`).

- **Modbus_Comm_Load** (port configuration, called once in OB100/first scan): `PORT` (PtP module HW id), `BAUD`, `PARITY` (0 none/1 odd/2 even), `MB_DB` (IN_OUT, links the port configuration to the Master/Slave instance DB).
- **Modbus_Master**: `REQ`, `MB_ADDR` (slave address), `MODE` (0 read/1 write), `DATA_ADDR`, `DATA_LEN`, `DATA_PTR`; out `DONE`/`BUSY`/`ERROR`/`STATUS`.
- **Modbus_Slave** (official page names "MB_SLAVE"/"Modbus_Slave"): `MB_ADDR`, `MB_HOLD_REG`, `NDR`/`DR`/`ERROR`/`STATUS`.

```scl
"Modbus_Comm_Load_DB"(PORT := "CM1241_PtP", BAUD := 9600, PARITY := 2,
                      MB_DB := "Modbus_Master_DB".MB_DB, DONE => cl_done, ERROR => cl_err, STATUS => cl_status);
"Modbus_Master_DB"(REQ := mreq, MB_ADDR := 1, MODE := 0,
                   DATA_ADDR := 40001, DATA_LEN := 10, DATA_PTR := "DataDB".Regs,
                   DONE => m_done, BUSY => m_busy, ERROR => m_err, STATUS => m_status);
```

## 3. Open User Communication (OUC) (TCP / ISO-on-TCP / UDP)

- Basic: `TCON` (establish connection, ID+CONNECT), `TDISCON`, `TSEND` (REQ/LEN/DATA/ID), `TRCV` (EN_R/LEN/DATA/ID).
- Compact: **`TSEND_C`** = TCON+TSEND+TDISCON; **`TRCV_C`** = TCON+TRCV+TDISCON.
  - Parameters: `REQ` (TSEND_C)/`EN_R` (TRCV_C, **not REQ**), `CONT` (1=keep connection), `CONNECT` (`TCON_IP_v4`/`TCON_Param`), `LEN`, `DATA`, `DONE`/`BUSY`/`ERROR`/`STATUS`; TRCV_C also has `RCVD_LEN`.
- Connection description types: `TCON_IP_v4`, `TCON_QDN`, secure variants `TCON_IP_v4_SEC`/`TCON_QDN_SEC` (secure connections require S7-1500 firmware V2.5+ plus a certificate).

```scl
"TSEND_C_DB"(REQ := sendReq, CONT := TRUE, CONNECT := "ConnDB".Conn_TCON_IP_v4,
             LEN := 100, DATA := "SendBuf".Bytes, DONE => s_done, BUSY => s_busy, ERROR => s_err, STATUS => s_status);
"TRCV_C_DB"(EN_R := TRUE, CONT := TRUE, CONNECT := "ConnDB".Conn_TCON_IP_v4,
            LEN := 100, DATA := "RecvBuf".Bytes, DONE => r_done, BUSY => r_busy, ERROR => r_err, STATUS => r_status);
```

## 4. S7 Communication (GET / PUT)

- **GET (read)**: `REQ` (rising edge), `ID` (configured S7 connection id), `ADDR_1` (remote area to read on the partner), `RD_1` (local destination); out **`NDR`**/`ERROR`/`STATUS`.
- **PUT (write)**: `REQ`, `ID`, `ADDR_1` (partner destination), `SD_1` (local source); out **`DONE`**/`ERROR`/`STATUS`. (GET signals completion with NDR, PUT with DONE.)
- > ⚠️ **Critical**: The partner/server CPU must enable **"Permit access with PUT/GET communication from remote partner"** under Protection & Security; it is **off by default** on S7-1200/1500.

```scl
"GET_DB"(REQ := getReq, ID := 16#100, ADDR_1 := P#DB10.DBX0.0 BYTE 20, RD_1 := "LocalDB".RxBuf,
         NDR => g_ndr, ERROR => g_err, STATUS => g_status);
"PUT_DB"(REQ := putReq, ID := 16#100, ADDR_1 := P#DB20.DBX0.0 BYTE 20, SD_1 := "LocalDB".TxBuf,
         DONE => p_done, ERROR => p_err, STATUS => p_status);
```

## Sources

- Official docs.tia.siemens.cloud: MB_CLIENT `MB_MODE/MB_DATA_ADDR/MB_DATA_LEN` page, `MB_DATA_PTR` page, `MB_SLAVE` page (page titles confirmed verbatim); GET/PUT permission checkbox (official forum).
- Parameter details are cross-referenced from community reproductions (solisplc/dmcinfo) against official page slugs.
