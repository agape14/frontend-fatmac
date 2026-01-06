import api from './api';

export const homeCmsService = {
  // Top Banner
  getTopBanner: () => {
    return api.get('/home-cms/top-banner');
  },
  updateTopBanner: (data) => {
    return api.put('/home-cms/top-banner', data);
  },

  // Home Banners
  getHomeBanners: () => {
    return api.get('/home-cms/home-banners');
  },
  uploadBannerImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/home-cms/home-banners/upload-image', formData, {
      // No establecer Content-Type manualmente, axios lo hará automáticamente con el boundary correcto
    });
  },
  createHomeBanner: (data) => {
    return api.post('/home-cms/home-banners', data);
  },
  updateHomeBanner: (id, data) => {
    return api.put(`/home-cms/home-banners/${id}`, data);
  },
  deleteHomeBanner: (id) => {
    return api.delete(`/home-cms/home-banners/${id}`);
  },

  // Home Settings
  getHomeSettings: () => {
    return api.get('/home-cms/home-settings');
  },
  updateHomeSetting: (key, value) => {
    return api.put('/home-cms/home-settings', { key, value });
  },

  // Footer Sections
  getFooterSections: () => {
    return api.get('/home-cms/footer-sections');
  },
  createFooterSection: (data) => {
    return api.post('/home-cms/footer-sections', data);
  },
  updateFooterSection: (id, data) => {
    return api.put(`/home-cms/footer-sections/${id}`, data);
  },
  deleteFooterSection: (id) => {
    return api.delete(`/home-cms/footer-sections/${id}`);
  },

  // Social Links
  getSocialLinks: () => {
    return api.get('/home-cms/social-links');
  },
  updateSocialLink: (data) => {
    return api.put('/home-cms/social-links', data);
  },

  // Bottom Bar
  getBottomBarSettings: () => {
    return api.get('/home-cms/bottom-bar');
  },
  updateBottomBarSettings: (data) => {
    return api.put('/home-cms/bottom-bar', data);
  },

  // Newsletter Text
  getNewsletterText: () => {
    return api.get('/home-cms/newsletter-text');
  },
  updateNewsletterText: (text) => {
    return api.put('/home-cms/newsletter-text', { text });
  },

  // Featured Categories
  getFeaturedCategories: () => {
    return api.get('/home-cms/featured-categories');
  },
  updateFeaturedCategoryVisibility: (id, isActive) => {
    return api.put(`/home-cms/featured-categories/${id}/visibility`, { is_active: isActive });
  },
};

