const fs=require('node:fs');
const path=require('node:path');
const topics=[];
function T(category,slug,title,note,pitfall,rows){
 topics.push({category,slug,title,note,pitfall,url:`https://www.sqldpass.com/concept/${slug}?examType=ENGINEER_PRACTICAL`,questions:rows.map((r,i)=>({id:`${slug}-${i+1}`,prompt:r[0],answer:r[1],explanation:r[2],kind:'기본',category,topic:slug}))});
}
for(const name of ['coding','data','software','network']) require(`./content-${name}.js`)(T);
const groups=[['C언어',9],['공통 기초',85],['Java',10],['Python',11],['SQL',12],['소프트웨어 설계',13],['소프트웨어 개발',84],['데이터베이스',14],['네트워크/OS',15],['보안/신기술',16]];
function extra(slug,i,prompt,answer,explanation,trace){const t=topics.find(x=>x.slug===slug);t.questions.push({id:`${slug}-extra-${i}`,prompt,answer:String(answer),explanation,trace,kind:'추가 변형',category:t.category,topic:slug});}
for(let i=0;i<20;i++){
 const values=[2+i,7+i*2,12+i*3,18+i*2,25+i],offset=1+i%2,delta=2+i%5,target=offset+1;
 extra('c-pointer-array',i+1,`다음 C 코드의 출력을 구하시오.\nint a[]={${values.join(',')}};\nint *p=a+${offset};\np[1]+=${delta};\nprintf("%d %d", *p, a[${target}]);`,`${values[offset]} ${values[target]+delta}`,`① p는 a[${offset}]을 가리킨다. ② p[1]은 기준 주소보다 한 원소 뒤인 a[${target}]다. ③ 그 값 ${values[target]}에 ${delta}를 더해 ${values[target]+delta}로 바꾼다. p 자체는 이동하지 않아 *p는 ${values[offset]}다.`,{headers:['단계',`a[${offset}]`,`a[${target}]`],rows:[['초기',values[offset],values[target]],['p[1] 변경 후',values[offset],values[target]+delta]]});
 const n=37+i*7;
 extra('common-number-base',i+1,`10진수 ${n}을 2진수와 16진수로 각각 바꾸시오.`,`${n.toString(2)}, ${n.toString(16).toUpperCase()}`,`2진수는 2로 나눈 나머지를 역순으로 읽어 ${n.toString(2)}다. 16진수는 ${Math.floor(n/16)}×16+${n%16}로 분해하므로 ${n.toString(16).toUpperCase()}다. A~F는 10~15에 대응한다. 2진수를 오른쪽부터 네 자리씩 묶어 16진수와 교차 확인할 수 있다.`,{headers:['표현','값'],rows:[['10진수',n],['2진수',n.toString(2)],['16진수',n.toString(16).toUpperCase()]]});
 const a=9+i,b=5+(i*3)%24,op=['&','|','^'][i%3],v=op==='&'?a&b:op==='|'?a|b:a^b;
 extra('c-bitwise',i+1,`음수가 아닌 정수 ${a}와 ${b}에 대해 ${a} ${op} ${b}의 10진수 결과를 구하시오.`,v,`${a}=${a.toString(2).padStart(5,'0')}, ${b}=${b.toString(2).padStart(5,'0')}로 자릿수를 맞춘다. ${op==='&'?'AND는 둘 다 1인 자리':op==='|'?'OR는 하나라도 1인 자리':'XOR는 서로 다른 자리'}만 1이다. 결과 ${v.toString(2).padStart(5,'0')}를 10진수로 읽으면 ${v}다. 논리 연산과 달리 비트마다 계산한다.`,{headers:['항목','2진수'],rows:[['왼쪽',a.toString(2).padStart(5,'0')],['오른쪽',b.toString(2).padStart(5,'0')],['결과',v.toString(2).padStart(5,'0')]]});
 const prefix=25+i%5,block=2**(32-prefix),host=17+(i*11)%220,start=Math.floor(host/block)*block,end=start+block-1,base=`192.168.${10+i}.`;
 extra('net-subnetting',i+1,`${base}${host}/${prefix}의 네트워크 주소, 브로드캐스트 주소, 호스트 사용 가능 수를 구하시오. 일반적인 IPv4 서브넷이다.`,`${base}${start}, ${base}${end}, ${block-2}개`,`호스트 비트는 ${32-prefix}개이므로 블록 크기는 2^${32-prefix}=${block}다. 마지막 옥텟 ${host}를 ${block}으로 나눈 몫은 ${Math.floor(host/block)}이므로 블록 시작은 ${start}다. 끝은 ${start}+${block}-1=${end}다. 네트워크·브로드캐스트를 제외하면 ${block-2}개의 호스트 주소를 쓸 수 있다.`,{headers:['구분','주소'],rows:[['네트워크',base+start],['첫 호스트',base+(start+1)],['마지막 호스트',base+(end-1)],['브로드캐스트',base+end]]});
 const bursts=[2+i%7,3+(i*2)%8,1+(i*3)%5],wait=[0,bursts[0],bursts[0]+bursts[1]],done=bursts.map((b,j)=>b+wait[j]),sum=wait.reduce((a,b)=>a+b,0);
 extra('net-cpu-scheduling',i+1,`P1,P2,P3가 모두 시각 0에 도착했다. CPU 시간은 각각 ${bursts.join(', ')}이다. P1→P2→P3 FCFS에서 각 대기시간과 평균 대기시간을 구하시오. I/O와 문맥 교환 비용은 없다.`,`${wait.join(', ')}; 평균 ${sum}/3 ≈ ${(sum/3).toFixed(2)}`,`P1은 바로 시작해 0만큼 기다린다. P2는 P1의 실행 시간 ${bursts[0]}만큼 기다린다. P3는 앞 두 작업의 합 ${wait[2]}만큼 기다린다. 평균은 (0+${wait[1]}+${wait[2]})/3=${sum}/3이다. 완료시각을 대기시간으로 잘못 더하지 않도록 한다.`,{headers:['프로세스','실행','대기','완료'],rows:bursts.map((b,j)=>[`P${j+1}`,b,wait[j],done[j]])});
 const u=4+i*2,w=10+i*2,total=u+w;
 extra('sql-group-aggregate',i+1,`T(v)에 순서와 무관하게 ${u}, NULL, ${w}, 0이 있다. 다음 조회의 결과를 쓰시오.\nSELECT COUNT(*),COUNT(v),SUM(v),AVG(v) FROM T;`,`4, 3, ${total}, ${total}/3 ≈ ${(total/3).toFixed(4)}`,`COUNT(*)는 모든 4행을 센다. COUNT(v)는 NULL만 제외해 3이다. SUM은 ${u}+${w}+0=${total}이고 AVG는 값이 있는 3행으로 나눈 ${total}/3이다. 0은 실제 값이므로 분모에서 빠지지 않는다. 표시 소수 자릿수는 DBMS마다 다를 수 있어 정확한 분수도 정답이다.`,{headers:['행의 값','COUNT(v)·AVG 포함'],rows:[[u,'포함'],['NULL','제외'],[w,'포함'],[0,'포함']]});
}
const trace={
 'c-recursion-function-1':{headers:['호출','반환 계산','반환값'],rows:[['f(1)','기저 조건',1],['f(2)','2×1',2],['f(3)','3×2',6],['f(4)','4×6',24]]},
 'c-pointer-array-1':{headers:['단계','p의 대상','a[1]','a[2]'],rows:[['초기','a[1]',6,9],['p[1]+=4 후','a[1]',6,13]]},
 'java-control-operator-1':{headers:['평가','식에 쓰는 값','직후 x'],rows:[['초기','-',3],['x++',3,4],['++x',5,5],['덧셈',8,5]]},
 'sql-select-query-1':{headers:['id','score','score>=80','남는가'],rows:[[1,70,'FALSE','아니오'],[2,'NULL','UNKNOWN','아니오'],[3,90,'TRUE','예']]},
 'sql-join-1':{headers:['A.id','B.id','B.label'],rows:[[1,'NULL','NULL'],[2,2,'X'],[2,2,'Y']]},
 'sql-group-aggregate-3':{headers:['그룹','SUM(v)','SUM(v)>6'],rows:[['A',6,'FALSE'],['B',8,'TRUE']]},
 'sql-window-1':{headers:['점수','RANK','DENSE_RANK'],rows:[[90,1,1],[90,1,1],[80,3,2]]},
 'net-cpu-scheduling-1':{headers:['프로세스','실행 구간','대기'],rows:[['P1','0~5',0],['P2','5~8',5],['P3','8~10',8]]}
};
const questions=topics.flatMap(t=>t.questions);for(const q of questions)if(trace[q.id])q.trace=trace[q.id];
const advancedCounts={};
require('./content-advanced.js')((slug,language,code,answer,explanation,rows)=>{
 const t=topics.find(t=>t.slug===slug);if(!t)throw Error(`Unknown topic ${slug}`);
 const n=advancedCounts[slug]=(advancedCounts[slug]||0)+1;
 questions.push({id:`${slug}-advanced-${n}`,category:t.category,topic:slug,kind:'실전 심화',language,code,prompt:`다음 ${language} 코드의 실행 결과를 쓰시오. 출력 순서와 최종 상태를 추적하세요.\n${code}`,answer,explanation,trace:{headers:['단계','상태·계산'],rows}});
});
const tuples=[[2026,2,1627],[2026,1,325],[2025,3,694],[2025,2,693],[2025,1,692],[2024,3,341],[2024,2,340],[2024,1,339],[2023,3,338],[2023,2,337],[2023,1,336],[2022,3,335],[2022,2,334],[2022,1,333],[2021,3,332],[2021,2,331],[2021,1,330],[2020,4,329],[2020,3,328],[2020,2,327],[2020,1,326]];
const exams=tuples.map(([year,round,id])=>({year,round,mooneo:`https://www.sqldpass.com/past-exams/${id}`,article:`https://www.sqldpass.com/blog/past-exam/engineer-${year}-${round}`,itpass:year>=2023?`https://itpasslab.com/practical/engineer-practical-reconstructed-${year}-${round}`:null}));
const data={version:1,created:'2026-10-21',description:'자체 제작 기본 237문항, 추가 변형 120문항, 실전 심화 24문항. 공식 기출 아님. 사이트 문제 본문 미포함.',groups:groups.map(([name,leg])=>({name,url:`https://www.sqldpass.com/study?examType=ENGINEER_PRACTICAL&leg=${leg}`})),topics:topics.map(({questions,...t})=>t),questions,exams,references:[{title:'분류 기준 · 문어CBT 로드맵',url:'https://www.sqldpass.com/study?examType=ENGINEER_PRACTICAL'},{title:'Python 공식 문서 · 자료구조',url:'https://docs.python.org/3/tutorial/datastructures.html'},{title:'PostgreSQL 공식 문서 · 윈도우 함수',url:'https://www.postgresql.org/docs/current/tutorial-window.html'},{title:'Java 공식 학습 · 상속',url:'https://dev.java/learn/inheritance/'},{title:'OWASP · CSRF',url:'https://community.owasp.org/attacks/csrf'}]};
if(data.topics.length!==79||questions.length!==381)throw Error(`Count mismatch ${data.topics.length}/${questions.length}`);
if(new Set(questions.map(q=>q.id)).size!==questions.length)throw Error('Duplicate ID');
if(new Set(questions.map(q=>q.prompt)).size!==questions.length)throw Error('Duplicate prompt');
for(const q of questions)if(!q.prompt||!q.answer||q.explanation.length<40)throw Error(`Incomplete ${q.id}`);
const json=JSON.stringify(data,null,2);
fs.writeFileSync(path.join(__dirname,'questions.json'),json);
const html=fs.readFileSync(path.join(__dirname,'template.html'),'utf8').replace('__DATA__',json.replace(/</g,'\\u003c'));
fs.writeFileSync(path.join(__dirname,'정보처리기사_실기_문제집.html'),html);
fs.mkdirSync(path.join(__dirname,'../docs'),{recursive:true});
fs.writeFileSync(path.join(__dirname,'../docs/index.html'),html);
fs.writeFileSync(path.join(__dirname,'../docs/.nojekyll'),'');
console.log(JSON.stringify({topics:data.topics.length,questions:questions.length,base:questions.filter(q=>q.kind==='기본').length,variants:120,categories:data.groups.map(g=>[g.name,questions.filter(q=>q.category===g.name).length]),htmlBytes:Buffer.byteLength(html)},null,2));
