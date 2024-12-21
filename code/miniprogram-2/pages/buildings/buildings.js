const request = require('../../utils/request.js'); // 引入 request.js

Page({
  data: {
    buildingList: [],
    searchKeyword: '', // 用户输入内容
    selected_buildings: [],     // 规定搜索词的建筑列表
    filteredBuildingList: [],   //指定排序后的建筑列表
    searchQuery: '',
    currentSort: 'number', // 默认按照楼号排序
    sortLayerPosition:'1.5%',
    buildingFunctionOrder: [
      '图书馆', '公共教学楼', '实验楼', '学院楼', '体育馆', '综合娱乐服务',
      '景点', '餐厅', '功能房', '商店', '一站式宿舍', '校医院'
    ]
  },

  onLoad(options) {
    const keyword = options.search ? decodeURIComponent(options.search) : '';
        if (keyword) {
            this.setData({ searchKeyword: keyword });
            this.performSearch(keyword);
        } else{
          this.loadBuildingData();
        }
  },
  handleInputChange: function(e) {
        this.setData({ searchKeyword: e.detail.value });
  },
  search: function() {
    const keyword = this.data.searchKeyword;
      if (!keyword.trim()) {
        wx.showToast({
        title: '请输入有效的关键字',
        icon: 'none'
      });
      return;
    }
        this.performSearch(keyword);
  },


  navigateToDescription(event) {
    // const buildingID = event.currentTarget.dataset.buildingId;
    const buildingID = event.currentTarget.dataset.buildingId;
    const buildingData = this.data.buildingList.find(item => item.buildingID === buildingID);
    // console.log("buildingData是",buildingData);
    wx.navigateTo({
      url: `/pages/basic_description/basic_description?buildingData=${encodeURIComponent(JSON.stringify(buildingData))}`
    });
    
    // wx.navigateTo({
    //   url: `/pages/basic_description/basic_description?buildingID=${buildingID}`
    // });
  },

  goBack() {
    wx.navigateTo({
      url: '/pages/map/map'
    });
  },

  clearSearch() {
    this.setData({
      searchQuery: ''
    }, () => {
      this.filterAndSortBuildings();
    });
  },

  search: function() {
    const keyword = this.data.searchKeyword;
    if (!keyword.trim()) {
        wx.showToast({
            title: '请输入有效的关键字',
            icon: 'none'
        });
        return;
    }
    this.performSearch(keyword);
  },
  // performSearch: function(keyword) {
  //   wx.request({
  //       url: 'http://10.37.91.226:5000/Search_Building', // 后端模糊查询接口
  //       method: 'GET',
  //       data: { "name": keyword },
  //       success: (res) => {
  //         debugger;  
  //         console.log("?",res.data.buildings.length)
  //         if (res.data && res.data.buildings.length > 0) {
  //           const buildings = res.data.buildings || [];
  //             this.setData({
  //               buildingList: buildings.map(building => ({
  //                 buildingID: building.buildingID,
  //                 buildingName: building.buildingName,
  //                 images: building.images,
  //                 summary: building.summary,
  //                 function: building.function,
  //                 description:building.description
  //               }))}, () => {
  //                 this.filterAndSortBuildings(); // 更新后重新筛选和排序
  //               });
  //           } else {
  //               wx.showToast({
  //                   title: '未找到相关建筑',
  //                   icon: 'none'
  //               });
  //           }
  //       },
  //       fail: () => {
  //           wx.showToast({
  //               title: '搜索失败，请检查网络',
  //               icon: 'none'
  //           });
  //       }
  //   });
  // },

  performSearch: function(keyword) {
    request.searchBuilding(keyword)
        .then((buildings) => {
            this.setData({
                buildingList: buildings.map(building => ({
                    buildingID: building.buildingID,
                    buildingName: building.buildingName,
                    images: building.images,
                    summary: building.summary,
                    function: building.function,
                    description: building.description
                }))
            }, () => {
                this.filterAndSortBuildings(); // 更新后重新筛选和排序
            });
        })
        .catch((error) => {
            wx.showToast({
                title: error,
                icon: 'none'
            });
        });
  },


  onSearchInput(e) {
    this.setData({
      searchQuery: e.detail.value
    });
  },

  // loadBuildingData() {
  //   const data = {
  //     "buildings": [
  //       // 示例数据
  //       {
  //         "buildingID": 1,
  //         "buildingName": "A1",
  //         "functions": "公共教学楼",
  //         "images": ["../../images/DSC_0398.png"],
  //         "summary": "A1教学楼，主要用于基础课程的教学，设有多媒体教室和实验室。"
  //       },
  //       {
  //         "buildingID": 2,
  //         "buildingName": "A2",
  //         "functions": "图书馆",
  //         "images": ["../../images/DSC_0464.png"],
  //         "summary": "A2图书馆，是全校学生学习、研究的重要场所。"
  //       },
  //       {
  //         "buildingID": 3,
  //         "buildingName": "B1",
  //         "functions": "实验楼",
  //         "images": ["../../images/DSC_0398.png"],
  //         "summary": "B1实验楼，主要用于科研实验。"
  //       }
  //     ]
  //   };

  //   this.setData({
  //     buildingList: data.buildings.map(building => ({
  //       buildingID: building.buildingID,
  //       buildingName: building.buildingName,
  //       imageUrl: building.images[0],
  //       description: building.summary,
  //       function:building.functions
  //     }))
  //   }, () => {
  //     this.filterAndSortBuildings();
  //   });
  // },
  loadBuildingData() {
    const params = { id: 'all' };  // 请求所有建筑数据
    request.getRequest('/BuildingsInfo', params)
      .then(data => {
        const buildings = data.buildings || [];
        // console.log("传输过来的数据",buildings);
        this.setData({
          buildingList: buildings.map(building => ({
            buildingID: building.buildingID,
            // buildingName: building.buildingName,
            buildingName: building.buildingName,
            // imageUrl: building.images, // 假设每个建筑有一个图片
            images: building.images,
            // imageUrl:"D:/archi_python_backend-main" + building.images[0],
            // imageUrl:"../../../../../../../" + "D:/archi_python_backend-main" + building.images[0],
            // imageUrl: "`http://localhost:5000/static${building.images[0]}`",
            summary: building.summary,
            function: building.function,
            description:building.description
          }))
        }, () => {
          this.filterAndSortBuildings();
        });
      })
      .catch(error => {
        console.error('加载建筑数据失败:', error);
        // 可以显示错误提示
      });
  },



  filterAndSortBuildings() {
    const { buildingList, searchQuery, currentSort, buildingFunctionOrder } = this.data;
    
    // 搜索过滤
    let filteredList = buildingList.filter(item =>
      item.buildingName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 排序逻辑
    if (currentSort === 'number') {
      filteredList.sort((a, b) => {
        // 判断是否是英文字符
        const isEnglishA = /^[A-Za-z]/.test(a.buildingName);
        const isEnglishB = /^[A-Za-z]/.test(b.buildingName);

        if (isEnglishA && isEnglishB) {
          // 第一位是英文字母的，按照第一位字母排序
          const firstCharCompare = a.buildingName.charAt(0).localeCompare(b.buildingName.charAt(0));
          if (firstCharCompare !== 0) return firstCharCompare;

          // 第二位数字排序
          const numberCompare = parseInt(a.buildingName.slice(1)) - parseInt(b.buildingName.slice(1));
          if (numberCompare !== 0) return numberCompare;

          // 第三位字符排序
          return a.buildingName.slice(2).localeCompare(b.buildingName.slice(2));
        } else if (isEnglishA) {
          return -1; // 英文字母排在前
        } else if (isEnglishB) {
          return 1; // 英文字母排在前
        } else {
          return a.buildingName.localeCompare(b.buildingName); // 如果都不是字母，就自然排序
        }
      });
    } else{
      // 根据功能排序
      filteredList.sort((a, b) => {
        const indexA = buildingFunctionOrder.indexOf(a.function);
        const indexB = buildingFunctionOrder.indexOf(b.function);
        return indexA - indexB;
      });
    }

    this.setData({
      filteredBuildingList: filteredList
    });
  },

  sortByNumber() {
    // console.log('排序方式切换为：楼号');  // 调试输出，查看是否进入该方法
    this.setData({
      currentSort: 'number',
      sortLayerPosition:'1.5%'
    }, () => {
      this.filterAndSortBuildings();
    });
  },

  sortByBuilding() {
    // console.log('排序方式切换为：功能');  // 调试输出，查看是否进入该方法
    this.setData({
      currentSort: 'building',
      sortLayerPosition:'50%'
    }, () => {
      this.filterAndSortBuildings();
    });
  }
});
