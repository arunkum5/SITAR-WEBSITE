const fs = require('fs');
let code = fs.readFileSync('functions/api/updateProfile.js', 'utf8');

code = code.replace(
  'pan_number: data.pan || `TEMP-${phone}`',
  'pan_number: data.pan || `T${phone.replace(/\\D/g, "").slice(-9)}`.padEnd(10, "0")'
);
code = code.replace(
  'aadhar_number: data.aadhar || `TEMP-${phone}`',
  'aadhar_number: data.aadhar || `T0${phone.replace(/\\D/g, "").slice(-10)}`.padEnd(12, "0")'
);

fs.writeFileSync('functions/api/updateProfile.js', code);
