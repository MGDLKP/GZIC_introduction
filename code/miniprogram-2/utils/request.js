// utils/request.js
// export const baseUrl = 'http://10.37.107.73:5000'; // 后端接口的基地址
// request.js
// const API_BASE_URL = 'http://192.168.72.33:5000';  // Flask 后端地址
const API_BASE_URL = 'http://10.37.189.94:5000'; 
// const API_BASE_URL = 'http://10.197.245.139:5000';


// 建筑页面没有模糊搜索的渲染请求
function getRequest(url, params) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: API_BASE_URL + url,
      method: 'GET',
      data: params,
      success(res) {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(res.data.msg || '请求失败');
        }
      },
      fail(err) {
        reject('请求错误: ' + err);
      }
    });
  });
}

// 建筑页面模糊搜索函数
function searchBuilding(keyword) {
  return new Promise((resolve, reject) => {
      wx.request({
          url: `${API_BASE_URL}/Search_Building`,
          method: 'GET',
          data: { name: keyword },
          success: (res) => {
              if (res.data && res.data.buildings) {
                  resolve(res.data.buildings);
              } else {
                  reject('未找到相关建筑');
              }
          },
          fail: () => {
              reject('搜索失败，请检查网络');
          }
      });
  });
}

// 相机上传照片并获得建筑物信息
// 图片上传接口函数
function uploadImage(filePath) {
  return new Promise((resolve, reject) => {
      wx.uploadFile({
          url: `${API_BASE_URL}/uploadImage`,
          filePath: filePath,
          name: 'image',
          formData: {}, // 可附加其他表单数据
          success: (res) => {
              try {
                  const response = JSON.parse(res.data);
                  resolve(response);
              } catch (error) {
                  reject('解析响应失败');
              }
          },
          fail: (err) => {
              reject('上传失败，请检查网络');
          }
      });
  });
}

// 地图页面模糊搜索
// 获取建筑信息接口函数
function searchBuildingInfo(id) {
  return new Promise((resolve, reject) => {
      wx.request({
          url: `${API_BASE_URL}/BuildingsInfo`,
          method: 'GET',
          data: { id: id },
          success: (res) => {
              if (res.statusCode === 200 && res.data && res.data.buildings) {
                  resolve(res.data.buildings[0]); // 返回第一个建筑数据
              } else {
                  reject('获取建筑信息失败');
              }
          },
          fail: (err) => {
              reject('请求失败');
          }
      });
  });
}



module.exports = {
  getRequest,
  searchBuilding,
  uploadImage,
  searchBuildingInfo,
};





//上传照片
// uploadImage(filePath) {
//   // 获取图片文件
//   wx.uploadFile({
//     url: `${this.data.API_BASE_URL}/uploadImage`, // 后端上传图片的接口地址
//     filePath: filePath, // 需要上传的图片文件路径
//     name: 'image', // 后端接收文件的字段名
//     formData: {}, // 可附加其他表单数据
//     success: (res) => {
//       // 处理上传成功的结果
//       const response = JSON.parse(res.data);
//       if (response.code === 200) {
//         console.log('图片上传成功:', response);
//         // 可以在这里处理返回的 `arhci` 数据，例如展示模型推理结果等
//       } else {
//         console.error('图片上传失败:', response.msg);
//       }
//     },
//     fail: (err) => {
//       console.error("上传失败：", err);
//     }
//   });
// },

// // 处理相机出错
// cameraError(e) {
//   console.error("相机出错：", e.detail);
// }
// });