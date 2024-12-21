import argparse
import cv2
import numpy as np
import onnxruntime as ort
import torch
from PIL import Image
from flask import Flask, request, jsonify
from ultralytics.utils import ASSETS, yaml_load
from ultralytics.utils.checks import check_requirements, check_yaml
import json
id_to_uuid = {}
with open("id_to_uuid.json", "r") as f:
    id_to_uuid = f.read()
    id_to_uuid = json.loads(id_to_uuid)
    f.close()

all_id_to_id = {}
with open("all_id_to_id.json", "r") as f:
    all_id_to_id = f.read()
    all_id_to_id = json.loads(all_id_to_id)
    f.close()

# YOLOv8类封装
class YOLOv8:
    """YOLOv8 object detection model class for handling inference and visualization."""
    
    def __init__(self, onnx_model, confidence_thres, iou_thres, input_width=2048, input_height=2048):
        """
        Initializes an instance of the YOLOv8 class.

        Args:
            onnx_model: Path to the ONNX model.
            confidence_thres: Confidence threshold for filtering detections.
            iou_thres: IoU (Intersection over Union) threshold for non-maximum suppression.
            input_width: Image width expected by the model.
            input_height: Image height expected by the model.
        """
        self.onnx_model = onnx_model
        self.confidence_thres = confidence_thres
        self.iou_thres = iou_thres
        self.input_width = input_width
        self.input_height = input_height
        
        # Load class names from the provided YAML file
        self.classes = yaml_load(check_yaml("./mytrain.yaml"))["names"]#报错就改成绝对路路径
        self.color_palette = np.random.uniform(0, 255, size=(len(self.classes), 3))
        
        # Create inference session
        self.session = ort.InferenceSession(self.onnx_model, providers=["CPUExecutionProvider"])
        self.input_shape = self.session.get_inputs()[0].shape

    def draw_detections(self, img, box, score, class_id):
        """Draw bounding boxes and labels on the input image."""
        x1, y1, w, h = box
        color = self.color_palette[class_id]
        cv2.rectangle(img, (int(x1), int(y1)), (int(x1 + w), int(y1 + h)), color, 2)
        label = f"{self.classes[class_id]}: {score:.2f}"
        (label_width, label_height), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
        label_x = x1
        label_y = y1 - 10 if y1 - 10 > label_height else y1 + 10
        cv2.rectangle(img, (label_x, label_y - label_height), (label_x + label_width, label_y + label_height), color, cv2.FILLED)
        cv2.putText(img, label, (label_x, label_y), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1, cv2.LINE_AA)

    def preprocess(self, img):
        """Preprocess the image for YOLOv8 model."""
        img_resized = cv2.resize(img, (self.input_width, self.input_height))
        img_rgb = cv2.cvtColor(img_resized, cv2.COLOR_BGR2RGB)
        img_normalized = np.array(img_rgb) / 255.0
        img_transposed = np.transpose(img_normalized, (2, 0, 1))  # Channel first
        img_expanded = np.expand_dims(img_transposed, axis=0).astype(np.float32)
        return img_expanded

    def postprocess(self, img, output):
        """Process the model's output and draw detections."""
        # Postprocess the output from YOLOv8 model
        outputs = np.transpose(np.squeeze(output[0]))  # Transpose and squeeze output
        rows = outputs.shape[0]
        boxes = []
        scores = []
        class_ids = []
        
        x_factor = img.shape[1] / self.input_width
        y_factor = img.shape[0] / self.input_height
        img1=img
        for i in range(rows):
            class_scores = outputs[i][4:]
            max_score = np.amax(class_scores)
            if max_score >= self.confidence_thres:
                class_id = np.argmax(class_scores)
                x, y, w, h = outputs[i][:4]
                left = int((x - w / 2) * x_factor)
                top = int((y - h / 2) * y_factor)
                width = int(w * x_factor)
                height = int(h * y_factor)
                boxes.append([left, top, width, height])
                scores.append(max_score)
                class_ids.append(class_id)

        indices = cv2.dnn.NMSBoxes(boxes, scores, self.confidence_thres, self.iou_thres)
        ret_archi = []
        for i in indices:
            box = boxes[i]
            score = scores[i]
            class_id = class_ids[i]
            self.draw_detections(img, box, score, class_id)
            # 计算框的中心点
            x_center = (box[0] + box[2]) / 2
            y_center = (box[1] + box[3]) / 2

             # 将框坐标映射回原始图像大小（640x640 --> 原图大小）
            x = img1.shape[1] * x_center / self.input_width
            y = img1.shape[0] * y_center / self.input_height

            # 计算比例
            percentage_x = x_center / self.input_width
            percentage_y = y_center / self.input_height

            archi_id = str(class_id)  # 这里是类别 ID，如果有更复杂的 ID 映射需要调整
            id = all_id_to_id[archi_id]["id"]
            # uuid = id_to_uuid[id]["uuid"]
            name = id_to_uuid[id]["name"]
            ret_archi.append({
            "x": x,
            "y": y,
            "uuid": id,
            "name": name,
            "percentage_x": percentage_x,
            "percentage_y": percentage_y,
            "score":float(score)
        })

        return img,ret_archi

    def inference(self, img):
        """Run the inference and return the detected image."""
        # Preprocess the image
        img_data = self.preprocess(img)
        
        # Run the inference session
        outputs = self.session.run(None, {self.session.get_inputs()[0].name: img_data})

        # Post-process the results and draw detections on the image
        result_img , ret_archi= self.postprocess(img, outputs)
        

        # 创建一个字典来存储合并后的结果
        merged_result = {}

        # 遍历原始列表，合并相同 uuid 的项，并选择 score 最大的
        for item in ret_archi:
            uuid = item['uuid']
            
            # 如果该 uuid 还未在 merged_result 中，则直接添加
            if uuid not in merged_result:
                merged_result[uuid] = item
            else:
                # 如果该 uuid 已存在，比较 score，保留 score 最大的项
                if item['score'] > merged_result[uuid]['score']:
                    merged_result[uuid] = item

        # 将合并后的字典转换为列表
        final_result = list(merged_result.values())

        return result_img, final_result

def merge_ret_archi_and_ret_archib(ret_archi, ret_archib):
    # 将两个列表合并
    combined = ret_archi + ret_archib

    # 使用一个字典来存储合并的结果，键是 uuid
    merged_dict = {}
    for item in combined:
        uuid = item['uuid']
        if uuid in merged_dict:
            # 如果已存在 uuid，选择 score 较高的项
            if item['score'] > merged_dict[uuid]['score']:
                merged_dict[uuid] = item
        else:
            # 如果不存在，直接添加
            merged_dict[uuid] = item

    # 将结果转换为列表格式
    merged_list = list(merged_dict.values())
    
    return merged_list

def main():
    # 模型路径
    model_path = "E:\\识物探趣课题材料\\识物探趣课题材料\\识物探趣小程序\\archi_python_backend-main\\archi_python_backend-main\\best.onnx"
    
    # 设定推理参数
    confidence_thres = 0.5  # 置信度阈值
    iou_thres = 0.5         # NMS (Non-Maximum Suppression) IoU 阈值
    
    # 初始化 YOLOv8 模型
    model = YOLOv8(onnx_model=model_path, confidence_thres=confidence_thres, iou_thres=iou_thres)
    
    # 读取测试图片
    #img_path = "E:\\识物探趣课题材料\\识物探趣课题材料\\识物探趣小程序\\archi_python_backend-main\\archi_python_backend-main\\IMG_20241025_160703.jpg"  # 输入图像路径
    #img_path = "E:\\识物探趣课题材料\\识物探趣课题材料\\识物探趣小程序\\archi_python_backend-main\\archi_python_backend-main\\20241027174311.jpg"  # 输入图像路径
    #img_path = "E:\\识物探趣课题材料\\识物探趣课题材料\\识物探趣小程序\\archi_python_backend-main\\archi_python_backend-main\\IMG_20241025_165020.jpg"  # 输入图像路径
    img_path = "E:\\识物探趣课题材料\\识物探趣课题材料\\识物探趣小程序\\archi_python_backend-main\\archi_python_backend-main\\IMG_20241105_104219.jpg"  # 输入图像路径
    img = cv2.imread(img_path)
    if img is None:
        print("Error: Image not found.")
        return
    
    # 执行推理
    output_img, outputs = model.inference(img)
    
    # print(np.shape(outputs))
    print(np.shape(img))
    print(outputs)

    # for box in outbox:
    #     print(box)
    cv2.imwrite("output_image.jpg", output_img)
    print("Inference completed. Image saved as 'output_image.jpg'.")

if __name__ == "__main__":
    main()