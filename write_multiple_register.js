const { SerialPort } = require('serialport');

// original version of crc function (same in fms firmware crc release code )
// CRC-16 function
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

// Function to convert float to two 16-bit registers
function floatToRegisters(floatValue) {
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  view.setFloat32(0, floatValue);
  const combined = view.getUint32(0);
  return [(combined >> 16) & 0xFFFF, combined & 0xFFFF];
}

// Function to write multiple registers
async function writeMultipleRegisters(startRegister, floatValue) {
  try {
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

    const slaveId = 1;
    const functionCode = 0x10;
    const writeQty = 2;
    const transmitBuffer = floatToRegisters(floatValue);
    
    let adu = [];
    let aduSize = 0;

    adu[aduSize++] = slaveId;
    adu[aduSize++] = functionCode;
    adu[aduSize++] = highByte(startRegister);
    adu[aduSize++] = lowByte(startRegister);
    adu[aduSize++] = highByte(writeQty);
    adu[aduSize++] = lowByte(writeQty);
    adu[aduSize++] = lowByte(writeQty << 1);

    for (let i = 0; i < writeQty; i++) {
      adu[aduSize++] = highByte(transmitBuffer[i]);
      adu[aduSize++] = lowByte(transmitBuffer[i]);
    }

    const crc = calculateCRC(adu.slice(0, aduSize));
    adu[aduSize++] = lowByte(crc);
    adu[aduSize++] = highByte(crc);

    const fullPacket = Buffer.from(adu);

    await new Promise((resolve, reject) => {
      port.write(fullPacket, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log(`Wrote ${floatValue} to registers ${startRegister}–${startRegister + writeQty - 1}`);
    console.log(`Register ${startRegister}: 0x${transmitBuffer[0].toString(16).padStart(4, '0')} (${transmitBuffer[0]})`);
    console.log(`Register ${startRegister + 1}: 0x${transmitBuffer[1].toString(16).padStart(4, '0')} (${transmitBuffer[1]})`);
    console.log("Packet (hex):", fullPacket.toString('hex').match(/.{1,2}/g).join(" "));

    await new Promise((resolve) => port.close(resolve));
  } catch (error) {
    console.error("Error with SerialPort:", error);
  }
}

 // writing 32 bit float value to 2 registers
// Example: Write 12.35667 to registers 704–705
writeMultipleRegisters(704, 156.96); 