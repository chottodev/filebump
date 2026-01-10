import axios from 'axios';

/**
 * Browser-compatible Filebump API Client
 * Adapted from @filebump/filebump-api-client for browser use
 */
class FilebumpClient {
  constructor({ url, key }) {
    this.url = url || 'http://localhost:3007';
    this.key = key || 'testKey1';
  }

  async upload(file, fileId = null) {
    const formData = new FormData();
    formData.append('file', file);

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

    // Note: client-api /download endpoint always generates fileId automatically
    // fileId parameter is kept for future API compatibility but currently ignored
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

  async getFileInfo(fileId) {
    const config = {
      headers: {
        'X-API-Key': this.key,
      },
    };

    const url = `${this.url}/file/${fileId}`;
    return await axios.get(url, config);
  }
}

export default FilebumpClient;
