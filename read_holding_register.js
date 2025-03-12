const { SerialPort } = require('serialport');

// CRC-16 function from your C code
function crc16Update(crc, a) {
  crc ^= a;
  for (let i = 0; i < 8; ++i) {
    if (crc & 1) {
      crc = (crc >> 1) ^ 0xA001;
    } else {
      crc = (crc >> 1);
    }
  }
  return crc & 0xFFFF;
}

function calculateCRC(bytes) {
  let crc = 0xFFFF;
  for (let byte of bytes) {
    crc = crc16Update(crc, byte);
  }
  return crc;
}

// Helper functions for byte manipulation
function highByte(value) {
  return (value >> 8) & 0xFF;
}

function lowByte(value) {
  return value & 0xFF;
}

// Function to read multiple registers
async function readMultipleRegisters(startRegister, numRegisters) {
  try {
    // Open serial port
    const port = new SerialPort({
      path: 'COM4', // Adjust to your port
      baudRate: 9600,
      dataBits: 8,
      parity: 'none',
      stopBits: 1
    });

    await new Promise((resolve, reject) => {
      port.on('open', resolve);
      port.on('error', reject);
    });

    // Build request packet
    const slaveId = 1;
    const functionCode = 0x03;
    const packet = Buffer.from([
      slaveId,
      functionCode,
      highByte(startRegister),
      lowByte(startRegister),
      highByte(numRegisters),
      lowByte(numRegisters)
    ]);

    const crc = calculateCRC(packet);
    const fullPacket = Buffer.concat([packet, Buffer.from([lowByte(crc), highByte(crc)])]);

    // Send request
    await new Promise((resolve, reject) => {
      port.write(fullPacket, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log("Sent request (hex):", fullPacket.toString('hex').match(/.{1,2}/g).join(" "));

    // Read response
    let response = Buffer.alloc(0);
    await new Promise((resolve) => {
      port.on('data', (data) => {
        response = Buffer.concat([response, data]);
        // Expect: Slave ID (1) + FC (1) + Byte Count (1) + Data (80) + CRC (2) = 85 bytes
        if (response.length >= 3 + numRegisters * 2 + 2) {
          resolve();
        }
      });
    });

    // Parse response
    if (response[0] === slaveId && response[1] === functionCode) {
      const byteCount = response[2];
      if (byteCount !== numRegisters * 2) {
        throw new Error(`Expected ${numRegisters * 2} bytes, got ${byteCount}`);
      }

      const data = response.slice(3, 3 + byteCount);
      const registers = [];
      for (let i = 0; i < byteCount; i += 2) {
        registers.push((data[i] << 8) | data[i + 1]);
      }

      console.log(`Read ${registers.length} registers from ${startRegister}:`);
      registers.forEach((val, idx) => {
        console.log(`Register ${startRegister + idx}: ${val} (0x${val.toString(16).padStart(4, '0')})`);
      });

      // Verify CRC
      const receivedCRC = (response[response.length - 1] << 8) | response[response.length - 2];
      const calculatedCRC = calculateCRC(response.slice(0, -2));
      console.log("CRC Valid:", receivedCRC === calculatedCRC);
    } else {
      console.error("Invalid response:", response.toString('hex').match(/.{1,2}/g).join(" "));
    }

    // Close port
    await new Promise((resolve) => port.close(resolve));
  } catch (error) {
    console.error("Error with SerialPort:", error);
  }
}

// Example: Read 40 registers starting at 700
readMultipleRegisters(700, 40);