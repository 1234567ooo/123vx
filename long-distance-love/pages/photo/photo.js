// pages/photo/photo.js
Page({
  data: {
    photos: [],
    filteredPhotos: [],
    currentTab: 'all',
    showAddModal: false,
    showDetailModal: false,
    showImageInfo: false,
    currentPhotoIndex: 0,
    currentPhoto: null,
    newPhoto: {
      url: '',
      description: '',
      category: 'selfie',
      date: ''
    },
    categories: [
      { value: 'selfie', name: '自拍', icon: '🤳' },
      { value: 'together', name: '合照', icon: '👫' },
      { value: 'gift', name: '礼物', icon: '🎁' },
      { value: 'scenery', name: '风景', icon: '🌅' }
    ],
    today: '',
    photoIdCounter: 1
  },

  onLoad() {
    this.initData()
    this.loadPhotos()
  },

  onShow() {
    this.loadPhotos()
  },

  // 初始化数据
  initData() {
    const today = new Date()
    this.setData({
      today: today.toISOString().split('T')[0]
    })
  },

  // 加载照片
  loadPhotos() {
    const photos = wx.getStorageSync('photos') || []
    
    // 添加示例照片
    if (photos.length === 0) {
      const samplePhotos = [
        {
          id: 1,
          url: '/images/sample-photo1.jpg',
          description: '今天的自拍，想你了',
          category: 'selfie',
          date: '2024-06-15',
          timestamp: Date.now() - 86400000,
          isLiked: true
        },
        {
          id: 2,
          url: '/images/sample-photo2.jpg',
          description: '收到你送的礼物，好开心',
          category: 'gift',
          date: '2024-06-10',
          timestamp: Date.now() - 432000000,
          isLiked: false
        }
      ]
      
      this.setData({
        photos: this.processPhotos(samplePhotos)
      })
      this.photoIdCounter = 3
    } else {
      this.setData({
        photos: this.processPhotos(photos)
      })
      this.photoIdCounter = Math.max(...photos.map(p => p.id)) + 1
    }
    
    this.filterPhotos()
  },

  // 处理照片数据
  processPhotos(photos) {
    return photos.map(photo => {
      const date = new Date(photo.date)
      const categoryItem = this.data.categories.find(c => c.value === photo.category)
      
      return {
        ...photo,
        dateText: this.formatDate(photo.date),
        fullDate: date.toLocaleDateString('zh-CN'),
        categoryText: categoryItem ? categoryItem.name : '其他'
      }
    }).sort((a, b) => new Date(b.date) - new Date(a.date))
  },

  // 格式化日期
  formatDate(dateStr) {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now - date
    
    if (diff < 86400000) return '今天'
    if (diff < 172800000) return '昨天'
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
    
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  },

  // 切换分类标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      currentTab: tab
    })
    this.filterPhotos()
  },

  // 过滤照片
  filterPhotos() {
    const { photos, currentTab } = this.data
    let filteredPhotos = photos
    
    if (currentTab !== 'all') {
      filteredPhotos = photos.filter(photo => photo.category === currentTab)
    }
    
    this.setData({
      filteredPhotos
    })
  },

  // 下拉刷新
  onRefresh() {
    this.loadPhotos()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  },

  // 预览照片
  previewPhoto(e) {
    const index = e.currentTarget.dataset.index
    const photo = this.data.filteredPhotos[index]
    
    this.setData({
      showDetailModal: true,
      currentPhotoIndex: index,
      currentPhoto: photo,
      showImageInfo: false
    })
  },

  // 轮播图切换
  onSwiperChange(e) {
    const index = e.detail.current
    const photo = this.data.filteredPhotos[index]
    
    this.setData({
      currentPhotoIndex: index,
      currentPhoto: photo
    })
  },

  // 切换图片信息显示
  toggleImageInfo() {
    this.setData({
      showImageInfo: !this.data.showImageInfo
    })
  },

  // 关闭详情模态框
  closeDetailModal() {
    this.setData({
      showDetailModal: false,
      showImageInfo: false
    })
  },

  // 添加照片
  addPhoto() {
    this.setData({
      showAddModal: true,
      newPhoto: {
        url: '',
        description: '',
        category: 'selfie',
        date: this.data.today
      }
    })
  },

  // 关闭添加模态框
  closeAddModal() {
    this.setData({
      showAddModal: false
    })
  },

  // 从相册选择
  chooseFromAlbum() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success: (res) => {
        this.setData({
          'newPhoto.url': res.tempFilePaths[0]
        })
      }
    })
  },

  // 拍照
  takePhoto() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera'],
      success: (res) => {
        this.setData({
          'newPhoto.url': res.tempFilePaths[0]
        })
      }
    })
  },

  // 描述输入
  onDescriptionInput(e) {
    this.setData({
      'newPhoto.description': e.detail.value
    })
  },

  // 选择分类
  selectCategory(e) {
    const category = e.currentTarget.dataset.category
    this.setData({
      'newPhoto.category': category
    })
  },

  // 日期选择
  onDateChange(e) {
    this.setData({
      'newPhoto.date': e.detail.value
    })
  },

  // 保存照片
  savePhoto() {
    const { url, description, category, date } = this.data.newPhoto
    
    if (!url) {
      wx.showToast({
        title: '请选择照片',
        icon: 'none'
      })
      return
    }
    
    if (!date) {
      wx.showToast({
        title: '请选择日期',
        icon: 'none'
      })
      return
    }
    
    const photoData = {
      id: this.photoIdCounter++,
      url,
      description: description.trim(),
      category,
      date,
      timestamp: Date.now(),
      isLiked: false
    }
    
    let photos = wx.getStorageSync('photos') || []
    photos.unshift(photoData)
    wx.setStorageSync('photos', photos)
    
    this.setData({
      showAddModal: false,
      photos: this.processPhotos(photos)
    })
    
    this.filterPhotos()
    
    wx.showToast({
      title: '添加成功',
      icon: 'success'
    })
  },

  // 点赞照片
  likePhoto(e) {
    const id = e.currentTarget.dataset.id
    let photos = wx.getStorageSync('photos') || []
    
    const index = photos.findIndex(p => p.id === id)
    if (index !== -1) {
      photos[index].isLiked = !photos[index].isLiked
      wx.setStorageSync('photos', photos)
      
      const processedPhotos = this.processPhotos(photos)
      this.setData({
        photos: processedPhotos
      })
      
      this.filterPhotos()
      
      // 更新当前照片信息
      if (this.data.showDetailModal && this.data.currentPhoto.id === id) {
        const updatedPhoto = processedPhotos.find(p => p.id === id)
        this.setData({
          currentPhoto: updatedPhoto
        })
      }
      
      wx.vibrateShort()
    }
  },

  // 分享照片
  sharePhoto() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    
    wx.showToast({
      title: '准备分享',
      icon: 'none'
    })
  },

  // 删除照片
  deletePhoto(e) {
    const id = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这张照片吗？',
      success: (res) => {
        if (res.confirm) {
          let photos = wx.getStorageSync('photos') || []
          photos = photos.filter(p => p.id !== id)
          wx.setStorageSync('photos', photos)
          
          this.setData({
            photos: this.processPhotos(photos),
            showDetailModal: false
          })
          
          this.filterPhotos()
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '我们的爱情相册',
      path: '/pages/photo/photo',
      imageUrl: '/images/photo-share.jpg'
    }
  }
})