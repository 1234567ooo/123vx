// pages/diary/diary.js
Page({
  data: {
    diaries: [],
    showModal: false,
    showDetailModal: false,
    isEditing: false,
    selectedDiary: {},
    currentDiary: {
      title: '',
      content: '',
      mood: '😊',
      images: []
    },
    moods: ['😊', '😍', '🥰', '😘', '🤗', '😢', '😭', '😤', '😴', '🤔', '😎', '🥳'],
    diaryIdCounter: 1
  },

  onLoad() {
    this.loadDiaries()
  },

  onShow() {
    this.loadDiaries()
  },

  // 加载日记列表
  loadDiaries() {
    const diaries = wx.getStorageSync('diaries') || []
    
    // 添加示例日记
    if (diaries.length === 0) {
      const sampleDiaries = [
        {
          id: 1,
          title: '想念的夜晚',
          content: '今天又是想你的一天，看着窗外的星星，仿佛看到了你的眼睛。虽然我们相隔千里，但我知道我们看的是同一片星空。爱你，我的宝贝。',
          mood: '😍',
          author: '我',
          timestamp: Date.now() - 86400000,
          images: [],
          likes: 1,
          comments: 0,
          isLiked: true
        },
        {
          id: 2,
          title: '收到你的礼物',
          content: '今天收到了你寄来的礼物，打开包裹的那一刻，心里满满的都是感动。每一件小物品都承载着你的心意，谢谢你让我感受到跨越距离的爱。',
          mood: '🥰',
          author: '我',
          timestamp: Date.now() - 172800000,
          images: [],
          likes: 2,
          comments: 1,
          isLiked: true
        }
      ]
      
      this.setData({
        diaries: this.processDiaries(sampleDiaries)
      })
      this.diaryIdCounter = 3
    } else {
      this.setData({
        diaries: this.processDiaries(diaries)
      })
      this.diaryIdCounter = Math.max(...diaries.map(d => d.id)) + 1
    }
  },

  // 处理日记数据
  processDiaries(diaries) {
    return diaries.map(diary => {
      const date = new Date(diary.timestamp)
      return {
        ...diary,
        day: date.getDate().toString().padStart(2, '0'),
        month: (date.getMonth() + 1).toString().padStart(2, '0') + '月',
        timeText: this.formatTime(diary.timestamp),
        fullDate: date.toLocaleDateString('zh-CN'),
        preview: diary.content.length > 50 ? diary.content.substring(0, 50) + '...' : diary.content
      }
    }).sort((a, b) => b.timestamp - a.timestamp)
  },

  // 格式化时间
  formatTime(timestamp) {
    const now = new Date()
    const date = new Date(timestamp)
    const diff = now - date
    
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
    
    return date.toLocaleDateString('zh-CN')
  },

  // 下拉刷新
  onRefresh() {
    this.loadDiaries()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  },

  // 写日记
  writeDiary() {
    this.setData({
      showModal: true,
      isEditing: false,
      currentDiary: {
        title: '',
        content: '',
        mood: '😊',
        images: []
      }
    })
  },

  // 查看日记详情
  viewDiary(e) {
    const id = e.currentTarget.dataset.id
    const diary = this.data.diaries.find(d => d.id === id)
    
    this.setData({
      selectedDiary: diary,
      showDetailModal: true
    })
  },

  // 编辑日记
  editDiary(e) {
    const id = e.currentTarget.dataset.id
    const diary = this.data.diaries.find(d => d.id === id)
    
    this.setData({
      showModal: true,
      showDetailModal: false,
      isEditing: true,
      currentDiary: {
        id: diary.id,
        title: diary.title,
        content: diary.content,
        mood: diary.mood,
        images: diary.images || []
      }
    })
  },

  // 关闭模态框
  closeModal() {
    this.setData({
      showModal: false
    })
  },

  // 关闭详情模态框
  closeDetailModal() {
    this.setData({
      showDetailModal: false
    })
  },

  // 标题输入
  onTitleInput(e) {
    this.setData({
      'currentDiary.title': e.detail.value
    })
  },

  // 内容输入
  onContentInput(e) {
    this.setData({
      'currentDiary.content': e.detail.value
    })
  },

  // 选择心情
  selectMood(e) {
    const mood = e.currentTarget.dataset.mood
    this.setData({
      'currentDiary.mood': mood
    })
  },

  // 选择图片
  chooseImages() {
    const maxCount = 9 - this.data.currentDiary.images.length
    
    wx.chooseImage({
      count: maxCount,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newImages = [...this.data.currentDiary.images, ...res.tempFilePaths]
        this.setData({
          'currentDiary.images': newImages
        })
      }
    })
  },

  // 删除图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index
    const images = this.data.currentDiary.images.filter((_, i) => i !== index)
    
    this.setData({
      'currentDiary.images': images
    })
  },

  // 保存日记
  saveDiary() {
    const { title, content, mood, images } = this.data.currentDiary
    
    if (!title.trim()) {
      wx.showToast({
        title: '请输入标题',
        icon: 'none'
      })
      return
    }
    
    if (!content.trim()) {
      wx.showToast({
        title: '请输入内容',
        icon: 'none'
      })
      return
    }
    
    const diaryData = {
      title: title.trim(),
      content: content.trim(),
      mood,
      images,
      author: '我',
      timestamp: Date.now(),
      likes: 0,
      comments: 0,
      isLiked: false
    }
    
    let diaries = wx.getStorageSync('diaries') || []
    
    if (this.data.isEditing) {
      // 编辑现有日记
      const index = diaries.findIndex(d => d.id === this.data.currentDiary.id)
      if (index !== -1) {
        diaries[index] = {
          ...diaries[index],
          ...diaryData
        }
      }
    } else {
      // 新增日记
      diaryData.id = this.diaryIdCounter++
      diaries.unshift(diaryData)
    }
    
    wx.setStorageSync('diaries', diaries)
    
    this.setData({
      showModal: false,
      diaries: this.processDiaries(diaries)
    })
    
    wx.showToast({
      title: this.data.isEditing ? '保存成功' : '发布成功',
      icon: 'success'
    })
  },

  // 点赞日记
  likeDiary(e) {
    const id = e.currentTarget.dataset.id
    let diaries = wx.getStorageSync('diaries') || []
    
    const index = diaries.findIndex(d => d.id === id)
    if (index !== -1) {
      const diary = diaries[index]
      diary.isLiked = !diary.isLiked
      diary.likes += diary.isLiked ? 1 : -1
      diary.likes = Math.max(0, diary.likes)
      
      wx.setStorageSync('diaries', diaries)
      
      this.setData({
        diaries: this.processDiaries(diaries)
      })
      
      // 更新详情页面数据
      if (this.data.showDetailModal && this.data.selectedDiary.id === id) {
        this.setData({
          selectedDiary: this.processDiaries([diary])[0]
        })
      }
      
      wx.vibrateShort()
    }
  },

  // 评论日记
  commentDiary(e) {
    wx.showToast({
      title: '评论功能开发中',
      icon: 'none'
    })
  },

  // 分享日记
  shareDiary(e) {
    const id = e.currentTarget.dataset.id
    const diary = this.data.diaries.find(d => d.id === id)
    
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    
    wx.showToast({
      title: '准备分享',
      icon: 'none'
    })
  },

  // 预览图片
  previewImage(e) {
    const src = e.currentTarget.dataset.src
    const urls = e.currentTarget.dataset.urls || [src]
    
    wx.previewImage({
      current: src,
      urls: urls
    })
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '我们的爱情日记',
      path: '/pages/diary/diary',
      imageUrl: '/images/diary-share.jpg'
    }
  }
})