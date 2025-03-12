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

// Function to write a single register
async function writeSingleRegister(register, value) {
  try {
    const port = new SerialPort({
      path: 'COM4', // Adjust to your port (e.g., /dev/ttyUSB0)
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
    const functionCode = 0x06;
    const packet = Buffer.from([
      slaveId,
      functionCode,
      (register >> 8) & 0xFF,
      register & 0xFF,
      (value >> 8) & 0xFF,
      value & 0xFF
    ]);

    const crc = calculateCRC(packet);
    const fullPacket = Buffer.concat([packet, Buffer.from([crc & 0xFF, (crc >> 8) & 0xFF])]);

    await new Promise((resolve, reject) => {
      port.write(fullPacket, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log(`Wrote ${value} (0x${value.toString(16).padStart(4, '0')}) to register ${register}`);
    console.log("Packet (hex):", fullPacket.toString('hex').match(/.{1,2}/g).join(" "));

    await new Promise((resolve) => port.close(resolve));
  } catch (error) {
    console.error("Error with SerialPort:", error);
  }
}

// Example: Write 1 to register 734
writeSingleRegister(734, 1); // Adjust value as needed