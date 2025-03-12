# ModbusRTUtest

---
```
npm install serialport
node read_holding_register.js
node write_multiple_register.js
node write_single_register.js
```

# Parsed Modbu Data : 
```
node generate_value_register.js

Parsed Modbus Data:
Total Litter (700–701): 50.3650016784668
Totallizer Amount (704–705): 12.356666564941406
Live Data Liter (708): 100
Live Price (712–713): 0
Sell Litter (724): 16709
Sell Liter Per Price (728): 677
Other Data (732–733): 89.9800033569336
Pump On&Off (734): 1

```
Address : 700 = 02 BC<br>
Slave : 01<br>
function Code : 03 (read multiple Register)<br>
Quantity : 40 (like  address 700 to 739)<br>
frame :

|slaveId|functionCode|address|  qty  |crc|
|-------|------------|-------|-------|---|
|   01  |    03      | 02 BC | 00 28 |CRC|




read value from modbus protocol (qty 40)<br>
Send Read Code (Hex Value) : ```01 03 02 BC 00 28 85 88``` <br>
Return Value (Hex Value) :``` 01 03 50 42 49 75 C3 00 00 00 00 41 5D EB 85 00 00 00 00 00 64 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 41 45 C2 8F 00 00 00 00 02 A5 00 00 00 00 00 00 42 B3 F5 C3 00 00 00 00 00 00 00 00 00 00 00 00 E7 0D``` <br>
Return Value : 01 (slaveid) 03 (functionCode) 50 (Data Quality) ....... (data) E7 0D (CRC) <br>
```
01 03 50 42 49 75 C3 00 00 00 00 41 5D EB 85 00 00 00 00 00 64 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 41 45 C2 8F 00 00 00 00 02 A5 00 00 00 00 00 00 42 B3 F5 C3 00 00 00 00 00 00 00 00 00 00 00 00 E7 0D
```
1. **Slave Address**: `01` – The device address.
2. **Function Code**: `03` – This is a "Read Holding Registers" request.
3. **Byte Count**: `50` – The number of data bytes following this field. This indicates that the following portion contains 80 bytes of data (since `50` in hexadecimal is 80 in decimal).
4. **Data (Registers Values)**: 
   - `42 49 75 C3 00 00 00 00 41 5D EB 85 00 00 00 00 00 64...` – The data being returned, likely representing register values. This is the actual information from the registers.
5. **CRC (Checksum)**: `E7 0D` – A cyclic redundancy check (CRC) to ensure data integrity.

### Count of Registers:

Since the byte count field (`50` in hex, which equals 80 bytes) indicates the length of the data portion, we can assume that each register contains 2 bytes (16 bits). Therefore, the number of registers can be calculated by:

- **Number of Registers** = Data Length (80 bytes) / 2 bytes per register = 40 registers.
 the response is for **40 registers**.

Write Data to Multiple Register (32 bit float version ) array size of float is 2  [700,701]
----
Write Function Code : 0x10 (multiple) <br>
Send Write Data (12.56) 32bit float to address 700 : ``` 01 10 02 C0 00 02 04 41 48 F5 C3 75 B4 ```
1. **Slave Address**: `01` – The device address.
2. **Function Code**: `10` – This is a "Write Function Code"
3. **Address** : `02 C0` - Start Address 700.
4. **Byte Count**: `02` – Number of Registers This indicates that 2 registers are being written to. (700 to 701)
5. **Byte Count of Data**: `04` - The number of data byte (12.56) convert to high byte and low byte 
6. **Data (Registers Values)**: 
   -  `41 48 F5 C3` – 12.56
7. **CRC (Checksum)**: `75 B4` – A cyclic redundancy check (CRC) to ensure data integrity.

send float number to modbus using this command : `01 10 02 C0 00 02 04 41 48 F5 C3 75 B4`

Decimal (Return Data HEX Value)
----
|RturnValueFromSerial|    16969,30147,0,0,16709,46312,0,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16709,49807,0,0,677,0,0,0,17075,62915,1,0,0,0,0,0              |
|--------------------|------------------|

Raw Data From Modbus Slave (Hex)

| Register | Value (Hex) | Register | Value (Hex) | Register | Value (Hex) | Register | Value (Hex) |
|----------|-------------|----------|-------------|----------|-------------|----------|-------------|
| 700      | 0x4249      | 710      | 0x0000      | 720      | 0x0000      | 730      | 0x0000      |
| 701      | 0x75C3      | 711      | 0x0000      | 721      | 0x0000      | 731      | 0x0000      |
| 702      | 0x0000      | 712      | 0x0000      | 722      | 0x0000      | 732      | 0x429B      |
| 703      | 0x0000      | 713      | 0x0000      | 723      | 0x0000      | 733      | 0xF5C3      |
| 704      | 0x4145      | 714      | 0x0000      | 724      | 0x4145      | 734      | 0x0001      |
| 705      | 0xB4E8      | 715      | 0x0000      | 725      | 0xC28F      | 735      | 0x0000      |
| 706      | 0x0000      | 716      | 0x0000      | 726      | 0x0000      | 736      | 0x0000      |
| 707      | 0x0000      | 717      | 0x0000      | 727      | 0x0000      | 737      | 0x0000      |
| 708      | 0x0064      | 718      | 0x0000      | 728      | 0x02A5      | 738      | 0x0000      |
| 709      | 0x0000      | 719      | 0x0000      | 729      | 0x0000      | 739      | 0x0000      |

Change to Decimal

Raw Data From Modbus Slave (Decimal)

| Register | Value  | Register | Value  | Register | Value  | Register | Value  |
|----------|--------|----------|--------|----------|--------|----------|--------|
| 700      | 16969  | 710      | 0      | 720      | 0      | 730      | 0      |
| 701      | 30147  | 711      | 0      | 721      | 0      | 731      | 0      |
| 702      | 0      | 712      | 0      | 722      | 0      | 732      | 17075  |
| 703      | 0      | 713      | 0      | 723      | 0      | 733      | 62915  |
| 704      | 16709  | 714      | 0      | 724      | 16709  | 734      | 1      |
| 705      | 46312  | 715      | 0      | 725      | 49807  | 735      | 0      |
| 706      | 0      | 716      | 0      | 726      | 0      | 736      | 0      |
| 707      | 0      | 717      | 0      | 727      | 0      | 737      | 0      |
| 708      | 100    | 718      | 0      | 728      | 677    | 738      | 0      |
| 709      | 0      | 719      | 0      | 729      | 0      | 739      | 0      |

Modbus Slave Table

| Register | Name                  | Value (Hex) | Notes                     |
|----------|-----------------------|-------------|---------------------------|
| 700      | Total Litter (32-bit) | 0x4249      | 32-bit float (part 1)     |
| 701      | Total Litter (32-bit) | 0x75C3      | 32-bit float (part 2)     |
| 702      |                       | 0x0000      |                           |
| 703      |                       | 0x0000      |                           |
| 704      | Totallizer Amount     | 0x4145      | 32-bit float (part 1)     |
| 705      |                       | 0xB4E8      | 32-bit float (part 2)     |
| 706      |                       | 0x0000      |                           |
| 707      |                       | 0x0000      |                           |
| 708      | Live Data Liter       | 0x0064      | 16-bit integer (100)      |
| 709      |                       | 0x0000      |                           |
| 710      |                       | 0x0000      |                           |
| 711      |                       | 0x0000      |                           |
| 712      | Live Price (32-bit)   | 0x0000      | 32-bit float (part 1)     |
| 713      | Live Price (32-bit)   | 0x0000      | 32-bit float (part 2)     |
| 714      |                       | 0x0000      |                           |
| 715      |                       | 0x0000      |                           |
| 716      |                       | 0x0000      |                           |
| 717      |                       | 0x0000      |                           |
| 718      |                       | 0x0000      |                           |
| 719      |                       | 0x0000      |                           |
| 720      |                       | 0x0000      |                           |
| 721      |                       | 0x0000      |                           |
| 722      |                       | 0x0000      |                           |
| 723      |                       | 0x0000      |                           |
| 724      | Sell Litter           | 0x4145      | 32-bit float (part 1)     |
| 725      |                       | 0xC28F      | 32-bit float (part 2)     |
| 726      |                       | 0x0000      |                           |
| 727      |                       | 0x0000      |                           |
| 728      | Sell Liter Per Price  | 0x02A5      | 16-bit integer (677)      |
| 729      |                       | 0x0000      |                           |
| 730      |                       | 0x0000      |                           |
| 731      |                       | 0x0000      |                           |
| 732      | OtherData             | 0x429B      | 32-bit float (part 1)     |
| 733      |                       | 0xF5C3      | 32-b-t float (part 2)     |
| 734      | Pump On&Off           | 0x0001      | 16-bit integer (1)        |
| 735      |                       | 0x0000      |                           |
| 736      |                       | 0x0000      |                           |
| 737      |                       | 0x0000      |                           |
| 738      |                       | 0x0000      |                           |
| 739      |                       | 0x0000      |                           |

----





