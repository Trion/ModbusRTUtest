
// Modbus data parser
// This script is a simple example of how to parse Modbus data from an array of 16-bit registers. and convert them to 32-bit float values.
// Input rawdata array (your provided values)
const rawdata = [
    16969, 30147, 0, 0, 16709, 46312, 0, 0, 100, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 16709, 49807, 0, 0, 677, 0,
    0, 0, 17075, 62915, 1, 0, 0, 0, 0, 0
  ];
  
  // Function to convert two 16-bit registers to a 32-bit float
  function registersToFloat(highWord, lowWord) {
    // Combine into a 32-bit integer: highWord << 16 | lowWord
    const combined = (highWord << 16) | (lowWord & 0xFFFF);
    
    // Create a buffer for Float32Array
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setUint32(0, combined); // Big-endian
    
    // Return the float value
    return view.getFloat32(0);
  }
  
  // Function to parse Modbus data starting at register 700
  function parseModbusData(rawdata, startRegister = 700) {
    // Adjust index based on start register (700 = index 0)
    const offset = startRegister - 700;
    
    // Extract values
    const result = {
      TotalLitter: registersToFloat(rawdata[0 - offset], rawdata[1 - offset]),         // rawdata[0],rawdata[1]         // 700–701
      TotallizerAmount: registersToFloat(rawdata[4 - offset], rawdata[5 - offset]),    // 704–705
      LiveDataLiter: rawdata[8 - offset],                                              // 708 (16-bit)
      LivePrice: registersToFloat(rawdata[12 - offset], rawdata[13 - offset]),         // 712–713
      SellLitter: rawdata[24 - offset],                                                // 724 (16-bit)
      SellLiterPerPrice: rawdata[28 - offset],                                         // 728 (16-bit)
      OtherData: registersToFloat(rawdata[32 - offset], rawdata[33 - offset]),         // 732–733 (32-bit float)
      PumpOnOff: rawdata[34 - offset]                                                  // 734 (16-bit)
    };
    
    return result;
  }

// 
  
  // Execute and log the result
  const parsedData = parseModbusData(rawdata, 700);
  console.log("Parsed Modbus Data:");
  console.log(`Total Litter (700–701): ${parsedData.TotalLitter}`);
  console.log(`Totallizer Amount (704–705): ${parsedData.TotallizerAmount}`);
  console.log(`Live Data Liter (708): ${parsedData.LiveDataLiter}`);
  console.log(`Live Price (712–713): ${parsedData.LivePrice}`);
  console.log(`Sell Litter (724): ${parsedData.SellLitter}`);
  console.log(`Sell Liter Per Price (728): ${parsedData.SellLiterPerPrice}`);
  console.log(`Other Data (732–733): ${parsedData.OtherData}`);
  console.log(`Pump On&Off (734): ${parsedData.PumpOnOff}`);

  

  //function floatToRegisters(floatValue) {
    //     const buffer = new ArrayBuffer(4);
    //     const view = new DataView(buffer);
    //     view.setFloat32(0, floatValue);
    //     const combined = view.getUint32(0);
    //     const lowWord = (combined >> 16) & 0xFFFF;  // Swap high/low
    //     const highWord = combined & 0xFFFF;
    //     return [highWord, lowWord]; // Adjust order as needed
    //   }
//   // Convert float to registers
//   const floatValue =12.356666564941406;
//   console.log(`floatToRegister (704-705): ${floatToRegisters(floatValue)}`); // return array of 2 registers
// // Output:
//   console.log(floatToRegisters(floatValue));

