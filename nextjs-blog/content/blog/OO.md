---
title: "기본 연산의 시간복잡도는 O(1)이 아니다?!"
date: "2025-05-27"
tags: ["Python", "잠담"]
slug: "OO"
description: "간단한 DP문제이지만, 메모리와 시간복잡도를 신경써야 하는 문제."
featured_image: "/images/OO/cover.jpg"
notion_last_edited_time: "2025-05-28T06:04:00.000Z"
---
### 백준 1904 01타일 문제

[https://www.acmicpc.net/problem/1904](https://www.acmicpc.net/problem/1904)

```python
from sys import stdin
N = int(stdin.readline())
num1, num2 = 1, 2

if N >= 2:
  for _ in range(2,N):
    num1, num2 = num2, (num1 + num2)%15746
else:
  num2 = 1

print(num2)
```
간단한 DP문제이지만, 메모리와 시간복잡도를 신경써야 하는 문제.
메모리 제한에 해당하는 문제는 DP 테이블의 모든 정보를 유지하지 않고 계산에 필요한 이전 상태의 일부만 저장하는 방법으로 해결하였지만, 시간초과 문제가 발생하였고, 해당 문제점은 파악에 실패하였다.

질문 계시판의 반례를 찾아보던 중.
“연산에서 수가 커지면 오래 걸린다” 라는 내용을 접하게 되었다.

지금까지 단순 연산은 시간복잡도가 O(1)로써 실행 속도에는 큰 영향이 없다. 까지로만 생각했었던 나로써는 되게 신선한 내용이였다.

# 파이썬의 임의 정밀도 정수

파이썬에서 정수(`int`)는 다른 언어와 다르게 제한이 없다. 이는 임의 정밀도(arbitrary precision)를 사용하여 정수의 크기에 제한 없이 메모리가 허용하는 한 얼마든지 큰 정수도 저장하고 연산할 수 있다.

### **임의 정밀도란?**
- **임의 정밀도**는 정수의 크기가 고정된 비트 수로 제한되지 않고, 필요한 만큼 비트를 사용해 숫자를 표현할 수 있는 특성을 말한다
### **메모리 사용**
파이썬에서 정수는 값의 크기에 따라 필요한 메모리만큼 동적으로 할당한다.

파이썬은 정수의 크기에 따라 필요한 만큼 메모리를 할당하고 해제하는 기능을 제공하는데, 정수가 커질수록, 즉 비트 수가 많아질수록 이를 저장하는 데 필요한 메모리도 증가한다

→ 이 때문에 파이썬의 정수는 매우 큰 값을 처리할 수 있지만, 숫자가 커질수록 메모리 사용량도 비례해서 증가한다. 큰 정수를 사용하면 메모리와 CPU 자원을 많이 소비하게 되므로, 연산 속도가 느려질 수 있습니다.

## 메모리 및 소요 시간 확인

아래는 파이썬의 라이브러리를 활용하여 각각 작은 숫자, 중간 숫자, 큰 숫자에 할당되는 메모리 크기와 계산 시 소요되는 시간을 측정해보는 코드이다. 

```python
import time
import sys

# 작은 숫자, 중간 숫자, 큰 숫자 설정
small_num = 10
middle_num = 1234567891011
big_num = 12345678901234567890123456789012345678901234121342451352645234234

# 연산의 소요시간을 더욱 직관적으로 파악하기 위한
# 측정할 연산의 반복 횟수 설정
num_repeats = 10000000

# 시간 측정 함수
def measure_time(num, repeats):
    start_time = time.perf_counter()
    total = 0
    for _ in range(repeats):
        total += num + num
    end_time = time.perf_counter()
    return end_time - start_time

# 각 숫자에 대해 시간을 측정
small_time = measure_time(small_num, num_repeats)
middle_time = measure_time(middle_num, num_repeats)
big_time = measure_time(big_num, num_repeats)

print("Size_small_num", sys.getsizeof(small_num), "bytes")
print("Size_middle_num", sys.getsizeof(middle_num), "bytes")
print("Size_Big_num:", sys.getsizeof(big_num), "bytes")
print()
print(f"Small num time: {small_time} sec")
print(f"Middle num time: {middle_time} sec")
print(f"Big num time: {big_time} sec")

'''
Size_small_num 28 bytes
Size_middle_num 32 bytes
Size_Big_num: 56 bytes

Small num time: 0.524155958000847 sec
Middle num time: 0.7350704450000194 sec
Big num time: 0.9321465339999122 sec
'''
```
# 사용 함수 정리
time.perf_counter(): 고정밀 타이머로, 프로그램이나 코드 블록의 실행 시간을 측정할 때 사용

sys.getsizeof(): 파이썬 객체가 메모리에서 차지하는 크기를 바이트 단위로 반환하는 함수

해당 코드의 결과값으로, 계산하는 수의 크기가 클수록, 항당되는 메모리양이 많은 것을 알 수 있고, 소요되는 시간도 더욱 오래걸린다는 것을 알 수 있다.