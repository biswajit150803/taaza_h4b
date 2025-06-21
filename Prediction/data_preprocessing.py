import os
import shutil
import random

SOURCE_DIRS = ['dataset_balanced/Dataset/Rotten']
TARGET_BASE = 'dataset_balanced/Dataset'
TRAIN_SPLIT = 0.8  # 80% train, 20% test

for source_dir in SOURCE_DIRS:
    for class_name in os.listdir(source_dir):
        class_path = os.path.join(source_dir, class_name)
        if not os.path.isdir(class_path):
            continue

        images = [
            img for img in os.listdir(class_path)
            if img.lower().endswith(('.jpg', '.jpeg', '.png'))
        ]
        random.shuffle(images)

        split_idx = int(len(images) * TRAIN_SPLIT)
        train_imgs = images[:split_idx]
        test_imgs = images[split_idx:]

        # Destination paths
        train_dir = os.path.join(TARGET_BASE, 'Train', class_name)
        test_dir = os.path.join(TARGET_BASE, 'Test', class_name)
        os.makedirs(train_dir, exist_ok=True)
        os.makedirs(test_dir, exist_ok=True)

        # Move images
        for img_name in train_imgs:
            shutil.move(os.path.join(class_path, img_name), os.path.join(train_dir, img_name))
        for img_name in test_imgs:
            shutil.move(os.path.join(class_path, img_name), os.path.join(test_dir, img_name))

        print(f"{class_name}: {len(train_imgs)} train, {len(test_imgs)} test")


