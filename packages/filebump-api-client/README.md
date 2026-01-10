# @filebump/filebump-api-client

Client library for interacting with the Filebump Client API.

## Installation

If using within the monorepo workspace:

```json
{
  "dependencies": {
    "@filebump/filebump-api-client": "*"
  }
}
```

## Usage

```javascript
const {FilebumpClient} = require('@filebump/filebump-api-client');

// Initialize client
const client = new FilebumpClient({
  url: 'http://localhost:3007',  // Client API base URL
  key: 'your-api-key'             // API key for authentication
});

// Upload a file
const fileData = Buffer.from('file content');
const result = await client.upload(fileData, 'filename.txt');
console.log(result.data);

// Upload with specific file ID
const resultWithId = await client.upload(fileData, 'filename.txt', 'custom-file-id');

// Download a file from URL
const downloadResult = await client.download('https://example.com/file.pdf');
console.log(downloadResult.data);

// Get file by ID
const file = await client.file('file-id-123');
console.log(file.data);
```

## API

### Constructor

```javascript
new FilebumpClient({url, key})
```

- `url` (string): Base URL of the Client API (e.g., 'http://localhost:3007')
- `key` (string): API key for authentication

### Methods

#### `upload(data, filename, fileId = null)`

Upload a file to the API.

- `data` (Buffer|Stream): File data
- `filename` (string): Name of the file
- `fileId` (string, optional): Custom file ID (if not provided, server will generate one)

Returns: Promise resolving to axios response

#### `download(downloadUrl)`

Download a file from an external URL through the API.

- `downloadUrl` (string): URL of the file to download

Returns: Promise resolving to axios response

#### `file(fileId)`

Get file information by ID.

- `fileId` (string): ID of the file

Returns: Promise resolving to axios response
