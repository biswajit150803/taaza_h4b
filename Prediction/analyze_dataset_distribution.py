import os
import matplotlib.pyplot as plt
from collections import Counter

def count_classes(folder_path):
    class_counts = {}
    for class_name in os.listdir(folder_path):
        class_folder = os.path.join(folder_path, class_name)
        if os.path.isdir(class_folder):
            count = len(os.listdir(class_folder))
            class_counts[class_name] = count
    return class_counts

def plot_distribution(distribution, title):
    plt.figure(figsize=(12,6))
    plt.bar(distribution.keys(), distribution.values())
    plt.xticks(rotation=90)
    plt.title(title)
    plt.ylabel('Number of Images')
    plt.tight_layout()
    plt.show()

train_dist = count_classes(r'D:\H4B\H4B\Prediction\dataset\Dataset\Train')
test_dist = count_classes(r'D:\H4B\H4B\Prediction\dataset\Dataset\Test')

plot_distribution(train_dist, "Train Set Distribution")
plot_distribution(test_dist, "Test Set Distribution")
