import os
import shutil
import random

SOURCE_DIR = 'dataset/Dataset/Test'
TARGET_DIR = 'dataset_balanced/Test'
IMAGES_PER_CLASS = 500

os.makedirs(TARGET_DIR, exist_ok=True)

for class_name in os.listdir(SOURCE_DIR):
    class_src_path = os.path.join(SOURCE_DIR, class_name)
    class_tgt_path = os.path.join(TARGET_DIR, class_name)

    os.makedirs(class_tgt_path, exist_ok=True)

    images = os.listdir(class_src_path)
    selected_images = random.sample(images, min(IMAGES_PER_CLASS, len(images)))

    for img_name in selected_images:
        src_img = os.path.join(class_src_path, img_name)
        tgt_img = os.path.join(class_tgt_path, img_name)
        shutil.copyfile(src_img, tgt_img)

    print(f"Copied {len(selected_images)} images to {class_name}")
