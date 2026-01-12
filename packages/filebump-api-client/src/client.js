// Универсальная поддержка FormData для Node.js и браузера
let FormDataLib;
let isNode = typeof window === 'undefined';

if (isNode) {
  // В Node.js используем библиотеку form-data
  FormDataLib = require('form-data');
} else {
  // В браузере используем нативный FormData
  FormDataLib = FormData;
}

const axios = require('axios');

class FilebumpClient {
  constructor ({url, key}) {
    this.url = url;
    this.key = key;
  }

  async upload(data, filename, fileId = null, metadata = {}) {
    const form = isNode ? new FormDataLib() : new FormData();
    
    if (isNode) {
      // Node.js: используем form-data API
      form.append('file', data, filename);
      // Добавляем метаданные
      if (metadata && typeof metadata === 'object') {
        for (const [key, value] of Object.entries(metadata)) {
          if (key && value !== null && value !== undefined) {
            form.append(key, String(value));
          }
        }
      }
    } else {
      // Браузер: используем нативный FormData API
      form.append('file', data);
      // Добавляем метаданные
      if (metadata && typeof metadata === 'object') {
        for (const [key, value] of Object.entries(metadata)) {
          if (key && value !== null && value !== undefined) {
            form.append(key, String(value));
          }
        }
      }
    }

    const request_config = {
      headers: {
        'X-API-Key': this.key,
        ...(isNode && form.getHeaders ? form.getHeaders() : {}),
      }
    };

    const qs = fileId ? `?fileId=${fileId}` : '';
    const url = `${this.url}/upload${qs}`;
    return await axios.post(url, form, request_config);
  }

  async downloadFile(fileId) {
    const request_config = {
      headers: {
        'X-API-Key': this.key,
      },
      responseType: 'blob',
    };

    const url = `${this.url}/file/${fileId}`;
    return await axios.get(url, request_config);
  }

  async file(fileId) {
    const request_config = {
      headers: {
        'X-API-Key': this.key,
      }
    };

    const url = `${this.url}/file/${fileId}`;
    return await axios.get(url, request_config);
  }

  async getFileInfo(fileId) {
    const request_config = {
      headers: {
        'X-API-Key': this.key,
      }
    };

    const url = `${this.url}/file/${fileId}/fileinfo`;
    return await axios.get(url, request_config);
  }

  // Deprecated: используйте getFileInfo вместо getMetadata
  async getMetadata(fileId) {
    return this.getFileInfo(fileId);
  }

  async uploadByUrl(sourceUrl, fileId = null, metadata = {}) {
    const request_config = {
      headers: {
        'X-API-Key': this.key,
        'Content-Type': 'application/json',
      }
    };

    const url = `${this.url}/download`;
    
    // Формируем тело запроса с url, fileId (если указан) и метаданными
    const body = { url: sourceUrl };
    if (fileId) {
      body.fileId = fileId;
    }
    if (metadata && typeof metadata === 'object') {
      Object.assign(body, metadata);
    }
    
    return await axios.post(url, body, request_config);
  }
}

module.exports = {
  FilebumpClient,
}
