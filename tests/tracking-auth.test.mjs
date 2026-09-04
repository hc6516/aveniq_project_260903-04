import test from 'node:test';import assert from 'node:assert/strict';import {createHmac} from 'node:crypto';
import {authorized} from '../lib/tracking-server.mjs';
const pw='a'.repeat(64);
test('signed session accepted; forged or expired session rejected',()=>{const exp=String(Date.now()+10000),sig=createHmac('sha256',pw).update(exp).digest('hex');const req=value=>new Request('https://a',{headers:{cookie:'aveniq_admin='+value}});assert.equal(authorized(req(exp+'.'+sig),{UTM_ADMIN_PASSWORD:pw}),true);assert.equal(authorized(req(exp+'.'+'x'.repeat(64)),{UTM_ADMIN_PASSWORD:pw}),false);assert.equal(authorized(req('1.'+sig),{UTM_ADMIN_PASSWORD:pw}),false);});
