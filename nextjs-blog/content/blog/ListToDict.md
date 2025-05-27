---
title: "파이썬 List To Dict"
date: "2025-05-27"
tags: ["Python", "Collections"]
slug: "ListToDict"
description: "리스트를 사전(dict)으로 변환하는 방법은 다양한 상황에 따라 달라집니다. 여기서는 몇 가지 일반적인 방법을 소개하겠습니다."
featured_image: ""
notion_last_edited_time: "2025-05-27T11:01:00.000Z"
---
## PYTHON 리스트 to 딕셔너리

리스트를 사전(dict)으로 변환하는 방법은 다양한 상황에 따라 달라집니다. 여기서는 몇 가지 일반적인 방법을 소개하겠습니다.

## 1. KEY-VALUE의 리스트를 사전으로 변환하기 **dict()**

**리스트가 (key, value)로 구성된** 튜플들의 리스트라면, 이를 **직접 ****`dict()`**** 함수로 변환**할 수 있습니다.

```python
# 키-값 쌍의 리스트
list_of_pairs = [('a', 1), ('b', 2), ('c', 3)]

# 사전으로 변환
dictionary = dict(list_of_pairs)
print(dictionary)

# 출력 {'a': 1, 'b': 2, 'c': 3}

```
### 리스트에 중복된 키가 있을 때
사전으로 변환할 경우 중복된 키는 마지막 값으로 덮어씌워집니다.

```python
# 중복 키를 가진 키-값 쌍 리스트
list_of_pairs = [('a', 1), ('b', 2), ('a', 3)]

# 사전으로 변환
dictionary = dict(list_of_pairs)
print(dictionary)

#출력 {'a': 3, 'b': 2}

```
## 2. 두 개의 리스트를 사전으로 변환하기 **zip()**
두 개의 리스트가 각각 키와 값에 해당하는 요소들로 구성되어 있다면,
**`zip()`**** 함수와 ****`dict()`**** 함수를 함께 사용하여** 사전으로 변환할 수 있습니다.
만약 두 리스트의 길이가 다를 경우 `zip()` 함수를 통해 두 리스트 중 짧은 길이에 맞추어 기능을 수행합니다

```python
# 키와 값 리스트
keys = ['a', 'b', 'c']
values = [1, 2, 3]

# 사전으로 변환
dictionary = dict(zip(keys, values))
print(dictionary)

# 출력 {'a': 1, 'b': 2, 'c': 3}

```
### ZIP() 이란?
zip() 함수는 여러 iterable=반복 가능한 객체를 `(ex. list)` 병렬로 묶어주는 함수입니다.
각 위치에 있는 요소들을 **튜플로 묶어 반환**합니다.
가장 짧은 iterable의 길이에 맞춰 동작하며, 남는 요소는 무시됩니다.
**결과는 zip 객체로 반환**되며, 리스트나 튜플 등의 형태로 변환하여 사용할 수 있습니다.

## 3. 인덱스를 키로 사용하여 사전으로 변환하기 **enumerate()**

리스트의 인덱스를 키로 사용하여 사전을 생성할 수도 있습니다.

```python
# 값 리스트
values = [1, 2, 3]

# 인덱스를 키로 하는 사전으로 변환
dictionary = {i: value for i, value in enumerate(values)}
print(dictionary)

#출력 {0: 1, 1: 2, 2: 3}

```
### enumerate()
enumerate() 함수는 리스트 values와 같은 iterable 객체를 받아들여,
각 요소와 그 요소의 인덱스를 튜플로 반환하는 반복자를 생성합니다.

예를 들어, enumerate(values)는 [(0, 1), (1, 2), (2, 3)]와 같은 구조를 만듭니다.
여기서 각 튜플의 첫 번째 값은 인덱스(i), 두 번째 값은 리스트의 요소(value)입니다.

## 4. 리스트의 값을 키로 사용하고, 값을 특정 값으로 설정 **dict.fromkeys**

**리스트의 각 요소를 사전의 키로 사용**하고,
Value 값을 동일한 값(예: `None` 또는 특정 값)으로 설정할 수도 있습니다.

```python
# 키 리스트
keys = ['a', 'b', 'c']

# 각 키에 대해 동일한 값 할당
dictionary = dict.fromkeys(keys, 0)
print(dictionary)

#출력 {'a': 0, 'b': 0, 'c': 0}

```
### dict.fromkeys()
dict.fromkeys()는 Python의 내장 메서드로, 주어진 키들을 사용하여 새로운 사전을 생성하며,
모든 키에 동일한 초기 값을 할당합니다.

**dict.fromkeys(keys, value)**
keys: 사전의 키로 사용할 iterable 객체 (리스트, 튜플, 문자열 등).
value: 모든 키에 할당할 값. 기본값은 None입니다.