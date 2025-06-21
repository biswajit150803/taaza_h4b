import os
import json
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import tensorflow as tf

from sklearn.metrics import classification_report, confusion_matrix
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model, load_model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint

# Constants
DATASET_DIR = 'dataset_balanced/Dataset/Train'
TESTSET_DIR = 'dataset_balanced/Dataset/Test'
BATCH_SIZE = 8
IMG_SIZE = (224, 224)
EPOCHS = 30
MODEL_PATH = 'models/food_freshness_model.keras'
seed = 42
tf.random.set_seed(seed)
np.random.seed(seed)

def build_model(num_classes):
    base_model = MobileNetV2(input_shape=(*IMG_SIZE, 3), include_top=False, weights='imagenet')
    base_model.trainable = False

    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dropout(0.3)(x)
    outputs = Dense(num_classes, activation='softmax')(x)

    model = Model(inputs=base_model.input, outputs=outputs)
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    return model

def plot_confusion_matrix(y_true, y_pred, class_names):
    cm = confusion_matrix(y_true, y_pred)
    plt.figure(figsize=(12, 10))
    sns.heatmap(cm, annot=True, fmt="d", xticklabels=class_names, yticklabels=class_names, cmap="Blues")
    plt.xlabel("Predicted")
    plt.ylabel("True")
    plt.title("Confusion Matrix")
    plt.tight_layout()
    plt.show()

def main():
    # Data augmentation + preprocessing
    train_datagen = ImageDataGenerator(
        preprocessing_function=preprocess_input,
        validation_split=0.2,
        rotation_range=30,
        zoom_range=0.2,
        width_shift_range=0.1,
        height_shift_range=0.1,
        horizontal_flip=True,
        shear_range=0.2
    )

    train_generator = train_datagen.flow_from_directory(
        DATASET_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='training'
    )

    val_generator = train_datagen.flow_from_directory(
        DATASET_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='validation'
    )

    # Save class labels
    class_indices = train_generator.class_indices
    os.makedirs('models', exist_ok=True)
    with open('models/class_indices.json', 'w') as f:
        json.dump(class_indices, f)

    num_classes = len(class_indices)

    if os.path.exists(MODEL_PATH):
        print("Loading existing model...")
        model = load_model(MODEL_PATH)
    else:
        print("Building new model...")
        model = build_model(num_classes)

    early_stop = EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True)
    checkpoint = ModelCheckpoint(MODEL_PATH, monitor='val_accuracy', save_best_only=True, mode='max', verbose=1)

    # Phase 1: Train top layers
    print("Training top layers...")
    model.fit(
        train_generator,
        validation_data=val_generator,
        epochs=EPOCHS,
        callbacks=[early_stop, checkpoint]
    )

    # Phase 2: Fine-tune last 30 layers
    for layer in model.layers[-30:]:
        layer.trainable = True

    model.compile(optimizer=Adam(1e-5), loss='categorical_crossentropy', metrics=['accuracy'])

    print("Fine-tuning last 30 layers...")
    model.fit(
        train_generator,
        validation_data=val_generator,
        epochs=15,
        callbacks=[early_stop, checkpoint]
    )

    print("Model saved.")

    # Test evaluation
    print("Evaluating on test set...")
    test_datagen = ImageDataGenerator(preprocessing_function=preprocess_input)

    test_generator = test_datagen.flow_from_directory(
        TESTSET_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        shuffle=False,
        classes=list(class_indices.keys())
    )

    test_loss, test_acc = model.evaluate(test_generator)
    print(f"Test Accuracy: {test_acc:.4f}, Test Loss: {test_loss:.4f}")

    # Predictions & Evaluation
    preds = model.predict(test_generator)
    y_pred = np.argmax(preds, axis=1)
    y_true = test_generator.classes
    class_names = list(test_generator.class_indices.keys())

    print("\nClassification Report:\n")
    print(classification_report(y_true, y_pred, labels=list(range(len(class_names))), target_names=class_names))

    plot_confusion_matrix(y_true, y_pred, class_names)

if __name__ == "__main__":
    main()
