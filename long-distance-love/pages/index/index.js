// pages/index/index.js
const app = getApp()

Page({
  data: {
    userInfo: {},
    partnerInfo: {},
    greetingText: '愿我们的爱情跨越千山万水',
    loveDays: 0,
    daysUntilMeet: 0,
    totalMessages: 0,
    todayQuote: '距离不是问题，时间不是阻碍，真正的爱情能够跨越一切。',
    showHearts: false,
    hearts: [],
    loveQuotes: [
      '距离不是问题，时间不是阻碍，真正的爱情能够跨越一切。',
      '虽然我们相隔千里，但我的心永远和你在一起。',
      '每一个想你的夜晚，都有星星为我作证。',
      '异地恋最美的不是重逢，而是每天都在想念中坚持。',
      '爱情不因距离而减少，反而因思念而更加珍贵。',
      '我们的爱情像候鸟一样，总会找到回家的路。',
      '时差算什么，心跳同步才是最重要的。',
      '每一次视频通话，都是我们爱情的见证。'
    ]
  },

  onLoad() {
    this.initUserInfo()
    this.updateStats()
    this.setTodayQuote()
    this.setGreeting()
  },

  onShow() {
    this.updateStats()
  },

  // 初始化用户信息
  initUserInfo() {
    const userInfo = wx.getStorageSync('userInfo') || {}
    const partnerInfo = wx.getStorageSync('partnerInfo') || {}
    
    this.setData({
      userInfo,
      partnerInfo
    })
  },

  // 更新统计数据
  updateStats() {
    const loveDays = app.getLoveDays()
    const daysUntilMeet = app.getDaysUntilMeet()
    const totalMessages = wx.getStorageSync('totalMessages') || 0

    this.setData({
      loveDays,
      daysUntilMeet: daysUntilMeet || '未设置',
      totalMessages
    })
  },

  // 设置今日情话
  setTodayQuote() {
    const today = new Date().toDateString()
    const savedDate = wx.getStorageSync('quoteDate')
    
    if (savedDate !== today) {
      const randomIndex = Math.floor(Math.random() * this.data.loveQuotes.length)
      const quote = this.data.loveQuotes[randomIndex]
      
      this.setData({
        todayQuote: quote
      })
      
      wx.setStorageSync('todayQuote', quote)
      wx.setStorageSync('quoteDate', today)
    } else {
      const savedQuote = wx.getStorageSync('todayQuote')
      if (savedQuote) {
        this.setData({
          todayQuote: savedQuote
        })
      }
    }
  },

  // 设置问候语
  setGreeting() {
    const hour = new Date().getHours()
    let greeting = ''
    
    if (hour < 6) {
      greeting = '夜深了，你还在想我吗？'
    } else if (hour < 12) {
      greeting = '早安，我的爱人'
    } else if (hour < 18) {
      greeting = '午后时光，想和你一起度过'
    } else {
      greeting = '晚安，愿你梦里有我'
    }
    
    this.setData({
      greetingText: greeting
    })
  },

  // 跳转到聊天页面
  goToChat() {
    wx.switchTab({
      url: '/pages/chat/chat'
    })
  },

  // 跳转到日记页面
  goToDiary() {
    wx.switchTab({
      url: '/pages/diary/diary'
    })
  },

  // 跳转到相册页面
  goToPhoto() {
    wx.navigateTo({
      url: '/pages/photo/photo'
    })
  },

  // 发送爱心动画
  sendLove() {
    this.createHearts()
    
    // 震动反馈
    wx.vibrateShort()
    
    // 显示提示
    wx.showToast({
      title: '爱心已发送💕',
      icon: 'none',
      duration: 2000
    })
  },

  // 创建爱心动画
  createHearts() {
    const hearts = []
    for (let i = 0; i < 6; i++) {
      hearts.push({
        left: Math.random() * 100,
        delay: Math.random() * 2
      })
    }
    
    this.setData({
      showHearts: true,
      hearts
    })
    
    // 3秒后隐藏爱心
    setTimeout(() => {
      this.setData({
        showHearts: false
      })
    }, 3000)
  },

  // 跳转到设置页面
  goToSettings() {
    wx.navigateTo({
      url: '/pages/profile/profile'
    })
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '爱在一起 - 异地恋情侣专属小程序',
      path: '/pages/index/index',
      imageUrl: '/images/share-cover.jpg'
    }
  }
})