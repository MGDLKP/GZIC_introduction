Page({
  data: {
      buildingList: []
  },
  onLoad() {
      // 请求后端数据并初始化 buildingList
      this.loadBuildingData();
  },

  navigateToDescription(event) {
    const buildingID = event.currentTarget.dataset.buildingId;
    wx.navigateTo({
        url: `/pages/basic_description/basic_description?buildingID=${buildingID}`
    });
},

  goBack(){
    wx.navigateTo({
      url: '/pages/map/map'
  });
  },
  clearSearch() {
      this.setData({
          searchQuery: ''
      });
  },
  search() {
      // 触发搜索功能
      this.loadBuildingData();
  },
  loadBuildingData() {
      // 示例请求，实际请求逻辑需要修改
      // wx.request({
      //     url: 'https://example.com/api/buildings',
      //     method: 'GET',
      //     success: (res) => {
      //         if (res.statusCode === 200) {
      //             this.setData({
      //                 buildingList: res.data.buildings
      //             });
      //         }
      //     },
      //     fail: (err) => {
      //         console.error('Failed to load data:', err);
      //     }
      // });

      //下方的代码是前后端连接不上之前的测试
      const data = {
        "buildings": [
            {
                "buildingID": 1,
                "buildingName": "A1",
                "function": "教学楼",
                "images": [
                    "../../images/DSC_0398.png"
                ],
                "summary": "A1教学楼，主要用于基础课程的教学，设有多媒体教室和实验室。后面是字数填充，后面是字数填充，后面是字数填充，后面是字数填充，后面是字数填充，后面是字数填充，后面是字数填充，后面是字数填充，后面是字数填充",
                "description": [
                    "A1教学楼是校园内的主教学楼之一，共设有5层楼，包含30间教室、5间实验室及1个计算机房。",
                    "教学楼内还设有供学生休息的自习室，拥有优质的教学环境。"
                ]
            },
            {
                "buildingID": 2,
                "buildingName": "A2",
                "function": "图书馆",
                "images": [
                    "../../images/DSC_0464.png"
                ],
                "summary": "A2图书馆，是全校学生学习、研究的重要场所。后面是字数填充，后面是字数填充，后面是字数填充，后面是字数填充，后面是字数填充，后面是字数填充，后面是字数填充，后面是字数填充，后面是字数填充",
                "description": [
                    "A2图书馆拥有大量图书和数字资源，共设有6层楼，包含阅览室、研讨室和自习室。",
                    "馆内设有多媒体设备，能够满足学生的各类学习需求。"
                ]
            },
            {
                "buildingID": 3,
                "buildingName": "B1",
                "function": "实验楼",
                "images": [
                    "../../images/DSC_0398.png"
                ],
                "summary": "B1实验楼，主要用于科研实验。",
                "description": [
                    "B1实验楼包含多个实验室和研究室，配有先进的科研设备，用于物理、化学和生物学的实验。",
                    "此楼还设有高端的实验设备，并定期对学生开放。"
                ]
            }
        ],
        "code": 200,
        "msg": ""
    };
      // this.setData({
      //   buildingData: data.building
      // });
      this.setData({
        buildingList: data.buildings.map(building => ({
          buildingID: building.buildingID,  // 添加 buildingID
          title: building.buildingName,
          imageUrl: building.images[0],
          description: building.summary
        }))
      });

  }
});
