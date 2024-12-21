data = ((1, '余荫山房始建于1871年，是岭南四大名园之一。', 1), 
        (2, '余荫山房以其“藏而不露，缩龙成寸”的建筑特色闻名。', 2))

# 按照序号对数据进行排序
sorted_data = sorted(data, key=lambda x: x[2])

# 拼接成一个完整的文段
paragraph = " ".join([text for _, text, _ in sorted_data])
print(paragraph)