---
title: "DFS와 BFS 파이썬 코드 정리"
date: "2025-05-01"
tags: ['Python', 'Algorithm']
slug: "BFS-DFS-Python"
description: "백준 1260 DFS, BFS 문제 풀이"
---
### 백준 1260 DFS, BFS 문제 풀이

https://www.acmicpc.net/problem/1260

```python
from sys import stdin
from collections import deque

#깊이 우선 탬색
def DFS(N, graph, start):
  stack = [start] # 시작 정점을 스택에 넣고
  visit = [False] * (N+1) # 방문 여부를 확인하기 위한 리스트
  answer = [] # 정점 방문 기록 저장 리스트

  while stack: # 스택이 빌 때까지 이 과정을 반복합니다
    nowStack = stack.pop() # 스택에서 정점을 하나 꺼내고

    if not visit[nowStack]: # 해당 정점 방문 확인.
      visit[nowStack] = True # 방문 여부 표시
      answer.append(nowStack) # 정점 방문 기록 저장

      # 방문할 수 있는 정점이 여러 개인 경우에는 정점 번호가 작은 것을 먼저 방문
      # 스택으로 저장되어 뒤에서부터 확인하기 때문에 reverse
      for i in sorted(graph[nowStack], reverse=True): 
        if not visit[i]:
          stack.append(i) # 방문 안했으면 스택에 추가

  return answer
  
#==================================================================#

# 너비 우선 탐색
def BFS(N, graph, start):
  queue = deque([start]) # 시작 정점을 큐에 저장
  visit = [False] * (N+1) # 방문 여부를 확인하기 위한 리스트
  visit[start] = True # 시작 정점 방문 표시
  
  answer = [start] # 정점 방문 기록 저장 리스트
  
  while queue: # 큐가 빌 때까지 이 과정을 반복합니다
    nowQueue = queue.popleft() # 큐의 가장 왼쪽 값부터 탐색

    # 방문할 수 있는 정점이 여러 개인 경우에는 정점 번호가 작은 것을 먼저 방문
    for i in sorted(graph[nowQueue]): # 현재 정점과 연결된 정점들을 순회
      if not visit[i]: # 해당 정점 방문 확인.
        queue.append(i) # 방문 안했으면 큐에 추가
        visit[i] = True # 방문 여부 표시
        answer.append(i) # 정점 방문 기록 저장
        
  return answer



#==================================================================#

# N(1 ≤ N ≤ 1,000), M(1 ≤ M ≤ 10,000), 초기 정점 V
N, M, V = map(int, stdin.readline().split())

# BFS나 DFS 구현 시, 간선 정보를 저장하기 위한 인접 리스트 사용
# ex) graph = {1: [2], 2: [1, 3], 3: [2, 4], 4: [3]}
graph = { i:[] for i in range(1, N+1) }

for _ in range(M):
  A, B = map(int, stdin.readline().split())
  # 양방향 연결이므로 A와 B 둘 다 연결
  graph[A].append(B) 
  graph[B].append(A)

# 정점 방문 기록 출력
print(' '.join([str(x) for x in DFS(N, graph, V)]))
print(' '.join([str(x) for x in BFS(N, graph, V)]))


```