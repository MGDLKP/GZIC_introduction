# from DBUtils.PooledDB import PooledDB
import pymysql
import os
dbinfo = {
    'host': 'localhost',    #数据库的主机ip
    'port': 3306,           #数据库所开放接口
    "user": "root",         #数据库用户名
    "password": "123456",   #数据库密码
    "database": "ava"       #导入sql文件的数据库库名
}


class mysql:
    def __init__(self):
        self.reconnect()

    def reconnect(self):
        self.db = pymysql.connect(host=dbinfo['host'],
                                  user=dbinfo['user'],
                                  password=dbinfo['password'],
                                  database=dbinfo['database'])
        self.cursor = self.db.cursor()

    def query(self, sql):
        try:
            self.cursor.execute(sql)
            #print(self.cursor.fetchall())
            return self.cursor.fetchall()
        except pymysql.err.OperationalError as e:
            # 链接超时断开
            self.reconnect()
            return self.query(sql)

    def close(self):
        self.db.close()

# sqldb = mysql()
# all_data={}
# buildings=[]
# all_data["buildings"]=buildings
# count=0
# sql_all="SELECT * FROM articles;"
# res_all = sqldb.query(sql_all)
# count=len(res_all)

# for m in range(0,count):
#     article_id=m+1
#     sql1="SELECT id AS article_id, title AS article_title, buildingID FROM articles WHERE id = " + str(article_id )

#     sql3="SELECT id AS paragraph_id, content AS paragraph_content, `order` AS paragraph_order FROM paragraphs WHERE article_id = " + str(article_id ) +" ORDER BY article_id,`order`;"
#     sql2="SELECT id AS image_id, url AS image_url, `order` AS image_order FROM images WHERE article_id =" + str(article_id ) +" ORDER BY article_id,`order`;"

#     res1 = sqldb.query(sql1)
#     res2 = sqldb.query(sql2)
#     res3 = sqldb.query(sql3)
#     sorted_res2 = sorted(res2, key=lambda x: x[2])
#     sorted_res3 = sorted(res3, key=lambda x: x[2])   
#     data = {}
#     buildings.append(data) 
#     images=[]
#     description=[]
#     id = res1[0][0]
#     function = res1[0][1]
#     buildingID = res1[0][2]
#     data["buildingID"]=id
#     data["buildingName"]=buildingID
#     data["function"]=function
#     data["images"]=images
#     data["summary"]=sorted_res3[0][1]
#     data["description"]=description
#     for k in range(len(sorted_res2)):
#             images.append(sorted_res2[k][1])

#     for i in range(len(sorted_res3)-1):
#         description.append(sorted_res3[i+1][1])

    
        
        
    
# print(all_data)