from flask import Flask, request, jsonify, render_template
from PIL import Image
from fuzzywuzzy import fuzz
import numpy as np
import cv2
import json
import random
import os

import mysql
import Yolo
app = Flask(__name__)

# 初始化数据库
sqldb = mysql.mysql()

ip_addr = "10.37.189.94"

# 初始化模型
model = Yolo.YOLOv8(onnx_model="best.onnx", confidence_thres=0.5, iou_thres=0.5)
modelb = Yolo.YOLOv8(onnx_model="bestb.onnx", confidence_thres=0.5, iou_thres=0.5)

# 读取模型推理出结果ID -> UUID，name
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


@app.route("/config", methods=["GET"])
def get_config():
    ret = {
        "data": {
            "imageUrl": random.choice(["/static/cover/" + str(i) + ".png" for i in range(1, 21)]),
            "color": [
                "red",
                "blue",
                "yellow",
                "green",
                "purple",
                "orange"
            ] * 3  # 前端应该用循环数组的，这是临时的解决方案

        },
        "code": 200,
        "msg": ""
    }
    return ret

# 新增
@app.route("/map")
def map_page():
    return render_template('map.wxml') 

@app.route("/uploadImage", methods=["POST"])
def uploadImage():
    # 解析form-data
    if (len(request.files) == 0):
        return ({"data": {}, "code": 400, "msg": "image is required_1"}, 400)
    file = request.files.get("image")
    if file is None:
        return ({"data": {}, "code": 400, "msg": "image is required_2"}, 400)

    
# 将图片保存到指定路径
    # save_path = "C:/Users/Lenovo/Desktop/test.jpg"  # 注意路径格式
    # try:
    #     file.save(save_path)
    #     print(f"图片已成功保存到: {save_path}")
    # except Exception as e:
    #     return ({"data": {}, "code": 500, "msg": f"图片保存失败: {str(e)}"}, 500)

    
    # file = Image.open("C:/Users/Lenovo/Desktop/B1abc3.jpg")
    target_width=3072
    target_height=4096
    # 将Img转换为cv2格式
    # img = Image.open(file.stream)
    img = Image.open(file)
    img = img.transpose(Image.ROTATE_90) #旋转90度，适应横屏
    imgb = img
    imgb = imgb.resize((1166, 1920))
    # print(img)
    
    #使用opencv优化图像
    # 将 PIL 图像转换为 NumPy 数组
    img_np = np.array(img)
    #使用pillow优化图像：
    img = img.resize((target_width, target_height), Image.LANCZOS)
    # 使用 OpenCV 调整图像大小
    resized_img = cv2.resize(img_np, (target_width, target_height), interpolation=cv2.INTER_CUBIC)
    # 保存调整后的图像（将 NumPy 数组转换回 PIL 图像再保存）
    img = Image.fromarray(resized_img)
    
    
    # save_path = "./test.jpg"
    # img.save(save_path)
    # img = Image.open("C:/Users/Lenovo/Desktop/test.jpg")
    img = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
    imgb=cv2.cvtColor(np.array(imgb), cv2.COLOR_RGB2BGR)
    # print(np.shape(img))

    # 模型推理
    or_img,ret_archi = model.inference(img)
    print(np.shape(imgb))
    or_imgb,ret_archib = modelb.inference(imgb)
    ret_archi=Yolo.merge_ret_archi_and_ret_archib(ret_archi,ret_archib)
    print(ret_archi)
    
    if len(ret_archi) != 0:
        buildingID = int(ret_archi[0]["uuid"]) 
        buildingData = get_article(buildingID)
        return buildingData
    else:
        print(ret_archi)
        res = {
            "code":300
        }

        return(res,300)
    #     ret = {
    #         "data": {
    #         "imageUrl": "N/A",
    #         "arhci": ret_archi
    #     },
    #     "code": 200,
    #     "msg": ""
    # }
    # print(ret_archi)
    # return (ret, 200)



def get_data(article_id,data):
        sql1="SELECT id AS article_id,functions AS article_title, buildingID FROM articles WHERE id = " + str(article_id )
        sql3="SELECT id AS paragraph_id, content AS paragraph_content, `order` AS paragraph_order FROM paragraphs WHERE article_id = " + str(article_id ) +" ORDER BY article_id,`order`;"
        sql2="SELECT id AS image_id, url AS image_url, `order` AS image_order FROM images WHERE article_id =" + str(article_id ) +" ORDER BY article_id,`order`;"

        res1 = sqldb.query(sql1)
        res2 = sqldb.query(sql2)
        res3 = sqldb.query(sql3)
        sorted_res2 = sorted(res2, key=lambda x: x[2])
        sorted_res3 = sorted(res3, key=lambda x: x[2])    
        images=[]
        description=[]
        id = res1[0][0]
        function = res1[0][1]
        buildingID = res1[0][2]
        data["buildingID"]=id
        data["buildingName"]=buildingID
        data["function"]=function
        data["images"]=images
        data["summary"]=sorted_res3[0][1]
        data["description"]=description
        for k in range(len(sorted_res2)):
                images.append(sorted_res2[k][1])

        for i in range(len(sorted_res3)-1):
            description.append(sorted_res3[i+1][1])
        return data


# GET /BuildingsInfo?id=
# @ app.route('/BuildingsInfo', methods=['GET'])
# def get_article():
#     article_id = request.args.get('id')# 获取id
#     if article_id is None:
#         return ({"data": {}, "code": 400, "msg": "id is required"}, 400)
#     buildings=[]

#     if article_id == "all":
#         sql_all="SELECT * FROM articles;"
#         res_all = sqldb.query(sql_all)
#         count=len(res_all)
#         for m in range(0,count):
#             article_id=m+1
#             data={}
#             data = get_data(article_id,data)
#             buildings.append(data)
#     else:
#         article_id=int(article_id)+1
#         data={}
#         data = get_data(article_id,data)
#         buildings.append(data)
#     ret = {"buildings": buildings,
#            "code": 200,
#            "msg": ""
#            }
#     return (ret, 200)

# static file


# test
# test
# test

@app.route('/BuildingsInfo', methods=['GET'])
def get_info():
    article_id = request.args.get('id')  # 获取id
    if article_id is None:
        return {"data": {}, "code": 400, "msg": "id is required"}, 400
    else:
        return get_article(article_id)


def get_article(id):
    buildings = []
    article_id = id

    if article_id == "all":
        sql_all="SELECT * FROM articles;"
        res_all = sqldb.query(sql_all)
        count=len(res_all)
        for m in range(0,count):
            article_id=m+1

            # # 临时进行限制
            # if article_id > 3:
            #     break  # 如果article_id超过3，则跳出循环

            data={}
            data = get_data(article_id,data)

            image_counter = 0
            # 拼接图片路径为完整的URL
            for image in data.get('images', []):
                # 假设数据库中存储的路径是相对路径（如 images/building1.jpg）
                image_url = f"http://{ip_addr}:5000{image}"
                data['images'][image_counter] = image_url # 用拼接好的URL替换原有的路径
                image_counter += 1

            buildings.append(data)
            print(buildings)
    else:
        article_id=int(article_id)+1
        data={}
        data = get_data(article_id,data)

        image_counter = 0
        # 拼接图片路径为完整的URL
        for image in data.get('images', []):
            # 假设数据库中存储的路径是相对路径（如 images/building1.jpg）
            image_url = f"http://{ip_addr}:5000{image}"
            data['images'][image_counter] = image_url # 用拼接好的URL替换原有的路径
            image_counter += 1

        buildings.append(data)
        print(buildings)

    return {
        "buildings": buildings,
        "code": 200,
        "msg": ""
    }, 200



# def get_article():
#     article_id = request.args.get('id')  # 获取id
#     if article_id is None:
#         return {"data": {}, "code": 400, "msg": "id is required"}, 400

#     buildings = []

#     if article_id == "all":
#         sql_all="SELECT * FROM articles;"
#         res_all = sqldb.query(sql_all)
#         count=len(res_all)
#         for m in range(0,count):
#             article_id=m+1

#             # 临时进行限制
#             if article_id > 3:
#                 break  # 如果article_id超过3，则跳出循环

#             data={}
#             data = get_data(article_id,data)

#             image_counter = 0
#             # 拼接图片路径为完整的URL
#             for image in data.get('images', []):
#                 # 假设数据库中存储的路径是相对路径（如 images/building1.jpg）
#                 image_url = f"http://10.37.77.167:5000{image}"
#                 data['images'][image_counter] = image_url # 用拼接好的URL替换原有的路径
#                 image_counter += 1

#             buildings.append(data)
#             print(buildings)
#     else:
#         article_id=int(article_id)+1
#         data={}
#         data = get_data(article_id,data)

#         image_counter = 0
#         # 拼接图片路径为完整的URL
#         for image in data.get('images', []):
#             # 假设数据库中存储的路径是相对路径（如 images/building1.jpg）
#             image_url = f"http://10.37.77.167:5000{image}"
#             data['images'][image_counter] = image_url # 用拼接好的URL替换原有的路径
#             image_counter += 1

#         buildings.append(data)
#         print(buildings)

#     return {
#         "buildings": buildings,
#         "code": 200,
#         "msg": ""
#     }, 200

# 继续使用模糊匹配逻辑
def fuzzy_search(query, data):
    result_set = set()  # 使用集合来去重，确保序号唯一
    score_data = []  # 临时存储所有匹配的结果，以便排序

    for entry in data:
        for feature in entry[1]:  # entry[1] 是功能名称的列表
            feature_score = fuzz.partial_ratio(query, feature)
            building_score = fuzz.partial_ratio(query, entry[2])

            if feature_score >= 80 or building_score >= 80:  # 设置一个阈值，表示匹配度较高
                score_data.append({
                    "序号": entry[0],
                    "功能": feature,
                    "建筑名": entry[2],
                    "功能匹配度": feature_score,
                    "建筑匹配度": building_score
                })
    #                 print(feature_score,building_score,entry[2])

    # 如果没有匹配结果，返回 -1
    if len(score_data) == 0:
        return [-1]

    # 根据building_score降序、然后feature_score降序排序
    sorted_results = sorted(
        score_data,
        key=lambda x: (-x["建筑匹配度"], -x["功能匹配度"])  # 按建筑匹配度优先排序，若相同，再按功能匹配度排序
    )
    # for res in sorted_results:
    #          print(res)

    #     # 将排序后的结果提取出序号，并去重
    result_set = set(result["序号"] for result in sorted_results)

    return result_set


# 提供模糊搜索功能


@ app.route('/Search_Building', methods=['GET'])
def Search_Building():
    buildings_data = [
    (0, ['学院楼/学院/系楼/学术楼/吴院/吴贤铭学院/智能学院/工程学院/D1学院'], 'D1吴贤铭智能工程学院'),
    (1, ['图书馆/自习/借书/阅览室/学习馆/书海/藏书楼/知识殿堂/E3'], 'E3图书馆'),
    (2, ['景点/打卡/观景/拍照/游览/纪念地/甲工纪念/英雄群像/红色纪念'], '红色甲工英雄群像'),
    (3, ['综合娱乐服务/餐厅/饮食/用餐/吃饭/创业/创新/双创/创客空间/E5'], 'E5双创中心'),
    (4, ['教学楼/公共教学楼/教室/公共课/大教室/F区教学楼/学习中心'], 'F3公共教学楼/F3a/F3b/F3c/F3d'),
    (5, ['景点/打卡/校门/入口/北校门/校园大门'], '北门'),
    (6, ['景点/露天剧场/水边剧场/剧场/表演/艺术表演'], '水滨剧场'),
    (7, ['景点/赏花亭/观景亭/花亭/休闲亭/桃花林'], '桃花亭'),
    (8, ['体育馆/运动/健身/体育/场馆/篮球馆/篮球场/羽毛球馆/羽毛球场/游泳池'], 'D6体育馆'),
    (9, ['景点/桥/纪念桥/文印桥/打卡点'], '文印桥'),
    (10, ['学院楼/未来学院/技术学院/B1c/前沿学院/未院'], 'B1c未来技术学院'),
    (11, ['学院楼/电子学院/微电子/半导体/B1e'], 'B1e微电子学院'),
    (12, ['学院楼/软物质学院/前沿科技/新材料/C2'], 'C2前沿软物质学院'),
    (13, ['学院楼/生医学院/医学工程/生物医学/C1'], 'C1生物医学与工程学院'),
    (14, ['实验楼/实验室/创意空间/工坊/D3/创新工坊'], 'D3创意工坊/D3a/D3b/D3c/D3d'),
    (15, ['餐厅/饮食/用餐/吃饭/红堡/鲤享/奶茶店/奶茶/书店'], '红堡餐厅（鲤享）'),
    (16, ['景点'], '月桥'),
    (17, ['宿舍楼/住宿/公寓/学生公寓/研究生/A4'], 'A4研究生宿舍/A4a/A4b/A4c/A4d'),
    (18, ['校医院/医疗/健康/看病/诊所/医务室'], 'A5b校医院'),
    (19, ['宿舍楼/住宿/公寓/一站式/D5/学生社区'], 'D5一站式宿舍/D5a/D5b/D5c/D5d/D5e/D5f/D5g'),
    (20, ['商店/便利店/超市/购物/买东西/全家/零售'], '全家'),
    (21, ['功能房/多功能/运动/健身/健身中心/活动中心'], '健身房'),
    (22, ['功能房/厨房/公用/共享/D5/烹饪'], 'D5共享厨房'),
    (23, ['功能房/厨房/公用/共享/A4/烹饪空间'], 'A4共享厨房'),
    (24, ['商店/超市/水果/生鲜/水果店/D5'], 'D5水果屋'),
    (25, ['功能房/打印/照片/数码/服务/复印'], 'D5打印/照片商店（华南数码）'),
    (26, ['功能房/洗衣机/自助/洗衣/清洁/洗涤'], 'D5洗衣房'),
    (27, ['功能房/快递/包裹/驿站/物流/菜鸟'], 'D5菜鸟驿站'),
    (28, ['宿舍楼/住宿/公寓/F5/一站式'], 'F5一站式宿舍/F5a/F5b/F5c/F5d/F5e'),
    (29, ['餐厅/饮食/用餐/饭堂/食堂/F5/就餐'], 'F5餐厅'),
    (30, ['功能房/快递/包裹/F5/物流/驿站'], 'F5菜鸟驿站'),
    (31, ['餐厅/饮食/用餐/咖啡/饮品/库迪'], '库迪咖啡'),
    (32, ['餐厅/饮食/冷饮/奶茶/蜜雪/甜品'], '蜜雪冰城'),
    (33, ['餐厅/饮食/快餐/汉堡/炸鸡/麦当劳'], '麦当劳'),
    (34, ['餐厅/饮食/面食/小面/面条/遇见'], '遇见小面'),
    (35, ['商店/理发/发型/剪发/美容/u剪'], 'u剪理发'),
    (36, ['餐厅/饮食/面包/蛋糕/烘焙/小元气'], '小元气烘焙'),
    (37, ['商店/超市/购物/便利/西亚/零售'], '西亚超市'),
    (38, ['餐厅/饮食/用餐/华园/云鲤/餐饮/奶茶'], '华园云鲤'),
    (39, ['餐厅/饮食/用餐/饭堂/食堂/B1/就餐区'], 'B1餐厅'),
    (40, ['餐厅/饮食/咖啡/奶茶/饮品/瑞幸/Luckin'], '瑞幸咖啡'),
    (41, ['餐厅/饮食/用餐/饭堂/食堂/D5/就餐'], 'D5餐厅')
]
    name = request.args.get('name')
    building_ID=fuzzy_search(name,buildings_data)
    print(building_ID)
    if building_ID== [-1]:
        return ({"data": {}, "code": 400, "msg": "building is not found"}, 400)
    else:
        buildings=[]

        for res in building_ID:
            data={}
            print(res)
            data1 = get_data(res+1,data)
            # print(data1)

            image_counter = 0
            # 拼接图片路径为完整的URL
            for image in data1.get('images', []):
                # 假设数据库中存储的路径是相对路径（如 images/building1.jpg）
                image_url = f"http://{ip_addr}:5000{image}"
                data1['images'][image_counter] = image_url # 用拼接好的URL替换原有的路径
                image_counter += 1

            buildings.append(data1)
            # print( buildings)
        
        
        
        ret = {"buildings": buildings,
           "code": 200,
           "msg": ""
           }
    return ret








@ app.route('/static/<path:path>')
def get_static(path):
    return app.send_static_file(path)


if __name__ == "__main__":
    from waitress import serve
    app.run(host='0.0.0.0', port=5000)  #本地启动服务，端口5000
