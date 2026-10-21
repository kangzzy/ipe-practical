"""Content verification: execute Python/SQL and independently verify generated exercises."""
import json,io,contextlib,sqlite3,ipaddress,re,math
from pathlib import Path
root=Path(__file__).parent
book=json.loads((root/'questions.json').read_text(encoding='utf-8'))
qs={q['id']:q for q in book['questions']}; checks=[]
def check(label,actual,expected):
 assert actual==expected,(label,actual,expected)
 checks.append(label)
def runpy(label,code,expected):
 out=io.StringIO()
 with contextlib.redirect_stdout(out): exec(code,{})
 check(label,out.getvalue().strip(),expected)
cases={
 'py-operator-flow-1':('print(-7//3, -7%3)','-3 2'),
 'py-operator-flow-2':('def f(x, a=[]):\n a.append(x)\n return len(a)\nprint(f(1),f(2))','1 2'),
 'py-operator-flow-3':('print(isinstance(True,int), type(True) is int)','True False'),
 'py-list-slicing-1':('a=[0,1,2,3,4,5]; print(a[1:5:2])','[1, 3]'),
 'py-list-slicing-2':('print([x*x for x in range(5) if x%2==1])','[1, 9]'),
 'py-list-slicing-3':('a=[2,4,6,8]; print(a[::-1])','[8, 6, 4, 2]'),
 'py-shallow-copy-1':('a=[[1],[2]]; b=a.copy(); b[0].append(9); print(a)','[[1, 9], [2]]'),
 'py-shallow-copy-2':('a=[[1],[2]]; b=a.copy(); b[0]=[9]; print(a)','[[1], [2]]'),
 'py-shallow-copy-3':('a=[[0]*2]*3; a[0][1]=7; print(a)','[[0, 7], [0, 7], [0, 7]]'),
 'py-string-1':('s="NETWORK"; print(s[1:6:2])','EWR'),
 'py-string-2':('s="CODE"; print(s[-1]+s[-3])','EO'),
 'py-set-dict-1':('a={1,2,3};b={3,4};print(sorted(a&b),sorted(a-b))','[3] [1, 2]'),
 'py-set-dict-2':('d={"a":1,"b":2};d["a"]=5;print(len(d),d["a"])','2 5'),
 'py-set-dict-3':('d={"x":3};print(d.get("y",0),"x" in d)','0 True'),
 'py-lambda-map-1':('print(list(map(lambda x:x+2,[1,3,5])))','[3, 5, 7]'),
 'py-lambda-map-2':('fs=[lambda:i for i in range(3)]; print([f() for f in fs])','[2, 2, 2]'),
 'py-lambda-map-3':('m=map(lambda x:x*2,[2,3]);print(list(m),list(m))','[4, 6] []')}
for label,(code,expected) in cases.items():
 check(label+' authored answer',qs[label]['answer'],expected)
 runpy(label,code,expected)
try: exec('s="cat";s[0]="b"'); raise AssertionError('Expected TypeError')
except TypeError: checks.append('py-string-3 TypeError')
db=sqlite3.connect(':memory:')
def sql(label,setup,query,expected):
 c=sqlite3.connect(':memory:');c.executescript(setup);result=c.execute(query).fetchall();c.close();check(label,result,expected)
sql('WHERE NULL','create table T(id,score);insert into T values(1,70),(2,NULL),(3,90);','select id from T where score>=80 order by id',[(3,)])
sql('ORDER BY','create table T(id,score);insert into T values(1,60),(2,90),(3,90);','select id from T order by score desc,id asc',[(2,),(3,),(1,)])
sql('LEFT JOIN','create table A(id);create table B(id,label);insert into A values(1),(2);insert into B values(2,"X"),(2,"Y");','select A.id,B.id,label from A left join B on A.id=B.id order by A.id,label',[(1,None,None),(2,2,'X'),(2,2,'Y')])
sql('COUNT AVG','create table T(v);insert into T values(10),(NULL),(20);','select count(*),count(v),avg(v) from T',[(3,2,15.0)])
sql('HAVING','create table T(g,v);insert into T values("A",2),("A",4),("B",8);','select g from T group by g having sum(v)>6',[('B',)])
sql('NOT IN NULL','','select 5 not in (2,NULL)',[(None,)])
sql('WINDOW','create table T(score);insert into T values(90),(90),(80);','select rank() over(order by score desc),dense_rank() over(order by score desc) from T',[(1,1),(1,1),(3,2)])
sql('DML','create table Item(id,qty);insert into Item values(1,4),(2,7);update Item set qty=qty+3 where id=2;','select qty from Item order by id',[(4,),(10,)])
for q in book['questions']:
 if q['kind']!='추가 변형':continue
 label=q['id'];p=q['prompt'];a=q['answer'];t=q['trace']
 if q['topic']=='net-subnetting':
  ip=re.search(r'\d+\.\d+\.\d+\.\d+/\d+',p).group();net=ipaddress.ip_network(ip,strict=False)
  check(label,a,f'{net.network_address}, {net.broadcast_address}, {net.num_addresses-2}개')
 elif q['topic']=='common-number-base':
  n=int(re.search(r'10진수 (\d+)',p).group(1));binary,hexa=a.split(', ');check(label,(int(binary,2),int(hexa,16)),(n,n))
 elif q['topic']=='c-bitwise':
  m=re.search(r'대해 (\d+) ([&|^]) (\d+)',p);l,op,r=int(m[1]),m[2],int(m[3]);res={'&':l&r,'|':l|r,'^':l^r}[op];check(label,int(a),res)
 elif q['topic']=='net-cpu-scheduling':
  bursts=list(map(int,re.search(r'각각 ([\d, ]+)이다',p)[1].split(',')));clock=0;wait=[]
  for burst in bursts:wait.append(clock);clock+=burst
  check(label,[r[2] for r in t['rows']],wait)
 elif q['topic']=='sql-group-aggregate':
  nums=[r[0] for r in t['rows']];db.execute('drop table if exists T');db.execute('create table T(v)');db.executemany('insert into T values(?)',[(None if x=='NULL' else x,) for x in nums]);result=db.execute('select count(*),count(v),sum(v),avg(v) from T').fetchone();parts=a.split(', ');fraction=parts[3].split(' ≈')[0];num,den=map(int,fraction.split('/'));check(label,result,(int(parts[0]),int(parts[1]),int(parts[2]),num/den))
 elif q['topic']=='c-pointer-array':
  arr=list(map(int,re.search(r'a\[\]=\{([\d,]+)\}',p)[1].split(',')));offset=int(re.search(r'\*p=a\+(\d+)',p)[1]);delta=int(re.search(r'p\[1\]\+=(\d+)',p)[1]);arr[offset+1]+=delta;check(label,a,f'{arr[offset]} {arr[offset+1]}')
check('topic count',len(book['topics']),79);check('question count',len(book['questions']),381)
check('all topics base coverage',all(sum(q['topic']==t['slug'] and q['kind']=='기본' for q in book['questions'])==3 for t in book['topics']),True)
for q in book['questions']:
 if q.get('language')=='Python':runpy(q['id'],q['code'],q['answer'])
report={'passed':len(checks),'checks':checks,'limits':['C/Java 컴파일러가 없어 해당 예제는 직접 컴파일하지 못했음. C/Java 개념·제어 흐름은 수작업 검토.','SQL 실행 검사는 SQLite에서 공통 의미를 확인함. DBMS별 권한·일부 문법은 실행 검사 대상 아님.','사이트 링크는 공개 목록의 URL 확인이며 각 사이트 모든 문제의 내용을 검수한 것은 아님.']}
(root/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(f'PASS: {len(checks)} content checks')
