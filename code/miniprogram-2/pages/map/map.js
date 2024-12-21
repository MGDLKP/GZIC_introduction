// map.js
// 引用百度地图微信小程序JSAPI模块 
const request = require('../../utils/request.js');
var bmap = require('../../libs/bmap-wx.js'); 
var wxMarkerData = []; 
Page({ 
    data: {
        BMap: null,
        searchKeyword: '',
        markers: [], 
        latitude: '23.017385', 
        longitude: '113.413343', 
        rgcData: {} 
    }, 
    onLoad: function() { 
        // 新建百度地图对象 
        this.data.BMap = new bmap.BMapWX({ 
            ak: 'Rw1ThUeQiinqJN098QNOM0QE4GuJuCTK' // 百度地图密钥
        }); 
        // 获取当前位置
        //this.getUserLocation();
        this.initializeMap();
    },

    initializeMap: function() {
      // 设置默认的标志点，可以根据需要自行增加
      const initialMarkers = [
          // { latitude: 23.007463, longitude: 113.403357, title: 'B1', id:'1' },
          // { latitude: 23.008495, longitude: 113.406401, title: 'D1', id:'6' },
          { latitude: 23.011113, longitude: 113.406851, title: 'E3图书馆', id:'1' },
          { latitude: 23.0135102, longitude: 113.405879, title: 'E5双创中心', id:'3' },
          { latitude: 23.011676, longitude: 113.408405, title: 'F3公共教学楼', id:'4' },
          { latitude: 23.016584, longitude: 113.404455, title: '北门', id:'5' },
          { latitude: 23.011558, longitude: 113.403307, title: '湖滨剧场', id:'6' },
          { latitude: 23.015021, longitude: 113.403401, title: 'D6体育馆', id:'8' },
          { latitude: 23.011999, longitude: 113.405601, title: '文印桥', id:'9' },
          { latitude: 23.007463, longitude: 113.403357, title: 'B1未来技术学院', id:'10' }, //
          { latitude: 23.007748, longitude: 113.402913, title: 'B1微电子学院', id:'11' }, //
          { latitude: 23.009789, longitude: 113.403752, title: 'C2前沿软物质学院', id:'12' },
          { latitude: 23.007898, longitude: 113.405031, title: 'C1生物医学与工程学院', id:'13' },
          { latitude: 23.010403, longitude: 113.405547, title: 'D3实验楼', id:'14' },
          { latitude: 23.011147, longitude: 113.404780, title: '红堡餐厅', id:'15' },
          { latitude: 23.011080, longitude: 113.403312, title: '月桥', id:'16' },
          { latitude: 23.011588, longitude: 113.402186, title: 'A4研究生宿舍', id:'17' },
          { latitude: 23.013003, longitude: 113.402688, title: 'A5b校医院', id:'18' },
          { latitude: 23.013100, longitude: 113.404322, title: 'D5一站式宿舍', id:'19' },
          { latitude: 23.013958, longitude: 113.407659, title: 'F5餐厅', id:'29' },

      ];

      // 显示多个标志点
      this.setMarkers(initialMarkers);
    },

    setMarkers: function(points) {
      const markers = points.map((point, index) => ({
          id: point.id,  // 每个标记点的唯一标识符
          latitude: point.latitude,
          longitude: point.longitude,
          title: point.title,
          iconPath: '../../img/marker_red.png',  // 标志点图标路径
          width: 30,  // 图标宽度
          height: 30  // 图标高度
      }));
      this.setData({ markers });  // 设置标志点数据
    },

    getUserLocation: function() {
        let that = this;
        wx.getLocation({
            type: 'gcj02', // 腾讯和百度地图使用gcj02坐标系
            success(res) {
                that.setData({
                    latitude: res.latitude,
                    longitude: res.longitude
                });
                //that.toSearch("广州");  // 默认搜索广州
            },
            fail() {
                wx.showToast({
                    title: '获取位置失败',
                    icon: 'none'
                });
            }
        });
    },
    handleInputChange: function (e) {
      this.setData({ searchKeyword: e.detail.value });
    },
    search: function () {
        this.toSearch(this.data.searchKeyword);
    },
    toSearch: function (keyword) {
        let that = this;
        let fail = function(data) { 
            console.log(data);
            wx.showToast({
                title: '搜索失败，请检查网络或关键词',
                icon: 'none'
            });
        };
        let success = function(data) { 
            wxMarkerData = data.wxMarkerData; 
            if (wxMarkerData.length > 0) {
                that.setData({ 
                    markers: wxMarkerData,
                    latitude: wxMarkerData[0].latitude,
                    longitude: wxMarkerData[0].longitude
                }); 
            } else {
                wx.showToast({
                    title: '未找到该位置',
                    icon: 'none'
                });
            }
        } 
        // 发起地理编码检索请求 
        that.data.BMap.geocoding({ 
            address: keyword, 
            fail: fail, 
            success: success, 
            iconPath: '../../img/marker_red.png', 
            iconTapPath: '../../img/marker_red.png' 
        }); 
    },
    // 添加的函数: 处理标记点点击事件
    makertap: function(e) {
      const markerId = e.markerId;
      const selectedMarker = this.data.markers.find(marker => marker.id === markerId);
      if (selectedMarker) {
          this.navigate_to_basic_description(selectedMarker.id);
      }
    },

    handleInputChange: function(e) {
      this.setData({ searchKeyword: e.detail.value });
    },
    search_list: function() {
      const keyword = this.data.searchKeyword;
      if (!keyword.trim()) {
          wx.showToast({
              title: '请输入有效的关键字',
              icon: 'none'
          });
          return;
        }
        // 跳转到建筑页面并传递搜索关键字
        wx.navigateTo({
          url: `/pages/buildings/buildings?search=${encodeURIComponent(keyword)}`
      });
    },

    // 添加的函数: 跳转到建筑描述页面并传递建筑ID
    // navigate_to_basic_description: function(id) {
    //   // wx.navigateTo({
    //   //     url: `/pages/basic_description/basic_description?buildingID=${id}`
    //   // });
    //   wx.request({
    //     url: 'http://10.37.91.226:5000/BuildingsInfo',  // 后端接口
    //     method: 'GET',
    //     data: { id: id },  // 传递建筑 ID
    //     success: function(res) {
    //       if (res.statusCode === 200) {
    //         // 成功获取数据后跳转到 basic_description 页面
    //         const buildingData = res.data.buildings[0]; // 获取返回的建筑数据
    //         wx.navigateTo({
    //           url: `/pages/basic_description/basic_description?buildingData=${encodeURIComponent(JSON.stringify(buildingData))}`
    //         });
    //       } else {
    //         wx.showToast({
    //           title: '获取建筑信息失败',
    //           icon: 'none'
    //         });
    //       }
    //     },
    //     fail: function(err) {
    //       wx.showToast({
    //         title: '请求失败',
    //         icon: 'none'
    //       });
    //     }
    //   });
    // },
    
    navigate_to_basic_description: function(id) {
      // 调用 request.js 中的请求函数
      request.searchBuildingInfo(id)
          .then((buildingData) => {
              // 成功获取数据后跳转到 basic_description 页面
              wx.navigateTo({
                  url: `/pages/basic_description/basic_description?buildingData=${encodeURIComponent(JSON.stringify(buildingData))}`,
              });
          })
          .catch((error) => {
              // 处理请求失败的情况
              wx.showToast({
                  title: error,
                  icon: 'none',
              });
          });
  },



    goToBuildingsPage() {
      // 跳转到校园建筑页面
      wx.navigateTo({
          url: '/pages/buildings/buildings'
      });
    },

    goToCamera() {
      wx.navigateTo({
        url: '/pages/camera/camera'
      });
    },
    
});
