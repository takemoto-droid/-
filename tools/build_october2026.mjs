import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { words, knowledge, english, logic, math } from './october2026_content.mjs';
import { readings } from './october2026_reading.mjs';

const root = path.resolve(import.meta.dirname, '..');
const header = 'question_id,publish_date,seq,genre,difficulty,type,passage,question_text,choice1,choice2,choice3,choice4,answer,explanation,time_limit_sec';
for (const [name, list] of Object.entries({words,knowledge,english,logic,math,readings})) assert.equal(list.length,31,name);
function iso(date) {
  const d = new Date(date); const weekday = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate()+4-weekday);
  const year = d.getUTCFullYear();
  const week = Math.ceil(((d-new Date(Date.UTC(year,0,1)))/86400000+1)/7);
  return {year,week,weekday};
}
let seed = 20261001;
function random(){ seed=(Math.imul(seed,1664525)+1013904223)>>>0; return seed/4294967296; }
function shuffle(xs){ const a=[...xs]; for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }
const rows=[]; const grouped=new Map();
for(let day=1;day<=31;day++){
  const date=`2026-10-${String(day).padStart(2,'0')}`;
  const {year,week,weekday}=iso(new Date(`${date}T00:00:00Z`));
  const answerPositions=shuffle([1,1,2,2,3,3,4,4]);
  const m=math[day-1];
  // 数理の正答と式を独立照合。分数は数値に直して比較する。
  const numeric=typeof m[1]==='string'?Function(`return (${m[1]})`)():m[1];
  assert.ok(Math.abs(numeric-Function(`return (${m[3]})`)())<1e-8,`math day ${day}`);
  const specs=[words[day-1],[m[0],String(m[1]),...m[2].map(String),m[4]],logic[day-1],knowledge[day-1],english[day-1],...readings[day-1].q];
  assert.equal(specs.length,8);
  for(let i=0;i<8;i++){
    const spec=specs[i]; assert.equal(spec.length,6,`${day}/${i+1}`);
    const [question,correct,w1,w2,w3,explanation]=spec;
    assert.equal(new Set([correct,w1,w2,w3]).size,4);
    const answer=answerPositions[i];const options=shuffle([w1,w2,w3]); options.splice(answer-1,0,correct);
    const genres=[day%2?'ことば':'文脈','数理','推論','教養','英語'];
    const difficulty=[1,2,[1,9,15,19,29].includes(day)?3:2,1,2,2,2,3][i];
    const passage=i<5?'':readings[day-1].passage.replace(/\n/g,'\\n');
    const row=[`${year}W${String(week).padStart(2,'0')}-D${weekday}-Q${String(i+1).padStart(2,'0')}`,date,i+1,genres[i]||readings[day-1].genre,difficulty,i<5?'choice4':'reading',passage,question,...options,answer,explanation,[60,90,120,60,90,180,90,90][i]];
    assert.equal(row.length,15); assert.ok(explanation.startsWith('【型: '));
    assert.ok(!/(選択肢\s*[1-4]|[①②③④])/.test(explanation));
    assert.ok(row.every(v=>v!==undefined && !String(v).includes('\r')));
    rows.push(row);if(!grouped.has(week))grouped.set(week,[]);grouped.get(week).push(row);
  }
}
assert.equal(rows.length,248);
assert.equal(new Set(rows.map(r=>r[0])).size,248);
assert.equal(new Set(rows.filter(r=>r[2]===6).map(r=>r[6])).size,31);
for(let answer=1;answer<=4;answer++)assert.equal(rows.filter(r=>r[12]===answer).length,62);
const existingIds=new Set();
for(const filename of await fs.readdir(root)){
  if(!/^questions.*\.csv$/.test(filename) || /^questions_w(40_oct|41|42|43|44)\.csv$/.test(filename))continue;
  const content=await fs.readFile(path.join(root,filename),'utf8'); assert.equal(content.split(/\r?\n/)[0],header,filename);
  for(const line of content.trim().split(/\r?\n/).slice(1))existingIds.add(line.split(',')[0]);
}
for(const row of rows)assert.ok(!existingIds.has(row[0]),`duplicate ${row[0]}`);
// 資料の計算を再確認する。本文の数値を直接使い、正答と一致を確かめる。
const checks=[
  [2,7,Math.max(30/6,32/8,30/5,40/10),'C班'],
  [4,7,18/(45/60),'24km'],
  [6,7,(30-24)+(24-24)+(20-15)+(16-12),'15人'],
  [8,7,50-35,'15秒'],
  [10,7,(60-12)/60*100,'80%'],
  [12,7,30/40*100,'75%'],
  [14,7,24-2-16,'6台'],
  [16,7,200*25,'5000円'],
  [18,7,20/10,'2L'],
  [20,7,10+25+5,'40分'],
  [22,7,60-48,'12個'],
  [24,7,9/3,'3kWh'],
  [26,7,72/80*100,'90%'],
  [28,7,3000+200*20,'7000円'],
  [30,7,(54/60-28/40)*100,'20ポイント']
];
for(const [day,seq,calculated,label] of checks){
  const r=rows[(day-1)*8+seq-1];assert.equal(r[8+r[12]-1],label);
  if(day===2)assert.equal(calculated,6);else assert.ok(Math.abs(calculated-Number.parseFloat(label))<1e-8,`table ${day}`);
}
assert.equal(15/(30/60),20/(40/60));
assert.equal(15/20,12/16);assert.equal(18/12,24/16);assert.equal(18/12,12/8);
assert.equal(120*30,300*12);assert.equal(200*25,500*10);
assert.equal(45/50,63/70);assert.equal(40/50,32/40);
// 順序問題を総当たりし、確定条件を確認。
function permutations(xs){if(!xs.length)return [[]];return xs.flatMap((x,i)=>permutations(xs.filter((_,j)=>i!==j)).map(p=>[x,...p]));}
for(const [day,filter,position,answer] of [
  [1,p=>p.indexOf('A')<p.indexOf('B')&&p.indexOf('C')<p.indexOf('A')&&p.indexOf('D')>p.indexOf('B')&&p.indexOf('E')>p.indexOf('A')&&p.indexOf('E')<p.indexOf('B'),0,'C'],
  [11,p=>p[1]==='A'&&p[3]==='B'&&p.indexOf('C')<p.indexOf('D'),0,'C'],
  [15,p=>p.indexOf('A')<p.indexOf('B')&&p.indexOf('D')<p.indexOf('A')&&p.indexOf('C')>p.indexOf('B')&&p.indexOf('E')>p.indexOf('A')&&p.indexOf('E')<p.indexOf('B'),1,'A'],
  [29,p=>p[0]==='A'&&p.indexOf('B')===p.indexOf('A')+1&&p.indexOf('C')===p.indexOf('D')-1,3,'D']
]){const ps=permutations(day===1||day===15?['A','B','C','D','E']:['A','B','C','D']).filter(filter);assert.ok(ps.length);assert.ok(ps.every(p=>p[position]===answer),`logic ${day}`);}
const csvValue=v=>/[",\r\n]/.test(String(v))||String(v).includes('\\n')?`"${String(v).replace(/"/g,'""')}"`:String(v);
for(const [week,data]of grouped){
  const name=week===40?'questions_w40_oct.csv':`questions_w${week}.csv`;
  const out=header+'\n'+data.map(r=>r.map(csvValue).join(',')).join('\n')+'\n';
  assert.equal(out.split('\n').length,data.length+2);
  await fs.writeFile(path.join(root,name),out,'utf8');
}
// 接続先への転記用。数字列は数字、改行は実改行にする。
const liveRows=rows.map(r=>r.map(v=>typeof v==='string'?v.replace(/\\n/g,'\n'):v));
await fs.writeFile(path.join(root,'tools','october2026_rows.tmp'),JSON.stringify(liveRows));
console.log(JSON.stringify({questions:rows.length,first:rows[0][1],last:rows.at(-1)[1],answers:[1,2,3,4].map(a=>rows.filter(r=>r[12]===a).length),readingSets:readings.filter(r=>r.genre==='読解').length,dataSets:readings.filter(r=>r.genre==='資料').length,existingIds:existingIds.size,files:[...grouped].map(([week,data])=>({file:week===40?'questions_w40_oct.csv':`questions_w${week}.csv`,questions:data.length,first:data[0][1],last:data.at(-1)[1]}))},null,2));
