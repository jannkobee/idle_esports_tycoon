// Isolated Windows/Edge smoke check. Never opens the player's browser profile.
// Run with Vite on localhost:5179: node scripts/verify-hq.mjs
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const profile = mkdtempSync(path.join(tmpdir(), 'dynasty-hq-'));
const browser = spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', [
  '--headless=new', '--remote-debugging-port=9237', `--user-data-dir=${profile}`,
  '--no-first-run', '--no-default-browser-check', '--enable-unsafe-swiftshader', 'about:blank',
], { windowsHide: true, stdio: 'ignore' });
const errors = [];
let ws;
try {
  let tab;
  for (let i = 0; i < 40; i++) {
    try { tab = await (await fetch('http://127.0.0.1:9237/json/new?about:blank', { method: 'PUT' })).json(); break; }
    catch { await sleep(250); }
  }
  if (!tab) throw Error('Isolated Edge did not start');
  ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }));
  let id = 0;
  const pending = new Map();
  ws.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    if (pending.has(message.id)) { pending.get(message.id)(message); pending.delete(message.id); }
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails);
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const key = ++id;
    const timer = setTimeout(() => { pending.delete(key); reject(Error(`Timed out: ${method}`)); }, 45000);
    pending.set(key, result => { clearTimeout(timer); result.error ? reject(Error(JSON.stringify(result.error))) : resolve(result.result); });
    ws.send(JSON.stringify({ id: key, method, params }));
  });
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
    return result.result?.value;
  };
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: false });
  console.log(await send('Page.navigate', { url: 'http://127.0.0.1:5179/' }));
  for (let i = 0; i < 30; i++) {
    await sleep(1000);
    const state = await evaluate('({ url: location.href, ready: document.readyState, canvas: !!document.querySelector("canvas"), text: document.body.innerText.slice(0, 80) })');
    console.log('Loading', state);
    if (state.canvas) break;
    if (i === 29) throw Error('Game canvas never mounted');
  }
  mkdirSync('.tmp/hq-review', { recursive: true });
  for (const level of [0, 1, 10, 25, 50, 100, 250]) {
    await evaluate(`(async () => {
      const storeUrl = performance.getEntriesByType('resource').find(entry => entry.name.includes('/src/core/store/useGameStore.ts'))?.name;
      if (!storeUrl) throw Error('Cannot locate the live store module');
      const {useGameStore} = await import(storeUrl);
      const state = useGameStore.getState();
      useGameStore.setState({facilities: Object.fromEntries(Object.entries(state.facilities).map(([id,f]) => [id,{...f,isUnlocked:${level > 0},level:${Math.max(1, level)}}])),
        ...(${level} === 250 ? {roster: Array.from({length:18}, (_,i) => ({...state.roster[0],id:'qa-pro-'+i,handle:'Pro '+(i+1),portraitIndex:i%6,role:'bench'}))} : {})});
    })()`);
    await sleep(1700);
    const roomText = await evaluate('document.body.innerText');
    if (level > 0 && !roomText.includes(`LVL ${level}`)) throw Error(`Level ${level} did not reach the UI`);
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(`.tmp/hq-review/level-${level}.png`, Buffer.from(shot.data, 'base64'));
    console.log('Captured level', level);
  }
  for (let i = 0; i < 2; i++) {
    await evaluate(`document.querySelector('button[title="Zoom In"]')?.click()`);
    await sleep(700);
  }
  const detail = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync('.tmp/hq-review/equipment-detail.png', Buffer.from(detail.data, 'base64'));
  await evaluate(`document.querySelector('button[title="Reset House Camera"]')?.click()`);
  let frame = 0;
  for (const title of ['Show Roof', 'Switch to 2F Penthouse Dorms, Comfort Rooms & Balcony', 'Show Roof', 'Reset House Camera']) {
    await evaluate(`document.querySelector('button[title=${JSON.stringify(title)}]')?.click()`);
    await sleep(1000);
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(`.tmp/hq-review/${++frame}-${title.split(' ')[0]}.png`, Buffer.from(shot.data, 'base64'));
  }
  const checkLayout = async () => {
    const layout = await evaluate('({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,buttons:[...document.querySelectorAll("button[title]")].map(b=>({title:b.title,left:b.getBoundingClientRect().left,right:b.getBoundingClientRect().right}))})');
    console.log('Layout', layout);
    if (layout.scrollWidth > layout.width || layout.buttons.some(b => b.left < 0 || b.right > layout.width)) throw Error('Off-screen controls');
  };
  await checkLayout();
  await send('Emulation.setDeviceMetricsOverride', { width: 844, height: 390, deviceScaleFactor: 1, mobile: false });
  await sleep(1500);
  await checkLayout();
  const landscape = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  writeFileSync('.tmp/hq-review/landscape.png', Buffer.from(landscape.data, 'base64'));
  if (errors.length) throw Error(JSON.stringify(errors));
  await send('Browser.close');
} catch (error) {
  console.error(error, errors);
  process.exitCode = 1;
} finally {
  ws?.close();
  browser.kill();
}
