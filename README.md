# Postman → MCP Converter & API Editor

This web application allows you to convert Postman collection files to MCP (Model Context Protocol) API configuration format and edit existing MCP configurations.

## Features

### Converter Features
- Upload and automatically convert Postman collection files (.json)
- Edit API configuration (API ID, Base URL, Authentication settings)
- View, edit, and delete endpoint list
- Edit endpoint properties (operation ID, description, HTTP method, path)
- Delete parameter feature
- Download JSON output

### API Editor Features
- Create new API configurations from scratch
- Load existing API configurations from server
- Upload API configuration files from your local computer
- Import Postman collections and convert them to MCP format
- Add, edit, and delete endpoints and parameters
- Configure authentication settings (Bearer Token, API Key, etc.)
- Save configurations to server
- Download configurations as JSON files

## Usage

1. Open the `index.html` file in a web browser
2. Choose one of the following options:
   - **Load Existing File**: Select from available configuration files on the server
   - **Create New Template**: Start a new API configuration from scratch
   - **Import from Postman**: Convert a Postman collection to MCP format

### Loading Existing Files
- Select a file from the list to edit
- Or upload a configuration file from your local computer

### Creating a New Template
- Fill in the basic API information (ID, Base URL, Handler Type)
- Configure authentication if needed
- Add endpoints and parameters
- Save or download your configuration

### Importing from Postman
- Use the "Select File" button to upload a Postman collection file (.json)
- Click "Import" to convert it to MCP format
- Modify the configuration as needed
- Save or download the configuration

## How It Works

1. When you upload a Postman collection file, it is parsed as JSON
2. An MCP configuration is created using the collection information:
   - API ID: Created from the collection name
   - Base URL: Retrieved from collection variables
   - Authentication: Retrieved from collection authentication settings
   - Endpoints: Created from requests in the collection
3. You can edit the generated configuration and save or download it as JSON

## Development

This application runs entirely on the client-side, requiring no server or backend service. It is built using HTML, CSS, and JavaScript.

## Usage Example

To convert a Postman collection to an MCP API configuration:

1. Export the Postman collection (in .json format)
2. Upload this file in the converter page
3. Make necessary edits
4. Save or download the generated JSON configuration
5. Use the downloaded file with your MCP server

To edit an existing MCP configuration:

1. Select the file from the server list or upload from your computer
2. Make your changes to the configuration
3. Save the changes back to the server or download as a new file

## Notes

- Long operation IDs are automatically shortened
- Body parameters are automatically detected
- Bodies in JSON:API format are specially marked
- All API configurations are validated before saving
- The editor supports loading configurations directly from local files