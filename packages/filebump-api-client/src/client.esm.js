// ES Module версия для браузера
import axios from 'axios';

class FilebumpClient {
  constructor({url, key}) {
    this.url = url;
    this.key = key;
  }

  async upload(file, fileId = null, metadata = {}) {
    const formData = new FormData();
    formData.append('file', file);

    // Добавляем метаданные в formData
    if (metadata && typeof metadata === 'object') {
      for (const [key, value] of Object.entries(metadata)) {
        if (key && value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      }
    }

    const config = {
      headers: {
        'X-API-Key': this.key,
        'Content-Type': 'multipart/form-data',
      },
    };

    const qs = fileId ? `?fileId=${fileId}` : '';
    const url = `${this.url}/upload${qs}`;
    
    return await axios.post(url, formData, config);
  }

  async uploadByUrl(sourceUrl, fileId = null) {
    const config = {
      headers: {
        'X-API-Key': this.key,
        'Content-Type': 'application/json',
      },
    };

    const endpoint = `${this.url}/download`;
    
    return await axios.post(endpoint, { url: sourceUrl }, config);
  }

  async download(fileId) {
    const config = {
      headers: {
        'X-API-Key': this.key,
      },
      responseType: 'blob',
    };

    const url = `${this.url}/file/${fileId}`;
    return await axios.get(url, config);
  }

  async file(fileId) {
    const config = {
      headers: {
        'X-API-Key': this.key,
      },
    };

    const url = `${this.url}/file/${fileId}`;
    return await axios.get(url, config);
  }

  async getFileInfo(fileId) {
    const config = {
      headers: {
        'X-API-Key': this.key,
      },
    };

    const url = `${this.url}/file/${fileId}/fileinfo`;
    return await axios.get(url, config);
  }

  async downloadFile(fileId) {
    const config = {
      headers: {
        'X-API-Key': this.key,
      },
      responseType: 'blob',
    };

    const url = `${this.url}/file/${fileId}`;
    return await axios.get(url, config);
  }

  async getFileInfo(fileId) {
    const config = {
      headers: {
        'X-API-Key': this.key,
      },
    };

    const url = `${this.url}/file/${fileId}/fileinfo`;
    return await axios.get(url, config);
  }

  // Deprecated: используйте getFileInfo вместо getMetadata
  async getMetadata(fileId) {
    return this.getFileInfo(fileId);
  }
}

export default FilebumpClient;
export { FilebumpClient };
