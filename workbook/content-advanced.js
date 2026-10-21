// Original multi-concept tracing exercises; not reproduced examination questions.
module.exports = function(add) {
const C=(slug,code,answer,explanation,rows)=>add(slug,'C',code,answer,explanation,rows);
const J=(slug,code,answer,explanation,rows)=>add(slug,'Java',code,answer,explanation,rows);
const P=(slug,code,answer,explanation,rows)=>add(slug,'Python',code,answer,explanation,rows);
C('c-pointer-array',`#include <stdio.h>
void change(int **p, int *a) {
    *p += 2;
    **p += a[0];
    a[1] = *(*p - 1) + **p;
}
int main(void) {
    int a[] = {2,4,6,8,10};
    int *p = a + 1;
    change(&p, a);
    *(p - 1) = *p - a[0];
    printf("%d %d %d", a[1], a[2], *p);
    return 0;
}`, '16 8 10',
'이중 포인터 p가 가리키는 것은 호출자의 포인터 변수다. *p += 2로 호출자의 p가 a[1]에서 a[3]으로 이동한다. **p += a[0]은 a[3]을 8+2=10으로 바꾼다. 이후 a[1]은 a[2]+a[3]=6+10=16이다. 함수에서 돌아와 *(p-1)은 a[2]이므로 a[2]=10-2=8이 된다. 출력은 a[1],a[2],a[3] 순서다. 주소 변경과 원소 변경을 같은 열에 쓰지 말고 따로 추적한다.',
[['초기','p→a[1], a={2,4,6,8,10}'],['*p += 2','p→a[3]'],['**p 갱신','a[3]=10'],['a[1] 갱신','a[1]=6+10=16'],['복귀 뒤','a[2]=10-2=8']]);
C('c-recursion-function',`#include <stdio.h>
int f(int n) {
    static int s = 1;
    if (n == 0) return s;
    s += n;
    int x = f(n - 1);
    s += 1;
    return x + s;
}
int main(void) {
    int a = f(2);
    int b = f(1);
    printf("%d %d", a, b);
    return 0;
}`, '15 15',
'static s는 재귀 호출마다 새로 생기지 않고 모든 호출이 공유한다. 첫 f(2)에서 s는 1→3→4가 되어 f(0)이 4를 반환한다. 안쪽 f(1)은 s를 5로 만들고 4+5=9, 바깥 f(2)는 s를 6으로 만들고 9+6=15를 반환한다. 두 번째 f(1)은 s=6에서 시작한다. s=7일 때 f(0)이 7을 반환하고, s=8로 증가한 뒤 7+8=15다. 지역 x는 호출마다 다르지만 s는 하나라는 것이 핵심이다.',
[['첫 f(0)','s=4, 반환 4'],['첫 f(1) 복귀','s=5, x=4, 반환 9'],['첫 f(2) 복귀','s=6, x=9, 반환 15'],['두 번째 f(0)','s=7, 반환 7'],['두 번째 f(1) 복귀','s=8, 반환 15']]);
C('c-pointer-array',`#include <stdio.h>
int main(void) {
    int a[2][3] = {{1,2,3},{4,5,6}};
    int (*p)[3] = a;
    ++p;
    (*p)[0] += a[0][2];
    int *q = *(p - 1) + 1;
    q[1] = (*p)[2] - q[0];
    printf("%d %d %d", q[1], (*p)[0], p[-1][1]);
    return 0;
}`, '4 7 2',
'p는 int 하나가 아니라 int 3개짜리 행을 가리킨다. ++p 뒤 p는 두 번째 행이고 (*p)[0]은 a[1][0]=4+3=7이다. *(p-1)은 첫 행, 거기에 1을 더한 q는 a[0][1]을 가리킨다. q[1]은 a[0][2]이므로 6-2=4로 바뀐다. p[-1][1]은 첫 행의 두 번째 원소 2다. q의 이동은 원소 단위, p의 이동은 행 단위임을 구별한다.',
[['++p','p→두 번째 행'],['(*p)[0] 갱신','두 번째 행 {7,5,6}'],['q 초기화','q→a[0][1]'],['q[1] 갱신','첫 번째 행 {1,2,4}']]);
C('c-struct-linkedlist',`#include <stdio.h>
typedef struct Node { int v; struct Node *next; } Node;
int main(void) {
    Node d={7,NULL}, c={5,&d}, b={3,&c}, a={1,&b};
    Node *cur=&a, *prev=NULL;
    while (cur != NULL) {
        Node *next=cur->next;
        cur->next=prev;
        prev=cur;
        cur=next;
    }
    b.v += a.v;
    int s=0;
    for (Node *p=prev; p!=NULL; p=p->next)
        s=s*2+p->v;
    printf("%d %d", s, b.v);
    return 0;
}`, '85 4',
'첫 반복문은 연결 방향을 뒤집는다. 기존 next를 임시 변수로 보존한 뒤 현재 노드의 next를 prev로 바꾸므로 최종 연결은 d→c→b→a다. 변수 a,b가 가리키는 노드 자체가 바뀌는 것은 아니다. b.v는 3+1=4가 된다. 새 머리부터 값은 7,5,4,1이며 s는 0→7→19→42→85다. 리스트의 순서 변경과 데이터 값 변경을 분리해 계산한다.',
[['역전 후 순서','d(7)→c(5)→b(3)→a(1)'],['b.v 변경','b(4)'],['d 처리','0×2+7=7'],['c 처리','7×2+5=19'],['b 처리','19×2+4=42'],['a 처리','42×2+1=85']]);
C('c-string',`#include <stdio.h>
void flip(char *s, int left, int right) {
    if (left >= right) return;
    char t=s[left];
    s[left]=s[right];
    s[right]=t;
    flip(s,left+2,right-2);
}
int main(void) {
    char s[]="ABCDEFGH";
    flip(s,0,7);
    printf("%s ",s+1);
    s[3]='\\0';
    printf("%s",s);
    return 0;
}`, 'BFDECGA HBF',
'재귀마다 양 끝에서 한 칸이 아니라 두 칸씩 이동한다. 먼저 인덱스 0과 7을 교환하여 HBCDEFGA가 되고, 다음 2와 5를 바꾸어 HBFDECGA가 된다. 다음 호출은 left=4,right=3이라 종료한다. 첫 출력은 s+1부터 읽어 BFDECGA다. 그 후 인덱스 3의 D를 널 문자로 바꾸면 두 번째 출력은 인덱스 0~2의 HBF에서 끝난다. 문자열 전체를 뒤집는 함수로 단정하면 틀린다.',
[['flip(0,7)','HBCDEFGA'],['flip(2,5)','HBFDECGA'],['flip(4,3)','종료'],['s+1 출력','BFDECGA'],['s[3]=널 문자','HBF']]);
C('c-recursion-function',`#include <stdio.h>
int walk(int *a, int n) {
    if (n==0) return 0;
    int old=*a;
    *a += n;
    int rest=walk(a+1,n-1);
    return old+rest+*a;
}
int main(void) {
    int a[]={1,2,3};
    int x=walk(a,3);
    int y=walk(a+1,2);
    printf("%d %d %d %d %d",x,y,a[0],a[1],a[2]);
    return 0;
}`, '18 19 4 6 5',
'첫 호출은 각 원소에 남은 길이 3,2,1을 더해 배열을 {4,4,4}로 만든다. 원래 값과 바뀐 값의 합이 각각 1+4,2+4,3+4이므로 x=18이다. 두 번째는 이미 바뀐 배열의 a[1]부터 시작한다. a[1]은 4+2=6, a[2]는 4+1=5가 되고 y=(4+6)+(4+5)=19다. 함수가 배열을 실제 변경하므로 두 번째 호출에 초기 {1,2,3}을 다시 쓰면 안 된다.',
[['첫 호출 최하위','old=3, 새 값=4, 반환 7'],['첫 호출 중간','old=2, 새 값=4, 반환 13'],['첫 호출 최상위','old=1, 새 값=4, 반환 18'],['두 번째 호출','{4,6,5}, 반환 19']]);
C('c-bitwise',`#include <stdio.h>
int main(void) {
    unsigned int x=0x2D, s=0;
    for (int i=0;i<4;i++) {
        s=(s<<1) | (x&1u);
        x >>= 2;
    }
    printf("%u %u",s,x);
    return 0;
}`, '12 0',
'x=0x2D는 45, 2진수 101101이다. 매번 x의 최하위 비트를 s의 오른쪽에 붙이지만 x는 두 비트씩 버린다. 따라서 추출 비트는 1,1,0,0이다. s는 1→3→6→12, x는 11→2→0→0이다. 모든 비트를 역순으로 읽는 문제가 아니라 한 비트씩 건너뛰며 뽑는 문제다. unsigned와 작은 이동량이므로 부호 확장 문제는 없다.',
[['i=0','추출 1, s=1, x=11'],['i=1','추출 1, s=3, x=2'],['i=2','추출 0, s=6, x=0'],['i=3','추출 0, s=12, x=0']]);
C('c-controlflow',`#include <stdio.h>
int twice(int x){return x*2;}
int down(int x){return x-1;}
int main(void) {
    int (*ops[2])(int)={twice,down};
    int x=3, total=0;
    for(int i=0;i<4;i++) {
        x=ops[i%2](x);
        x+=i;
        total+=x;
    }
    printf("%d %d",x,total);
    return 0;
}`, '16 42',
'ops는 int를 받아 int를 반환하는 함수 포인터의 배열이다. i가 짝수이면 twice, 홀수이면 down을 호출한다. 호출 결과에 i를 더한 뒤 누적하므로 x는 6,6,14,16이다. total은 6+6+14+16=42다. 함수 이름만 선택하는 것이 아니라 직전 반복에서 바뀐 x가 다음 호출의 인자가 된다.',
[['i=0','twice(3)+0=6, total=6'],['i=1','down(6)+1=6, total=12'],['i=2','twice(6)+2=14, total=26'],['i=3','down(14)+3=16, total=42']]);
J('java-inheritance-polymorphism',`class A {
    int n=2;
    A(){System.out.print(f()+":");}
    int f(){return n;}
}
class B extends A {
    int n=5;
    B(){n+=2;}
    int f(){return n+1;}
}
public class Main {
    public static void main(String[] args){
        A p=new B();
        System.out.print(p.n+":"+p.f()+":"+((B)p).n);
    }
}`, '1:2:8:7',
'B 객체 메모리가 먼저 기본값 0으로 준비된다. A의 필드 n=2를 초기화하고 A 생성자를 실행할 때 f()는 B의 오버라이딩 메서드로 동적 바인딩된다. 이 시점에는 B.n=5 초기화가 아직 실행되지 않아 B.n=0이고 f()=1이다. A 생성자 뒤 B.n=5, B 생성자에서 7이 된다. p.n은 선언형 A의 필드 2, p.f()는 B의 7+1=8, 캐스팅한 필드는 B.n=7이다.',
[['A 생성자 내부','A.n=2, B.n=0 → f()=1'],['B 필드 초기화','B.n=5'],['B 생성자 본문','B.n=7'],['마지막 출력','A 필드 2 / B 메서드 8 / B 필드 7']]);
J('java-overloading',`class A {
    void show(Object x){System.out.print("A");}
    void show(String x){System.out.print("S");}
}
class B extends A {
    @Override void show(Object x){System.out.print("B");}
    void show(Integer x){System.out.print("I");}
}
public class Main {
    public static void main(String[] args){
        A p=new B();
        Object x="hello";
        p.show(x);
        p.show("hello");
        ((B)p).show(Integer.valueOf(3));
    }
}`, 'BSI',
'오버로딩 선택과 오버라이딩 실행을 두 단계로 나눈다. 첫 호출은 x의 선언형 Object에 맞는 show(Object)를 고르고, 실제 객체 B의 재정의가 실행되어 B다. 두 번째는 String 인자를 보고 show(String)를 고르는데 B에서 재정의하지 않았으므로 상속받은 A의 S다. 세 번째는 B로 캐스팅해 show(Integer) 후보가 보이고 정확히 일치하여 I다. 실제 문자열 객체라는 이유만으로 첫 호출을 S로 고르면 틀린다.',
[['p.show(x)','컴파일: Object / 실행: B.show(Object) → B'],['p.show("hello")','컴파일: String / 실행: A.show(String) → S'],['B로 캐스팅 후','Integer 오버로드 → I']]);
J('java-exception',`public class Main {
    static int s=0;
    static int f(int n){
        s+=n;
        try {
            if(n==0) throw new IllegalArgumentException();
            return f(n-1)+s;
        } catch(IllegalArgumentException e){
            s+=10;
            return s;
        } finally {
            s++;
        }
    }
    public static void main(String[] args){
        int result=f(2);
        System.out.print(result+" "+s);
    }
}`, '42 16',
'호출을 내려가며 s는 0→2→3→3이다. n=0에서 catch가 s를 13으로 바꾸고 반환값 13을 먼저 결정한다. finally가 s를 14로 바꾸어도 결정된 int 반환값 13은 바뀌지 않는다. n=1에서는 13+s(14)=27을 결정하고 finally로 s=15가 된다. n=2에서는 27+15=42를 결정하고 finally로 s=16이 된다. 각 return의 값 계산 시점과 finally 실행 시점을 구분해야 한다.',
[['f(0) catch','반환값 13 결정'],['f(0) finally','s=14'],['f(1) return/finally','13+14=27 결정, s=15'],['f(2) return/finally','27+15=42 결정, s=16']]);
J('java-array-reference',`public class Main {
    public static void main(String[] args){
        int[][] a={{1,2},{3,4}};
        int[][] b=a.clone();
        b[0][1]=9;
        b[1]=new int[]{5,6};
        int[] tmp=a[0];
        a[0]=a[1];
        a[1]=tmp;
        System.out.print(a[0][0]+" "+a[1][1]+" "+b[0][0]+" "+b[1][0]);
    }
}`, '3 9 1 5',
'clone은 바깥 배열만 복사하므로 처음 a[0]과 b[0]은 같은 {1,2} 행을 가리킨다. b[0][1]=9는 그 공유 행을 {1,9}로 바꾼다. b[1]에 새 행을 대입하면 b 쪽 연결만 {5,6}으로 바뀐다. 이후 a의 두 행 참조를 교환하면 a={{3,4},{1,9}}, b={{1,9},{5,6}}이다. b[0]이 자동으로 a의 새 0번 행을 따라가는 것은 아니다.',
[['clone 후','a와 b가 내부 행 2개 공유'],['b[0][1]=9','공유 첫 행 {1,9}'],['b[1] 교체','b={{1,9},{5,6}}'],['a 행 교환','a={{3,4},{1,9}}']]);
J('java-static-singleton',`class Base {
    static int s=1;
    Base(){s+=2;}
}
class Child extends Base {
    static int t=Base.s+3;
    Child(){s+=t;}
}
public class Main {
    public static void main(String[] args){
        new Child();
        new Child();
        System.out.print(Base.s+" "+Child.t);
    }
}`, '13 4',
'클래스 초기화는 인스턴스마다 반복하지 않는다. 최초 사용 시 Base.s=1, Child.t=1+3=4가 된다. 첫 객체 생성은 Base 생성자로 s=3, Child 생성자로 s=7이다. 두 번째 생성 때 t를 다시 계산하지 않으므로 Base에서 s=9, Child에서 s=13이다. 최종 t는 계속 4다. static 초기화와 생성자 실행 횟수를 분리한다.',
[['클래스 초기화','s=1, t=4'],['첫 Base 생성자','s=3'],['첫 Child 생성자','s=7'],['둘째 Base 생성자','s=9'],['둘째 Child 생성자','s=13, t=4']]);
J('java-string',`public class Main {
    static String f(String s,int n){
        if(n==0)return s;
        return f(s.substring(1)+s.charAt(0),n-1)+s.charAt(0);
    }
    public static void main(String[] args){
        String s="ABCD";
        String r=f(s,2);
        System.out.print(s+" "+r);
    }
}`, 'ABCD CDABBA',
'호출 때마다 문자열을 왼쪽으로 한 문자 회전시킨다. f("ABCD",2)→f("BCDA",1)→f("CDAB",0) 순서다. 기저 호출은 CDAB를 반환한다. 복귀할 때 각 호출이 갖고 있던 s의 첫 문자를 뒤에 붙여 CDABB, CDABBA가 된다. main의 s는 불변 문자열 ABCD를 계속 가리킨다. 복귀 시 현재 회전된 문자열의 첫 문자가 아니라 그 호출의 지역 s를 사용한다.',
[['호출 1','s=ABCD, n=2'],['호출 2','s=BCDA, n=1'],['기저 호출','CDAB 반환'],['복귀 1','CDAB+B=CDABB'],['복귀 2','CDABB+A=CDABBA']]);
J('java-array-reference',`public class Main {
    static int[] change(int[] a){
        a[0]+=a[1];
        int[] b=a.clone();
        b[1]=a[0]-b[1];
        a=new int[]{b[1],9};
        return a;
    }
    public static void main(String[] args){
        int[] a={2,5};
        int[] b=change(a);
        b[0]+=a[1];
        System.out.print(a[0]+" "+a[1]+" "+b[0]+" "+b[1]);
    }
}`, '7 5 7 9',
'매개변수 a는 main의 배열 참조를 복사해 받는다. a[0]+=a[1]은 공유 객체를 {7,5}로 바꾼다. clone으로 만든 지역 b는 별도 배열이며 b[1]=7-5=2가 된다. 매개변수 a를 새 {2,9}로 재연결해도 main의 변수 a가 바뀌지는 않는다. 반환된 새 배열을 main의 b가 받아 b[0]에 main.a[1]=5를 더하므로 {7,9}가 된다.',
[['공유 원소 변경','main.a={7,5}'],['복제본 변경','지역 b={7,2}'],['반환 배열','{2,9}'],['main에서 b 변경','b={7,9}, a={7,5}']]);
J('java-inheritance-polymorphism',`class A {
    int f(int n){
        if(n==0)return 1;
        return n+f(n-1);
    }
}
class B extends A {
    @Override int f(int n){
        if(n<=1)return 2;
        return super.f(n-1)*2;
    }
}
public class Main {
    public static void main(String[] args){
        A x=new B();
        System.out.print(x.f(4));
    }
}`, '18',
'최초 x.f(4)는 B.f(4)다. super.f(3)는 A의 구현으로 진입하지만 A 내부의 f(2)는 일반 가상 호출이므로 다시 B.f(2)를 실행한다. B.f(2)는 A.f(1)을 호출하고, 그 내부 f(0)는 B의 기저 조건으로 2를 반환한다. 따라서 A.f(1)=1+2=3, B.f(2)=3×2=6, A.f(3)=3+6=9, B.f(4)=9×2=18이다. super로 들어갔다고 이후 모든 재귀가 A에 고정되지 않는다.',
[['B.f(0)','2'],['A.f(1)','1+B.f(0)=3'],['B.f(2)','A.f(1)×2=6'],['A.f(3)','3+B.f(2)=9'],['B.f(4)','A.f(3)×2=18']]);
P('py-shallow-copy',`a=[[1],[2]]
b=a[:]
b[0]+=[3]
b[1]=b[1]+[4]
a.append(b[0])
b[0]=[9]
print(a)
print(b)`, '[[1, 3], [2], [1, 3]]\n[[9], [2, 4]]',
'슬라이스는 바깥 리스트만 복사한다. b[0]+=[3]은 공유 내부 리스트를 제자리 변경하므로 a[0]도 [1,3]이 된다. 반면 b[1]=b[1]+[4]는 새 [2,4]를 만들어 b[1]만 재연결하므로 a[1]은 [2]다. a.append(b[0])는 [1,3]에 대한 참조를 a에 다시 넣는다. 마지막 b[0]=[9]는 b의 연결만 교체하므로 a에 있는 두 [1,3] 참조는 그대로다. +=와 + 후 대입의 차이가 핵심이다.',
[['b[0] +=','공유 내부 값 [1,3]'],['b[1] = b[1]+…','b에만 새 [2,4]'],['a.append','a[0]과 a[2]가 같은 리스트'],['b[0] 교체','a의 참조는 그대로']]);
P('py-operator-flow',`def f(x,bag=[]):
    bag.append(x)
    return sum(bag)
r=[f(i) for i in range(1,4)]
print(r,f(5,[]),f(4))`, '[1, 3, 6] 5 10',
'기본 리스트는 함수 정의 때 한 번 생성된다. 컴프리헨션의 호출 뒤 기본 리스트는 [1], [1,2], [1,2,3]으로 누적되어 r은 [1,3,6]이다. f(5,[])는 별도의 빈 리스트를 명시해 기본 리스트에 영향을 주지 않고 5를 반환한다. 마지막 f(4)는 원래 기본 리스트에 4를 추가해 [1,2,3,4]의 합 10을 반환한다. 모든 호출이 같은 bag을 쓰는 것도, 모두 새 bag을 쓰는 것도 아니다.',
[['f(1),f(2),f(3)','기본 bag 누적 → 1,3,6'],['f(5,[])','별도 bag [5] → 5'],['f(4)','기본 bag [1,2,3,4] → 10']]);
P('py-lambda-map',`late=[lambda x:i+x for i in range(3)]
fixed=[lambda x,i=i:i+x for i in range(3)]
print(sum(f(1) for f in late),
      sum(f(1) for f in fixed),
      late[0](4))`, '9 6 6',
'late의 세 함수는 컴프리헨션의 같은 i 셀을 참조하며 실행할 때 i는 마지막 값 2다. 따라서 f(1)은 모두 3이고 합은 9다. fixed는 기본인자 i=i를 생성 시 평가해 각각 0,1,2를 고정하므로 결과는 1,2,3이며 합은 6이다. late[0](4)도 처음 생성된 순서와 무관하게 2+4=6이다. Python 3에서 각 컴프리헨션의 스코프는 분리되어 있다.',
[['late의 f(1)','3,3,3 → 합 9'],['fixed의 f(1)','1,2,3 → 합 6'],['late[0](4)','2+4=6']]);
P('py-lambda-map',`xs=[1,2,3]
g=(x*2 for x in xs)
xs[1]=5
first=next(g)
xs.append(4)
print(first,list(g),list(g))`, '2 [10, 6, 8] []',
'제너레이터 표현식은 결과를 즉시 리스트로 만들지 않는다. xs[1]을 5로 바꾼 후 next(g)는 첫 원소 1의 두 배인 2를 돌려준다. 그 뒤 추가한 4도 리스트 반복자가 남은 원소를 읽는 동안 도달한다. 남은 값 5,3,4의 두 배는 [10,6,8]이다. 첫 list(g)가 끝까지 소비했으므로 두 번째 list(g)는 []다. 생성 시점의 결과가 통째로 저장됐다고 생각하면 틀린다.',
[['g 생성','결과 아직 계산 안 함'],['next(g)','첫 값 1×2=2'],['append 후 소비','5×2,3×2,4×2'],['다시 소비','이미 소진 → []']]);
P('py-shallow-copy',`def f(a,n):
    if n==0:
        return a[0]
    a[0]+=n
    value=f(a,n-1)
    a[0]-=1
    return value+a[0]
a=[1]
r=f(a,3)
print(r,a)`, '22 [4]',
'모든 재귀 호출이 같은 리스트 a를 공유한다. 내려갈 때 a[0]은 1→4→6→7이고 기저 호출은 숫자 7을 반환한다. 복귀 때마다 a[0]을 하나씩 줄인 뒤 반환값에 더한다. n=1에서 7+6=13, n=2에서 13+5=18, n=3에서 18+4=22다. 최종 공유 리스트에는 [4]가 남는다. 지역 value는 숫자 복사본이고 a는 공유 객체라는 차이를 함께 추적한다.',
[['기저 호출','a[0]=7, 반환 7'],['n=1 복귀','a[0]=6, 반환 13'],['n=2 복귀','a[0]=5, 반환 18'],['n=3 복귀','a[0]=4, 반환 22']]);
P('py-shallow-copy',`def f(x):
    try:
        x.append(2)
        return x[:]
    finally:
        x.append(3)
a=[1]
b=f(a)
b.append(4)
print(a,b)`, '[1, 2, 3] [1, 2, 4]',
'try에서 공유 리스트 a는 [1,2]가 된다. return x[:]는 그 시점의 얕은 복사본 [1,2]를 먼저 만든다. 반환 직전에 finally가 원래 x에 3을 추가하므로 a는 [1,2,3]이다. 이미 만든 복사본은 바깥 리스트가 별개이므로 3이 붙지 않는다. main의 b가 그 복사본을 받고 4를 붙여 [1,2,4]가 된다. return x였다면 같은 결과가 아니므로 복사 시점을 확인한다.',
[['return 식 평가','새 리스트 [1,2] 준비'],['finally','원본 a=[1,2,3]'],['복귀 후 b.append','복사본 b=[1,2,4]']]);
P('py-set-dict',`d=dict.fromkeys(["a","b"],[])
d["a"].append(1)
d["b"]=d["b"]+[2]
d["a"].append(3)
r={k:sum(v) for k,v in d.items()}
print(d["a"],d["b"])
print(r["a"],r["b"])`, '[1, 3] [1, 2]\n4 3',
'fromkeys의 값 []는 키마다 별도로 복제되지 않는다. 처음 두 키는 같은 리스트를 가리켜 a에 1을 추가하면 b에서도 [1]이 보인다. b의 +[2]는 새 [1,2]를 만들고 b만 연결을 바꾼다. a에 3을 추가하면 원래 공유하던 리스트만 [1,3]으로 바뀐다. 마지막 합은 a=4,b=3이다. 가변 기본값 공유가 함수 기본인자에서만 생기는 문제는 아니다.',
[['fromkeys','a,b가 동일 [] 공유'],['a에 1 추가','둘 다 [1]'],['b 새 리스트','a=[1], b=[1,2]'],['a에 3 추가','a=[1,3], b=[1,2]']]);
P('py-list-slicing',`a=[0,1,2,3,4,5]
b=a
c=a[::2]
a[1:4]=c[::-1]
c[0]=9
b[::2]=[7,8,9]
print(a)
print(c)`, '[7, 4, 8, 0, 9, 5]\n[9, 2, 4]',
'b=a라서 두 변수는 같은 리스트를 가리킨다. c는 인덱스 0,2,4를 복사한 새 리스트 [0,2,4]다. a[1:4]에 [4,2,0]을 넣으면 a=[0,4,2,0,4,5]가 된다. c[0]=9는 a에 영향을 주지 않는다. b[::2]는 공유 리스트의 인덱스 0,2,4를 뜻하므로 각각 7,8,9로 바뀌어 a=[7,4,8,0,9,5]다. 확장 슬라이스 대입은 선택한 원소 수와 대입 값 수가 맞아야 한다.',
[['c 생성','c=[0,2,4], b는 a와 동일'],['a[1:4] 교체','a=[0,4,2,0,4,5]'],['c[0] 변경','c=[9,2,4]'],['b[::2] 대입','a=[7,4,8,0,9,5]']]);
};
