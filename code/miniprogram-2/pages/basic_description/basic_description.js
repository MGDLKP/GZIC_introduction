// Import Baidu Map module
var bmap = require('../../libs/bmap-wx.js');
Page({
  data: {
    BMap: null,
    longitude: '113.413343',
    latitude: '23.017385',
    markers: [],
    buildingData: {
      buildingName: '',
      images: [],
      summary: '',
      description: ''
    }
  },
  //连接后端后：onLoad: function (options)
  onLoad: function (options) {
    // Initialize Baidu Map
    //连接后端后：
    // const buildingID = parseInt(options.buildingID);
    // const buildingID = 1
    console.log(options);
    const transfer_buildingData = JSON.parse(decodeURIComponent(options.buildingData));

    // 打印接收到的数据，检查是否包含多个图片
    console.log("Received buildingData:", transfer_buildingData);

    // 临时的图片处理策略
    // let temp_array = [transfer_buildingData['imageUrl'],]

    // 使用 setData 更新数据并添加回调函数来检查更新后的数据
    this.setData({
      buildingData: {
        buildingName: transfer_buildingData['buildingName'],
        images: transfer_buildingData['images'],
        summary: transfer_buildingData['summary'],
        description: transfer_buildingData['description']
      }
    }, () => {
      // 在 setData 更新数据后，打印 buildingData 的值
      console.log("Updated buildingData after setData:", this.data.buildingData);
    });

    this.data.BMap = new bmap.BMapWX({
      ak: 'Rw1ThUeQiinqJN098QNOM0QE4GuJuCTK'
    });
    this.initializeMap();
    // this.loadBuildingData(buildingID);
  },
  initializeMap: function () {
    this.setData({
      markers: [{
        id: 0,
        latitude: this.data.latitude,
        longitude: this.data.longitude,
        iconPath: '../../img/marker_red.png',
        width: 30,
        height: 30
      }]
    });
  },
  // loadBuildingData: function (buildingID) {
  //   // Simulated database data fetch (replace with actual request if needed)
    
  //   const data = {
  //     "buildings": [
  //       {
  //         "buildingID": 6,
  //         "buildingName": "整个活",
  //         "function": "教学楼",
  //         "images": [
  //           "../../images/DSC_0398.png",
  //         ],
  //         "summary": "整个特别大的"
  //       },
  //       {
  //         "buildingID": 4,
  //         "buildingName": "F3公共教学楼",
  //         "function": "教学楼",
  //         "images": [
  //           "../../images/DSC_0398.png",
  //           "../../images/DSC_0464.png"
  //         ],
  //         "summary": "F3教学楼，主要用于基础课程的教学，设有多媒体教室和实验室。"
  //       },
  //       {
  //         "buildingID": 1,
  //         "buildingName": "E3图书馆",
  //         "function": "图书馆",
  //         "images": ["../../images/DSC_0464.png"],
  //         "summary": "E3图书馆，是全校学生学习、研究的重要场所。"
  //       },
  //       {
  //         "buildingID": 10,
  //         "buildingName": "B1",
  //         "function": "学院楼",
  //         "images": ["../../images/DSC_0398.png"],
  //         "summary": "B1是未来技术学院楼，主要用于科研实验。"
  //       }
  //     ],
  //     "code": 200,
  //     "msg": ""
  //   };

  //   // this.setData({
  //   //   buildingData: data.building
  //   // });

  //   // 根据 buildingID 查找对应的建筑数据
  //   const building = data.buildings.find(item => item.buildingID === buildingID);
    
  //   if (building) {
  //     this.setData({
  //       buildingData: building
  //     });
  //   } else {
  //     console.error("Building with ID " + buildingID + " not found.");
  //   }

  // },
  goBack(){
    wx.navigateBack();
  },

  goToDetailPage(){
    const buildingData = this.data.buildingData;
    wx.navigateTo({
      url: `/pages/detail_description/detail_description?buildingData=${encodeURIComponent(JSON.stringify(buildingData))}`
  });
  }
});
