import pandas as pd

# 读取数据
df = pd.read_csv("spotify-tracks-dataset.csv")

# 随机采样 2000 条
sampled = df.sample(2000, random_state=42)

# 保存
sampled.to_csv("data/spotify.csv", index=False)

print("done")