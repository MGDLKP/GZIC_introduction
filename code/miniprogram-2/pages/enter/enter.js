// page.js
Page({
  data: {
    imageSrc: '../../images/face.png', // 这里替换为你自己的图片地址
    imageAnimation: {}
  },

  onNextPage() {
    // 创建动画对象
    const animation = wx.createAnimation({
      duration: 1000, // 动画持续时间
      timingFunction: 'ease-in-out', // 动画函数
      delay: 0, // 动画延迟时间
    });

    // 执行图片开门效果的动画
    animation.width('50%').left('0%').step();

    // 更新动画
    this.setData({
      imageAnimation: animation.export()
    });

    // 设置一个延时，以便让图片动画完成后再跳转到下一个页面
    setTimeout(() => {
      wx.navigateTo({
        url: '/pages/map/map', // 跳转到下一个页面
      });

      // 为下一个页面的内容创建渐显效果
      const nextPageAnimation = wx.createAnimation({
        duration: 8000,
        timingFunction: 'ease',
      });

      nextPageAnimation.opacity(1).step();

      this.setData({
        nextPageAnimation: nextPageAnimation.export()
      });
    }, 1000); // 动画完成后再跳转
  }
});
