// Simple localStorage-based storage implementation
window.storage = {
  async get(key) {
    try {
      const value = localStorage.getItem(key);
      return value ? { key, value, shared: false } : null;
    } catch (error) {
      throw new Error(`Failed to get ${key}`);
    }
  },

  async set(key, value, shared = false) {
    try {
      localStorage.setItem(key, value);
      return { key, value, shared };
    } catch (error) {
      return null;
    }
  },

  async delete(key) {
    try {
      localStorage.removeItem(key);
      return { key, deleted: true, shared: false };
    } catch (error) {
      return null;
    }
  },

  async list(prefix = '', shared = false) {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(prefix)) {
          keys.push(key);
        }
      }
      return { keys, prefix, shared };
    } catch (error) {
      return null;
    }
  }
};