// API Editor JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loadExistingBtn = document.getElementById('loadExistingBtn');
    const createNewBtn = document.getElementById('createNewBtn');
    const loadFromPostmanBtn = document.getElementById('loadFromPostmanBtn');
    const fileListContainer = document.getElementById('fileListContainer');
    const fileList = document.getElementById('fileList');
    const cancelFileSelection = document.getElementById('cancelFileSelection');
    const postmanImportContainer = document.getElementById('postmanImportContainer');
    const postmanFile = document.getElementById('postmanFile');
    const importPostmanBtn = document.getElementById('importPostmanBtn');
    const cancelPostmanImport = document.getElementById('cancelPostmanImport');
    const configFile = document.getElementById('configFile');
    const loadConfigFileBtn = document.getElementById('loadConfigFileBtn');
    const mainContent = document.getElementById('mainContent');
    const activeModeContainer = document.getElementById('activeModeContainer');
    const addEndpointBtn = document.getElementById('addEndpointBtn');
    const toggleAllEndpoints = document.getElementById('toggleAllEndpoints');
    const endpointsList = document.getElementById('endpointsList');
    const outputJson = document.getElementById('outputJson');
    const downloadBtn = document.getElementById('downloadBtn');
    const saveConfigBtn = document.getElementById('saveConfigBtn');
    
    // Form elements
    const apiIdInput = document.getElementById('apiId');
    const baseUrlInput = document.getElementById('baseUrl');
    const handlerTypeSelect = document.getElementById('handlerType');
    const authTypeSelect = document.getElementById('authType');
    const authSettings = document.getElementById('authSettings');
    const envVarSetting = document.getElementById('envVarSetting');
    const apiKeySettings = document.getElementById('apiKeySettings');
    
    // Templates
    const endpointTemplate = document.getElementById('endpointTemplate');
    const parameterTemplate = document.getElementById('parameterTemplate');
    
    // State
    let currentApiConfig = null;
    let allApiFiles = [];
    let currentFileName = '';
    let endpointsExpanded = false;
    
    // Event Listeners
    loadExistingBtn.addEventListener('click', showFileList);
    createNewBtn.addEventListener('click', createNewTemplate);
    loadFromPostmanBtn.addEventListener('click', showPostmanImport);
    cancelFileSelection.addEventListener('click', hideFileList);
    postmanFile.addEventListener('change', handlePostmanFileChange);
    importPostmanBtn.addEventListener('click', importFromPostman);
    cancelPostmanImport.addEventListener('click', hidePostmanImport);
    configFile.addEventListener('change', handleConfigFileChange);
    loadConfigFileBtn.addEventListener('click', loadConfigFromFile);
    addEndpointBtn.addEventListener('click', addNewEndpoint);
    toggleAllEndpoints.addEventListener('click', toggleAllEndpointsVisibility);
    downloadBtn.addEventListener('click', downloadConfiguration);
    saveConfigBtn.addEventListener('click', saveConfiguration);
    
    // Form change listeners
    apiIdInput.addEventListener('input', updateApiConfig);
    baseUrlInput.addEventListener('input', updateApiConfig);
    handlerTypeSelect.addEventListener('change', updateApiConfig);
    authTypeSelect.addEventListener('change', handleAuthTypeChange);
    
    // Helper functions
    function showFileList() {
        hidePostmanImport();
        fileListContainer.classList.remove('hidden');
        fetchApiFiles();
        
        // Show active mode
        showActiveMode('loading');
    }
    
    function hideFileList() {
        fileListContainer.classList.add('hidden');
        hideActiveMode();
    }
    
    function showPostmanImport() {
        hideFileList();
        postmanImportContainer.classList.remove('hidden');
        
        // Show active mode
        showActiveMode('postman');
    }
    
    function hidePostmanImport() {
        postmanImportContainer.classList.add('hidden');
        hideActiveMode();
    }
    
    function showActiveMode(mode) {
        let content = '';
        
        switch(mode) {
            case 'loading':
                content = `
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">Loading Existing API Configuration</h5>
                        </div>
                        <div class="card-body">
                            <p>Loading existing API configuration files from your server...</p>
                            <p>Select a file from the list to edit its configuration.</p>
                        </div>
                    </div>`;
                break;
            case 'creating':
                content = `
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">Creating New API Configuration</h5>
                        </div>
                        <div class="card-body">
                            <p>You're creating a new API configuration template.</p>
                            <p>Fill in the details in the form that will appear below.</p>
                        </div>
                    </div>`;
                break;
            case 'postman':
                content = `
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">Importing from Postman</h5>
                        </div>
                        <div class="card-body">
                            <p>Import an existing Postman Collection to convert to MCP format.</p>
                            <p>Select your Postman Collection JSON file to begin.</p>
                        </div>
                    </div>`;
                break;
            default:
                content = '';
        }
        
        activeModeContainer.innerHTML = content;
    }
    
    function hideActiveMode() {
        activeModeContainer.innerHTML = '';
    }
    
    async function fetchApiFiles() {
        try {
            const response = await fetch('./');
            if (!response.ok) {
                throw new Error('Failed to fetch API configuration files');
            }
            
            allApiFiles = await response.json();
            renderFileList();
        } catch (error) {
            console.error('Error:', error);
            // Fallback to local files for demo purposes
            allApiFiles = [
                'sample-api.json',
            ];
            renderFileList();
        }
    }
    
    function renderFileList() {
        fileList.innerHTML = '';
        
        allApiFiles.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.textContent = file;
            fileItem.addEventListener('click', () => loadApiFile(file));
            fileList.appendChild(fileItem);
        });
    }
    
    async function loadApiFile(fileName) {
       
            
            // Fallback to sample data for demo
            if (fileName === 'sample-api.json') {
                currentApiConfig = {
                    apiId: "sample-api",
                    handlerType: "httpApi",
                    baseUrl: "https://jsonplaceholder.typicode.com",
                    authentication: null,
                    endpoints: [
                        {
                            mcpOperationId: "getPosts",
                            description: "Get all posts",
                            targetPath: "/posts",
                            targetMethod: "GET",
                            parameters: []
                        },
                        {
                            mcpOperationId: "getPost",
                            description: "Get a post by ID",
                            targetPath: "/posts/{id}",
                            targetMethod: "GET",
                            parameters: [
                                {
                                    name: "id",
                                    in: "path",
                                    required: true,
                                    type: "string",
                                    description: "Post ID"
                                }
                            ]
                        }
                    ]
                };
                currentFileName = fileName;
                
                // Show the editor
                showEditor();
                populateFormWithConfig();
            }
    }
    
    function createNewTemplate() {
        hideFileList();
        hidePostmanImport();
        
        // Initialize with empty template
        currentApiConfig = {
            apiId: "new-api",
            handlerType: "httpApi",
            baseUrl: "https://api.example.com",
            authentication: null,
            endpoints: []
        };
        currentFileName = "new-api.json";
        
        // Show the editor
        showEditor();
        populateFormWithConfig();
        
        // Show active mode
        showActiveMode('creating');
    }
    
    function handlePostmanFileChange() {
        importPostmanBtn.disabled = !postmanFile.files.length;
    }
    
    function handleConfigFileChange() {
        loadConfigFileBtn.disabled = !configFile.files.length;
    }
    
    function loadConfigFromFile() {
        if (!configFile.files.length) return;
        
        const file = configFile.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                currentApiConfig = JSON.parse(e.target.result);
                currentFileName = file.name;
                // Validate basic structure
                if (!currentApiConfig.apiId || !currentApiConfig.endpoints) {
                    throw new Error('Invalid API configuration format. Missing required fields.');
                }
                
                // Show the editor
                showEditor();
                populateFormWithConfig();
                
            } catch (error) {
                console.error('Error parsing configuration file:', error);
                alert('Failed to parse configuration file. Please check the file format.');
            }
        };
        
        reader.readAsText(file);
    }
    
    function importFromPostman() {
        if (!postmanFile.files.length) return;
        
        const file = postmanFile.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const postmanCollection = JSON.parse(e.target.result);
                
                if (!postmanCollection.info || !postmanCollection.item) {
                    alert('Invalid Postman collection file!');
                    return;
                }

                let suggestedApiId = postmanCollection.info.name
                .replace(/\s+/g, '-')
                .toLowerCase()
                .replace(/[^a-z0-9-]/g, '');
            
            // Find Base URL
            let baseUrl = '';
            if (postmanCollection.variable) {
                const apiUrlVar = postmanCollection.variable.find(v => 
                    v.key === 'api_url' || v.key === 'baseUrl' || v.key === 'base_url' || v.key.toLowerCase().includes('url'));
                if (apiUrlVar) {
                    baseUrl = apiUrlVar.value || '';
                }
            }
            
            // Fill form fields
            apiIdInput.value = suggestedApiId;
            baseUrlInput.value = baseUrl;
            
            // Fill Auth info
            if (postmanCollection.auth) {
                if (postmanCollection.auth.type === 'bearer') {
                    currentApiConfig = {
                        apiId: suggestedApiId,
                        handlerType: "httpApi",
                        baseUrl: baseUrl,
                        authentication: {
                            type: 'bearer',
                            envVariable: `${suggestedApiId.toUpperCase().replace(/-/g, '_')}_KEY`
                        },
                        endpoints: []
                    }
                    authTypeSelect.value = 'bearerToken';
                } else if (postmanCollection.auth.type === 'apikey') {
                    authTypeSelect.value = 'apiKey';
                    const keyName = postmanCollection.auth.apikey?.find(item => item.key === 'key')?.value || 'api_key';
                    const inValue = postmanCollection.auth.apikey?.find(item => item.key === 'in')?.value || 'header';
                    
                    urrentApiConfig = {
                        apiId: suggestedApiId,
                        handlerType: "httpApi",
                        baseUrl: baseUrl,
                        authentication: {
                            type: 'apiKey',
                            name: `${suggestedApiId.toUpperCase().replace(/-/g, '_')}_KEY`,
                            in: inValue
                        },
                    }
                    authTypeSelect.value = 'apiKey';
                } else {
                    authTypeSelect.value = 'none';
                }
                authSettings.classList.remove('hidden');
            } else {
                authTypeSelect.value = 'none';
                authSettings.classList.add('hidden');
            }
                // Converter.js dosyasından alınan daha gelişmiş fonksiyonu kullan
                currentApiConfig = convertPostmanToMcpConfig(postmanCollection);
                
                currentFileName = `${currentApiConfig.apiId}.json`;
                
                // Show the editor
                showEditor();
                populateFormWithConfig();
                
            } catch (error) {
                console.error('Error parsing Postman collection:', error);
                alert('Failed to parse Postman collection. Please check the file format.');
            }
        };
        
        reader.readAsText(file);
    }
    
    function showEditor() {
        mainContent.classList.remove('hidden');
        hideFileList();
        hidePostmanImport();
    }
    
    function populateFormWithConfig() {
        // Populate basic fields
        apiIdInput.value = currentApiConfig.apiId || '';
        baseUrlInput.value = currentApiConfig.baseUrl || '';
        handlerTypeSelect.value = currentApiConfig.handlerType || 'httpApi';
        
        // Authentication
        if (currentApiConfig.authentication) {
            if (currentApiConfig.authentication.type === 'apiKey') {
                authTypeSelect.value = 'apiKey';
                document.getElementById('keyName').value = currentApiConfig.authentication.name || '';
                document.getElementById('keyLocation').value = currentApiConfig.authentication.in || 'header';
                document.getElementById('envVariable').value = currentApiConfig.authentication.envVariable || '';
            } else if (currentApiConfig.authentication.type === 'bearer') {
                authTypeSelect.value = 'bearerToken';
                document.getElementById('envVariable').value = currentApiConfig.authentication.envVariable || '';
            } else {
                authTypeSelect.value = 'none';
            }
        } else {
            authTypeSelect.value = 'none';
        }
        
        handleAuthTypeChange();
        
        // Endpoints
        renderEndpoints();
        
        // Update JSON output
        updateOutputJson();
    }
    
    function renderEndpoints() {
        endpointsList.innerHTML = '';
        
        if (!currentApiConfig.endpoints || !Array.isArray(currentApiConfig.endpoints)) {
            return;
        }
        
        currentApiConfig.endpoints.forEach((endpoint, index) => {
            const endpointEl = endpointTemplate.content.cloneNode(true);
            const endpointItem = endpointEl.querySelector('.endpoint-item');
            
            // Set data attribute for reference
            endpointItem.dataset.index = index;
            
            // Method badge
            const methodBadge = endpointItem.querySelector('.method-badge');
            methodBadge.textContent = endpoint.targetMethod || 'GET';
            methodBadge.classList.add(endpoint.targetMethod?.toLowerCase() || 'get');
            
            // Path
            endpointItem.querySelector('.endpoint-path').textContent = endpoint.targetPath || '/';
            
            // Operation ID
            endpointItem.querySelector('.endpoint-operation-id').value = endpoint.mcpOperationId || '';
            
            // Description
            endpointItem.querySelector('.endpoint-description').value = endpoint.description || '';
            
            // Method
            endpointItem.querySelector('.endpoint-method').value = endpoint.targetMethod || 'GET';
            
            // Path input
            endpointItem.querySelector('.endpoint-path-input').value = endpoint.targetPath || '/';
            
            // Parameters
            renderParameters(endpointItem.querySelector('.parameters-list'), endpoint.parameters || []);
            
            // Event listeners
            endpointItem.querySelector('.toggle-endpoint').addEventListener('click', function() {
                const details = endpointItem.querySelector('.endpoint-details');
                details.classList.toggle('hidden');
            });
            
            endpointItem.querySelector('.delete-endpoint').addEventListener('click', function() {
                deleteEndpoint(index);
            });
            
            endpointItem.querySelector('.add-parameter').addEventListener('click', function() {
                addParameter(endpointItem);
            });
            
            // Input change listeners
            endpointItem.querySelector('.endpoint-operation-id').addEventListener('input', function() {
                updateEndpoint(index, 'mcpOperationId', this.value);
            });
            
            endpointItem.querySelector('.endpoint-description').addEventListener('input', function() {
                updateEndpoint(index, 'description', this.value);
            });
            
            endpointItem.querySelector('.endpoint-method').addEventListener('change', function() {
                updateEndpoint(index, 'targetMethod', this.value);
                
                // Update method badge
                methodBadge.textContent = this.value;
                methodBadge.className = 'method-badge ' + this.value.toLowerCase();
            });
            
            endpointItem.querySelector('.endpoint-path-input').addEventListener('input', function() {
                updateEndpoint(index, 'targetPath', this.value);
                
                // Update path display
                endpointItem.querySelector('.endpoint-path').textContent = this.value;
            });
            
            endpointsList.appendChild(endpointItem);
        });
    }
    
    function renderParameters(container, parameters) {
        container.innerHTML = '';
        
        parameters.forEach((param, paramIndex) => {
            const paramEl = parameterTemplate.content.cloneNode(true);
            const paramRow = paramEl.querySelector('.parameter-row');
            
            // Set data attribute for reference
            paramRow.dataset.index = paramIndex;
            
            // Name
            paramRow.querySelector('.param-name').value = param.name || '';
            
            // Location (in)
            paramRow.querySelector('.param-in').value = param.in || 'query';
            
            // Type
            paramRow.querySelector('.param-type').value = param.type || 'string';
            
            // Description
            paramRow.querySelector('.param-description').value = param.description || '';
            
            // Required
            paramRow.querySelector('.param-required').checked = !!param.required;
            
            // Event listeners
            paramRow.querySelector('.delete-parameter').addEventListener('click', function() {
                const endpointItem = paramRow.closest('.endpoint-item');
                const endpointIndex = parseInt(endpointItem.dataset.index, 10);
                deleteParameter(endpointIndex, paramIndex);
            });
            
            // Input change listeners
            paramRow.querySelector('.param-name').addEventListener('input', function() {
                const endpointItem = paramRow.closest('.endpoint-item');
                const endpointIndex = parseInt(endpointItem.dataset.index, 10);
                updateParameter(endpointIndex, paramIndex, 'name', this.value);
            });
            
            paramRow.querySelector('.param-in').addEventListener('change', function() {
                const endpointItem = paramRow.closest('.endpoint-item');
                const endpointIndex = parseInt(endpointItem.dataset.index, 10);
                updateParameter(endpointIndex, paramIndex, 'in', this.value);
            });
            
            paramRow.querySelector('.param-type').addEventListener('change', function() {
                const endpointItem = paramRow.closest('.endpoint-item');
                const endpointIndex = parseInt(endpointItem.dataset.index, 10);
                updateParameter(endpointIndex, paramIndex, 'type', this.value);
            });
            
            paramRow.querySelector('.param-description').addEventListener('input', function() {
                const endpointItem = paramRow.closest('.endpoint-item');
                const endpointIndex = parseInt(endpointItem.dataset.index, 10);
                updateParameter(endpointIndex, paramIndex, 'description', this.value);
            });
            
            paramRow.querySelector('.param-required').addEventListener('change', function() {
                const endpointItem = paramRow.closest('.endpoint-item');
                const endpointIndex = parseInt(endpointItem.dataset.index, 10);
                updateParameter(endpointIndex, paramIndex, 'required', this.checked);
            });
            
            container.appendChild(paramRow);
        });
    }
    
    function addNewEndpoint() {
        const newEndpoint = {
            mcpOperationId: `operation_${Date.now()}`,
            description: "New Endpoint",
            targetPath: "/new-endpoint",
            targetMethod: "GET",
            parameters: []
        };
        
        if (!currentApiConfig.endpoints) {
            currentApiConfig.endpoints = [];
        }
        
        currentApiConfig.endpoints.push(newEndpoint);
        renderEndpoints();
        updateOutputJson();
    }
    
    function deleteEndpoint(index) {
        if (confirm('Are you sure you want to delete this endpoint?')) {
            currentApiConfig.endpoints.splice(index, 1);
            renderEndpoints();
            updateOutputJson();
        }
    }
    
    function addParameter(endpointItem) {
        const endpointIndex = parseInt(endpointItem.dataset.index, 10);
        const parametersContainer = endpointItem.querySelector('.parameters-list');
        
        const newParam = {
            name: "newParam",
            in: "query",
            type: "string",
            description: "New parameter",
            required: false
        };
        
        if (!currentApiConfig.endpoints[endpointIndex].parameters) {
            currentApiConfig.endpoints[endpointIndex].parameters = [];
        }
        
        currentApiConfig.endpoints[endpointIndex].parameters.push(newParam);
        
        // Render the new parameter
        renderParameters(parametersContainer, currentApiConfig.endpoints[endpointIndex].parameters);
        updateOutputJson();
    }
    
    function deleteParameter(endpointIndex, paramIndex) {
        currentApiConfig.endpoints[endpointIndex].parameters.splice(paramIndex, 1);
        
        // Re-render all parameters for this endpoint
        const endpointItem = document.querySelector(`.endpoint-item[data-index="${endpointIndex}"]`);
        renderParameters(
            endpointItem.querySelector('.parameters-list'),
            currentApiConfig.endpoints[endpointIndex].parameters
        );
        
        updateOutputJson();
    }
    
    function updateEndpoint(index, field, value) {
        currentApiConfig.endpoints[index][field] = value;
        updateOutputJson();
    }
    
    function updateParameter(endpointIndex, paramIndex, field, value) {
        currentApiConfig.endpoints[endpointIndex].parameters[paramIndex][field] = value;
        updateOutputJson();
    }
    
    function toggleAllEndpointsVisibility() {
        endpointsExpanded = !endpointsExpanded;
        
        document.querySelectorAll('.endpoint-details').forEach(detail => {
            if (endpointsExpanded) {
                detail.classList.remove('hidden');
            } else {
                detail.classList.add('hidden');
            }
        });
    }
    
    function handleAuthTypeChange() {
        const authType = authTypeSelect.value;
        
        // Show/hide auth settings based on selection
        if (authType === 'none') {
            authSettings.classList.add('hidden');
            currentApiConfig.authentication = null;
        } else {
            authSettings.classList.remove('hidden');
            
            // Show/hide specific settings
            if (authType === 'apiKey') {
                apiKeySettings.classList.remove('hidden');
                envVarSetting.classList.remove('hidden');
                
                // Initialize auth object if needed
                if (!currentApiConfig.authentication || currentApiConfig.authentication.type !== 'apiKey') {
                    currentApiConfig.authentication = {
                        type: 'apiKey',
                        in: 'header',
                        name: 'API-Key',
                        envVariable: 'API_KEY'
                    };
                }
            } else if (authType === 'bearerToken') {
                apiKeySettings.classList.add('hidden');
                envVarSetting.classList.remove('hidden');
                
                // Initialize auth object if needed
                if (!currentApiConfig.authentication || currentApiConfig.authentication.type !== 'bearer') {
                    currentApiConfig.authentication = {
                        type: 'bearerToken',
                        envVariable: 'API_TOKEN'
                    };
                }
            } else {
                // For other auth types - might be expanded later
                apiKeySettings.classList.add('hidden');
                envVarSetting.classList.add('hidden');
            }
        }
        
        updateOutputJson();
    }
    
    function updateApiConfig() {
        // Update basic fields
        currentApiConfig.apiId = apiIdInput.value;
        currentApiConfig.baseUrl = baseUrlInput.value;
        currentApiConfig.handlerType = handlerTypeSelect.value;
        
        // Update authentication settings
        const authType = authTypeSelect.value;
        if (authType === 'none') {
            currentApiConfig.authentication = null;
        } else if (authType === 'apiKey') {
            currentApiConfig.authentication = {
                type: 'apiKey',
                name: document.getElementById('keyName').value,
                in: document.getElementById('keyLocation').value,
                envVariable: document.getElementById('envVariable').value
            };
        } else if (authType === 'bearerToken') {
            currentApiConfig.authentication = {
                type: 'bearer',
                envVariable: document.getElementById('envVariable').value
            };
        }
        
        // Update JSON output
        updateOutputJson();
    }
    
    function updateOutputJson() {
        outputJson.textContent = JSON.stringify(currentApiConfig, null, 2);
    }
    
    function downloadConfiguration() {
        const blob = new Blob([JSON.stringify(currentApiConfig, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = currentFileName;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    async function saveConfiguration() {
        try {
            const response = await fetch('/api/save-config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    filename: currentFileName,
                    config: currentApiConfig
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to save configuration');
            }
            
            alert(`Configuration saved successfully as ${currentFileName}`);
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to save configuration. Check console for details.');
            
            // For demo purposes, just show success
            alert(`Configuration would be saved as ${currentFileName} (demo mode)`);
        }
    }
}); 



    // Convert Postman Collection to MCP Configuration
    function convertPostmanToMcpConfig(collection) {
        // Prepare API identity
        const apiName = collection.info.name.replace(/\s+/g, '-').toLowerCase();
        const apiId = apiName.replace(/[^a-z0-9-]/g, '');
        
        // Find default URL
        let baseUrl = '';
        // Check Postman variables
        if (collection.variable) {
            const apiUrlVar = collection.variable.find(v => 
                v.key === 'api_url' || v.key === 'baseUrl' || v.key === 'base_url' || v.key.toLowerCase().includes('url'));
            if (apiUrlVar) {
                baseUrl = apiUrlVar.value || '';
            }
        }
        
        // Prepare authentication info
        let authentication = null;
        if (collection.auth) {
            // Bearer token
            if (collection.auth.type === 'bearer') {
                const envVarName = `${apiId.toUpperCase().replace(/-/g, '_')}_KEY`;
                authentication = {
                    type: 'bearerToken',
                    envVariable: envVarName
                };
            }
            // API Key
            else if (collection.auth.type === 'apikey') {
                const keyName = collection.auth.apikey?.find(item => item.key === 'key')?.value || 'api_key';
                const envVarName = `${apiId.toUpperCase().replace(/-/g, '_')}_KEY`;
                const inValue = collection.auth.apikey?.find(item => item.key === 'in')?.value || 'header';
                authentication = {
                    type: 'apiKey',
                    keyName: keyName,
                    keyLocation: inValue === 'query' ? 'query' : 'header',
                    envVariable: envVarName
                };
            }
        }
        
        // Prepare endpoints
        const endpoints = [];
        
        // Track all processed operation ids (for uniqueness)
        const usedOperationIds = new Set();
        
        function processItems(items, folderPath = '') {
            items.forEach(item => {
                // If folder/collection, process subitems
                if (item.item && Array.isArray(item.item)) {
                    processItems(item.item, folderPath ? `${folderPath}_${item.name}` : item.name);
                } 
                // If endpoint, create endpoint definition
                else if (item.request) {
                    const request = item.request;
                    const method = request.method || 'GET';
                    
                    // Create endpoint name
                    let operationId = item.name.replace(/\s+/g, '');
                    if (folderPath) {
                        operationId = `${folderPath}_${operationId}`;
                    }
                    // Clean special characters and convert to camelCase
                    operationId = operationId
                        .replace(/[^a-zA-Z0-9_]/g, '')
                        .replace(/^[0-9_]+/, '')
                        .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
                    
                    // Apply 60 character limit
                    if (operationId.length > 60) {
                        // Add method
                        const methodPrefix = method.toLowerCase().substring(0, 3);
                        
                        // Find naming hint from path
                        let pathHint = '';
                        if (request.url && request.url.path) {
                            // Get last path segment
                            const pathSegments = request.url.path;
                            if (pathSegments.length > 0) {
                                const lastMeaningfulSegment = pathSegments.filter(s => s && s !== '' && !s.startsWith('{')).pop();
                                if (lastMeaningfulSegment) {
                                    pathHint = lastMeaningfulSegment.replace(/[^a-zA-Z0-9]/g, '');
                                    // Capitalize first letter
                                    pathHint = pathHint.charAt(0).toUpperCase() + pathHint.slice(1);
                                }
                            }
                        }
                        
                        // Create short version from item name
                        const nameWords = item.name.split(/\s+/);
                        let nameHint = '';
                        
                        if (nameWords.length > 2) {
                            // If name has three or more words, get first letters of first words
                            nameHint = nameWords.slice(0, 3).map(w => w.charAt(0).toUpperCase()).join('');
                        } else {
                            // If short name, use first word as is
                            nameHint = nameWords[0].replace(/[^a-zA-Z0-9]/g, '');
                            // Capitalize first letter
                            nameHint = nameHint.charAt(0).toUpperCase() + nameHint.slice(1);
                        }
                        
                        // Create new short operationId
                        operationId = methodPrefix + (pathHint || nameHint);
                        
                        // Ensure it fits within 60 characters
                        if (operationId.length > 60) {
                            operationId = operationId.substring(0, 59);
                        }
                    }
                    
                    // Check uniqueness, add suffix if needed
                    let uniqueOpId = operationId;
                    let counter = 1;
                    while (usedOperationIds.has(uniqueOpId)) {
                        uniqueOpId = `${operationId}${counter}`;
                        counter++;
                    }
                    operationId = uniqueOpId;
                    usedOperationIds.add(operationId);
                    
                    // Process URL template
                    let url = '';
                    if (typeof request.url === 'string') {
                        url = request.url;
                    } else if (request.url && request.url.path) {
                        url = request.url.path.join('/');
                        if (!url.startsWith('/')) url = '/' + url;
                    }
                    
                    // Process path parameters
                    const pathParams = [];
                    const queryParams = [];
                    const headerParams = [];
                    const bodyParam = { name: 'body', in: 'body', required: false, type: 'object', description: 'Request body' };
                    let hasBodyParam = false;
                    
                    // Find path parameters in URL
                    if (request.url && request.url.variable) {
                        request.url.variable.forEach(v => {
                            pathParams.push({
                                name: v.key,
                                in: 'path',
                                required: true,
                                type: 'string',
                                description: v.description || `Path parameter: ${v.key}`
                            });
                        });
                    }
                    
                    // Find query parameters in URL
                    if (request.url && request.url.query) {
                        request.url.query.forEach(q => {
                            queryParams.push({
                                name: q.key,
                                in: 'query',
                                required: q.disabled ? false : Boolean(q.value),
                                type: 'string',
                                description: q.description || `Query parameter: ${q.key}`
                            });
                        });
                    }
                    
                    // Find header parameters
                    if (request.header) {
                        request.header.forEach(h => {
                            if (h.key.toLowerCase() !== 'authorization' && !h.key.toLowerCase().includes('api-key')) {
                                headerParams.push({
                                    name: h.key,
                                    in: 'header',
                                    required: h.disabled ? false : true,
                                    type: 'string',
                                    description: h.description || `Header: ${h.key}`
                                });
                            }
                        });
                    }
                    
                    // Process body parameter
                    if (request.body && ['POST', 'PUT', 'PATCH'].includes(method)) {
                        hasBodyParam = true;
                        if (request.body.mode === 'raw' && request.body.raw) {
                            try {
                                // If JSON body, try to extract fields from content
                                if (request.body.options?.raw?.language === 'json') {
                                    const jsonBody = JSON.parse(request.body.raw);
                                    // Check if it's JSON:API structure
                                    if (jsonBody.data && jsonBody.data.type) {
                                        bodyParam.description = `${jsonBody.data.type} object according to JSON:API spec`;
                                    }
                                }
                            } catch (e) {
                                // If JSON parsing error, use template as is
                            }
                        }
                    }
                    
                    // Combine all parameters
                    const parameters = [...pathParams, ...queryParams, ...headerParams];
                    if (hasBodyParam) {
                        parameters.push(bodyParam);
                    }
                    
                    // Create endpoint definition
                    endpoints.push({
                        mcpOperationId: operationId,
                        description: item.name + (item.description ? ` - ${item.description}` : ''),
                        targetPath: url,
                        targetMethod: method,
                        parameters
                    });
                }
            });
        }
        
        // Process all items in collection
        processItems(collection.item);
        
        // Return MCP configuration
        return {
            apiId,
            handlerType: 'httpApi',
            baseUrl: baseUrl,
            authentication,
            endpoints
        };
    }