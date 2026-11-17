import {readFileSync} from 'node:fs';
import {validate} from '../site/core.mjs';
const path=process.argv[2]??new URL('../site/data/offers.json',import.meta.url);
try{const d=validate(JSON.parse(readFileSync(path,'utf8')));console.log(`Validated ${d.offers.length} offers.`);}catch(e){console.error(e.message);process.exit(1);}
