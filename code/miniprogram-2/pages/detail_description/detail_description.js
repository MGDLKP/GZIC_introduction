// Page({
//   data: {
//     buildingData: {
//       buildingName: '',
//       images: [],
//       summary: '',
//       description:[]
//     }
//   },
//   onLoad() {
//     //预留传入建筑参数
//     //const buildingID = parseInt(options.buildingID);
//     const buildingID = 1
//     // 请求后端数据并初始化 buildingList
//     this.loadBuildingData(buildingID);
//   },
//   clearSearch() {
//       this.setData({
//           searchQuery: ''
//       });
//   },
//   search() {
//       // 触发搜索功能
//       this.loadBuildingData();
//   },
  
//   loadBuildingData(buildingID){ 
//     const data = {
//       "buildings": [
//         {
//           "buildingID": 1,
//           "buildingName": "A1",
//           "images": [
//             "../../images/DSC_0398.png",
//             "../../images/DSC_0464.png"
//           ],
//           "summary": "A1教学楼，主要用于基础课程的教学，设有多媒体教室和实验室。"
//         },
//         {
//           "buildingID": 2,
//           "buildingName": "A2",
//           "images": ["../../images/DSC_0464.png"],
//           "summary": "A2图书馆，是全校学生学习、研究的重要场所。"
//         },
//         {
//           "buildingID": 3,
//           "buildingName": "B1",
//           "images": ["../../images/DSC_0398.png"],
//           "summary": "B1实验楼，主要用于科研实验。"
//         }
//       ],
//       "code": 200,
//       "msg": ""
//     };

//     // 根据 buildingID 查找对应的建筑数据
//     const building = data.buildings.find(item => item.buildingID === buildingID);
    
//     if (building) {
//       this.setData({
//         buildingData: building
//       });
//     } else {
//       console.error("Building with ID " + buildingID + " not found.");
//     }
//     // this.setData({
//     //   buildingData: data.building
//     // });
//   }

// });

Page({
  data: {
    buildingData: {
      buildingName: '',
      images: [],
      summary: '',
      description: ''
    }
  },
  onLoad: function (options) {
    if (options.buildingData) {
      const buildingData = JSON.parse(decodeURIComponent(options.buildingData));
      this.setData({
        buildingData: buildingData
      });
    }
  },

  goBack: function() {
    wx.navigateBack();
  }
});