import fs from 'fs';
fetch('https://raw.githubusercontent.com/Akhathuto/Edgtec-Projects/main/README.md')
  .then(res => res.text())
  .then(text => fs.writeFileSync('temp_readme.md', text));
