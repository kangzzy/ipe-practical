const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/정보처리기사_실기_문제집.html','utf8');
const data=JSON.parse(fs.readFileSync(__dirname+'/questions.json','utf8'));
const code=html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
new vm.Script(code);
const elements=new Map();
function element(id){if(!elements.has(id))elements.set(id,{textContent:id==='book-data'?JSON.stringify(data):'',innerHTML:'',value:'',scrollTop:0,querySelectorAll:()=>[],querySelector:()=>null,scrollIntoView:()=>{},setAttribute:()=>{}});return elements.get(id);}
const sandbox={document:{getElementById:element,querySelectorAll:()=>[],activeElement:null},window:{addEventListener:()=>{}},localStorage:{getItem:()=>null,setItem:()=>{}},setTimeout:()=>0,clearTimeout:()=>{},console};
vm.createContext(sandbox);vm.runInContext(code,sandbox);
const run=s=>vm.runInContext(s,sandbox);
assert.equal((element('grape-map').innerHTML.match(/data-grape=/g)||[]).length,381);
assert.equal(run('queue.length'),24);
run("memory.records[DATA.questions[0].id]={status:'wrong',star:true,again:true};renderGrapes()");
const first=element('grape-map').innerHTML.match(/<button class="grape [\s\S]*?<\/button>/)[0];
assert(first.includes('s-wrong'));assert(first.includes('grape-star'));assert(first.includes('grape-again'));
run("kind='';status='again';queue=DATA.questions.filter(matches)");assert.equal(run('queue.length'),1);
run("status='review';queue=DATA.questions.filter(matches)");assert.equal(run('queue.length'),1);
run("memory.records[DATA.questions[0].id]={status:'right',again:true};renderGrapes()");assert(element('grape-map').innerHTML.includes('grape s-again'));
run("memory.records[DATA.questions[0].id]={status:'right'};renderGrapes()");assert(element('grape-map').innerHTML.includes('grape s-right'));
assert.equal(run("validateRecord({records:{[DATA.questions[0].id]:{star:true,again:true,status:'wrong',draft:'hello'}}}).records[DATA.questions[0].id].again"),true);
assert.equal(run("validateRecord({records:{[DATA.questions[0].id]:{status:'unsure'}}}).records[DATA.questions[0].id].status"),'unsure');
run("jumpToQuestion(DATA.questions[380].id)");assert.equal(run('queue[pos].id'),data.questions[380].id);assert.equal(run('kind'),'');assert.equal(run('status'),'');
assert(element('content').innerHTML.includes('id="again"'));
assert.equal(run('revealed'),false);
console.log('PASS: 381 markers, state colors and overlays, review filters, record compatibility, question navigation, again control');

assert(!html.includes('data-view="plan"'));
assert(!html.includes("function renderPlan"));
