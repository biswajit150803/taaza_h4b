import os
from collections import Counter

def count_images_in_folders(base_path):
    class_counts = {}
    for cls in os.listdir(base_path):
        cls_path = os.path.join(base_path, cls)
        if os.path.isdir(cls_path):
            class_counts[cls] = len([
                file for file in os.listdir(cls_path)
                if file.lower().endswith(('.png', '.jpg', '.jpeg'))
            ])
    return class_counts
train_counts = count_images_in_folders(r"D:\H4B\H4B\Prediction\dataset\Dataset\Test")
print("Train set class distribution:", train_counts)