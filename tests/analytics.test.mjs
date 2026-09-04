import test from 'node:test';
import assert from 'node:assert/strict';
import { campaignParams, track, GA_ID } from '../lib/analytics.mjs';
test('GA campaign allowlist excludes arbitrary query, email and phone',()=>{
  assert.deepEqual(campaignParams('?utm_source=instagram&utm_medium=social&utm_campaign=launch&email=a@b.com&utm_content=a@b.com&utm_term=010-1234-5678'),{campaign_source:'instagram',campaign_medium:'social',campaign_name:'launch'});
});
test('GA events require consent and public production homepage, never take form values',()=>{
  let sent=[];
  global.window={location:{hostname:'aveniq-launch-page.vercel.app',pathname:'/'},gtag:(...args)=>sent.push(args)};
  global.localStorage={getItem:()=> 'denied'};
  track('generate_lead');assert.equal(sent.length,0);
  global.localStorage={getItem:()=> 'granted'};
  track('generate_lead');assert.equal(sent.length,1);assert.equal(sent[0][2].send_to,GA_ID);
  window.location.pathname='/tools/utm';track('generate_lead');assert.equal(sent.length,1);
  window.location.pathname='/';track('phone');assert.equal(sent.length,1);
  delete global.window;delete global.localStorage;
});

