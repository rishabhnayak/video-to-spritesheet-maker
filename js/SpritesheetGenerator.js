class SpritesheetGenerator {
    constructor() {
        this.video = null;
        this.currentFile = null;
        this.isGenerating = false;
        this.cancelGeneration = false;
        this.extractedFrames = [];
        this.originalFrames = [];
        this.spritesheet = null;
        this.fullSizeCanvas = null; // For export
        this.previewCanvas = null;  // For display
        this.zoomLevel = 1;
        this.videoAspectRatio = 1;
        this.maxPreviewWidth = 800;
        this.videoCanvas = null;
        this.videoCtx = null;
        this.videoTransparencyFrame = null;

        // Animation preview state
        this.animationFrameRequest = null;

        // Cropping state
        this.isCropping = false;

        this.cropBoxData = null;
        this.isDraggingCrop = false;
        this.isResizingCrop = false;
        this.activeHandle = null;
        this.dragStart = null;
        this.startBox = null;
        this.currentAspect = null;
        this.aspectLocked = false;
        this.cropTransform = { rotation: 0, flipH: false, flipV: false };
        this.cropZoom = 1;

        
        this.initializeElements();
        this.setupEventListeners();
        this.loadDefaultSettings();
        this.updateUIState();
    }

    initializeElements() {
        // Upload elements
        this.dropZone = document.getElementById('dropZone');
        this.fileInput = document.getElementById('fileInput');
        this.fileSelectBtn = document.getElementById('fileSelectBtn');
        this.fileInfo = document.getElementById('fileInfo');
        this.fileName = document.getElementById('fileName');
        this.fileSize = document.getElementById('fileSize');

        // Video elements
        this.videoSection = document.getElementById('videoSection');
        this.videoPlayer = document.getElementById('videoPlayer');
        this.videoInfo = document.getElementById('videoInfo');
        this.videoDuration = document.getElementById('videoDuration');
        this.videoResolution = document.getElementById('videoResolution');
        this.videoAspectRatioEl = document.getElementById('videoAspectRatio');
        this.videoCanvas = document.getElementById('videoCanvas');
        this.videoTransparentBgToggle = document.getElementById('videoTransparentBgToggle');
        if (this.videoCanvas) {
            this.videoCtx = this.videoCanvas.getContext('2d');
        }

        // Settings elements
        this.settingsSection = document.getElementById('settingsSection');
        this.settingsHelp = document.getElementById('settingsHelp');
        this.settingsGrid = document.getElementById('settingsGrid');
        this.fpsSlider = document.getElementById('fpsSlider');
        this.fpsInput = document.getElementById('fpsInput');
        this.fpsValue = document.getElementById('fpsValue');
        this.resolutionSelect = document.getElementById('resolutionSelect');
        this.resolutionPills = document.querySelectorAll('#resolutionPills .resolution-pill');
        this.customResolutionGroup = document.getElementById('customResolutionGroup');
        this.customWidth = document.getElementById('customWidth');
        this.customHeight = document.getElementById('customHeight');
        this.aspectRatioInfo = document.getElementById('aspectRatioInfo');
        this.gridModeRadios = document.querySelectorAll('input[name="gridMode"]');
        this.customColumnsGroup = document.getElementById('customColumnsGroup');
        this.customColumns = document.getElementById('customColumns');
        this.filenameInput = document.getElementById('filenameInput');

        // Generation elements
        this.generationControls = document.getElementById('generationControls');
        this.generateBtn = document.getElementById('generateBtn');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.progressContainer = document.getElementById('progressContainer');
        this.progressText = document.getElementById('progressText');
        this.progressFill = document.getElementById('progressFill');

        // Preview elements
        this.previewSection = document.getElementById('previewSection');
        this.frameCount = document.getElementById('frameCount');
        this.gridSize = document.getElementById('gridSize');
        this.sheetSize = document.getElementById('sheetSize');
        this.previewSize = document.getElementById('previewSize');
        this.previewCanvasEl = document.getElementById('previewCanvas');
        this.animationPreview = document.getElementById('animationPreview');
        this.canvasWrapper = document.getElementById('canvasWrapper');
        this.zoomInBtn = document.getElementById('zoomInBtn');
        this.zoomOutBtn = document.getElementById('zoomOutBtn');
        this.resetZoomBtn = document.getElementById('resetZoomBtn');
        this.cropBtn = document.getElementById('cropBtn');
        this.exportBtn = document.getElementById('exportBtn');
        this.exportStatus = document.getElementById('exportStatus');

        // Layout columns
        this.mainColumn = document.getElementById('mainColumn');
        this.previewColumn = document.getElementById('previewColumn');

        // Crop overlay elements
        this.cropOverlay = document.getElementById('cropOverlay');
        this.cropCanvas = document.getElementById('cropCanvas');

        this.gridCanvas = document.getElementById('gridCanvas');
        this.cropBox = document.getElementById('cropBox');
        this.cropLabel = document.getElementById('cropLabel');
        this.cropRatioSelect = document.getElementById('cropRatio');
        this.gridToggle = document.getElementById('gridToggle');
        this.gridType = document.getElementById('gridType');
        this.cropXInput = document.getElementById('cropX');
        this.cropYInput = document.getElementById('cropY');
        this.cropWidthInput = document.getElementById('cropWidth');
        this.cropHeightInput = document.getElementById('cropHeight');
        this.lockAspect = document.getElementById('lockAspect');
        this.rotateLeftBtn = document.getElementById('rotateLeftBtn');
        this.rotateRightBtn = document.getElementById('rotateRightBtn');
        this.flipHBtn = document.getElementById('flipHBtn');
        this.flipVBtn = document.getElementById('flipVBtn');
        this.cropZoomInBtn = document.getElementById('cropZoomInBtn');
        this.cropZoomOutBtn = document.getElementById('cropZoomOutBtn');

        this.confirmCropBtn = document.getElementById('confirmCropBtn');
        this.cancelCropBtn = document.getElementById('cancelCropBtn');

        // Time range elements
        this.startTime = document.getElementById('startTime');
        this.endTime = document.getElementById('endTime');
        this.startRange = document.getElementById('startRange');
        this.endRange = document.getElementById('endRange');
        this.timeRangeInfo = document.getElementById('timeRangeInfo');

        // Add these lines in initializeElements() after existing elements
        this.compressionSlider = document.getElementById('compressionSlider');
        this.compressionValue = document.getElementById('compressionValue');
        this.compressionInfo = document.getElementById('compressionInfo');
        this.formatSelect = document.getElementById('formatSelect');

        // Background transparency toggle
        this.transparentBgToggle = document.getElementById('transparentBgToggle');

    }

    setupEventListeners() {
        // File upload listeners - Fixed implementation
        if (this.fileSelectBtn) {
            this.fileSelectBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('File select button clicked');
                if (this.fileInput) {
                    this.fileInput.click();
                }
            });
        }

        if (this.fileInput) {
            this.fileInput.addEventListener('change', (e) => {
                console.log('File input changed:', e.target.files);
                if (e.target.files && e.target.files[0]) {
                    this.handleFileSelect(e.target.files[0]);
                }
            });
        }

        // Drag and drop listeners
        if (this.dropZone) {
            this.dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                this.dropZone.classList.add('dragover');
            });

            this.dropZone.addEventListener('dragleave', (e) => {
                e.preventDefault();
                this.dropZone.classList.remove('dragover');
            });

            this.dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                this.dropZone.classList.remove('dragover');
                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith('video/')) {
                    this.handleFileSelect(file);
                } else {
                    this.showError('Please drop a valid video file');
                }
            });
        }

        // Video listeners
        if (this.videoPlayer) {
            this.videoPlayer.addEventListener('loadedmetadata', () => this.handleVideoLoaded());
            this.videoPlayer.addEventListener('error', (e) => {
                console.error('Video error:', e);
                this.showError('Failed to load video file');
            });
        }

        // Settings listeners
        if (this.fpsSlider && this.fpsInput) {
            const updateFps = (val) => {
                val = Math.min(120, Math.max(24, parseInt(val, 10) || 30));
                this.fpsSlider.value = val;
                this.fpsInput.value = val;
                if (this.fpsValue) {
                    this.fpsValue.textContent = val;
                }
            };
            this.fpsSlider.addEventListener('input', (e) => updateFps(e.target.value));
            this.fpsInput.addEventListener('input', (e) => updateFps(e.target.value));
        }

        // Update export button text based on format
        if (this.formatSelect && this.exportBtn) {
            this.formatSelect.addEventListener('change', (e) => {
                const format = e.target.value.toUpperCase();
                this.exportBtn.textContent = `Export ${format} (Compressed)`;
            });
        }


        if (this.resolutionSelect) {
            this.resolutionSelect.addEventListener('change', () => this.updateResolutionUI());
        }
        if (this.resolutionPills && this.resolutionSelect) {
            this.resolutionPills.forEach(pill => {
                pill.addEventListener('click', () => {
                    this.resolutionSelect.value = pill.dataset.value;
                    this.updateResolutionUI();
                });
            });
        }

        if (this.customWidth) {
            this.customWidth.addEventListener('input', () => this.updateCustomResolutionInfo());
        }

        if (this.customHeight) {
            this.customHeight.addEventListener('input', () => this.updateCustomResolutionInfo());
        }

        if (this.gridModeRadios) {
            this.gridModeRadios.forEach(radio => {
                radio.addEventListener('change', () => this.updateGridModeUI());
            });
        }

        // Generation listeners
        if (this.generateBtn) {
            this.generateBtn.addEventListener('click', () => this.generateSpritesheet());
        }

        if (this.cancelBtn) {
            this.cancelBtn.addEventListener('click', () => this.cancelOperation());
        }

        // Preview listeners
        if (this.zoomInBtn) {
            this.zoomInBtn.addEventListener('click', () => this.adjustZoom(1));
        }
        
        if (this.zoomOutBtn) {
            this.zoomOutBtn.addEventListener('click', () => this.adjustZoom(-1));
        }
        
        if (this.resetZoomBtn) {
            this.resetZoomBtn.addEventListener('click', () => this.resetZoom());
        }

        if (this.cropBtn) {
            this.cropBtn.addEventListener('click', () => this.enableCropMode());
        }


        if (this.cropBox) {
            this.cropBox.addEventListener('mousedown', (e) => this.startCropInteraction(e));
        }
        if (this.cropOverlay) {
            this.cropOverlay.addEventListener('mousemove', (e) => this.handleCropInteraction(e));
        }
        if (this.cropCanvas) {
            this.cropCanvas.addEventListener('click', (e) => this.placeCropBox(e));
        }
        document.addEventListener('mouseup', () => this.endCropInteraction());

        if (this.cropRatioSelect) {
            this.cropRatioSelect.addEventListener('change', () => this.updateCropAspect());
        }

        if (this.gridToggle) {
            this.gridToggle.addEventListener('change', () => this.toggleGrid());
        }

        if (this.gridType) {
            this.gridType.addEventListener('change', () => this.drawGrid());
        }

        if (this.cropXInput) {
            const updateInputs = () => this.updateCropFromInputs();
            this.cropXInput.addEventListener('input', updateInputs);
            this.cropYInput.addEventListener('input', updateInputs);
            this.cropWidthInput.addEventListener('input', updateInputs);
            this.cropHeightInput.addEventListener('input', updateInputs);
        }

        if (this.lockAspect) {
            this.lockAspect.addEventListener('change', () => {
                this.aspectLocked = this.lockAspect.checked;
                if (this.aspectLocked && this.cropBoxData) {
                    this.currentAspect = this.cropBoxData.width / this.cropBoxData.height;
                }
            });
        }

        if (this.rotateLeftBtn) {
            this.rotateLeftBtn.addEventListener('click', () => this.rotateSelection(-90));
        }
        if (this.rotateRightBtn) {
            this.rotateRightBtn.addEventListener('click', () => this.rotateSelection(90));
        }
        if (this.flipHBtn) {
            this.flipHBtn.addEventListener('click', () => this.flipSelection('h'));
        }
        if (this.flipVBtn) {
            this.flipVBtn.addEventListener('click', () => this.flipSelection('v'));
        }

        if (this.cropZoomInBtn) {
            this.cropZoomInBtn.addEventListener('click', () => this.adjustCropZoom(0.1));
        }
        if (this.cropZoomOutBtn) {
            this.cropZoomOutBtn.addEventListener('click', () => this.adjustCropZoom(-0.1));
        }


        if (this.confirmCropBtn) {
            this.confirmCropBtn.addEventListener('click', () => this.confirmCropSelection());
        }

        if (this.cancelCropBtn) {
            this.cancelCropBtn.addEventListener('click', () => this.cancelCropSelection());

        }

        if (this.exportBtn) {
            this.exportBtn.addEventListener('click', () => this.exportSpritesheet());
        }

        // Time range listeners
        if (this.startTime) {
            this.startTime.addEventListener('input', () => {
                if (this.startRange) this.startRange.value = this.startTime.value || 0;
                this.updateTimeRangeInfo();
            });
        }

        if (this.endTime) {
            this.endTime.addEventListener('input', () => {
                if (this.endRange) this.endRange.value = this.endTime.value || this.endRange.max;
                this.updateTimeRangeInfo();
            });
        }
        if (this.startRange) {
            this.startRange.addEventListener('input', () => {
                if (this.startTime) this.startTime.value = this.startRange.value;
                this.updateTimeRangeInfo();
            });
        }
        if (this.endRange) {
            this.endRange.addEventListener('input', () => {
                if (this.endTime) this.endTime.value = this.endRange.value;
                this.updateTimeRangeInfo();
            });
        }

        // Add these listeners in setupEventListeners()
        if (this.compressionSlider) {
            this.compressionSlider.addEventListener('input', (e) => {
                this.compressionValue.textContent = e.target.value;
                this.updateCompressionInfo();
            });
        }

        if (this.formatSelect) {
            this.formatSelect.addEventListener('change', () => {
                this.updateCompressionInfo();
            });
        }


        if (this.videoTransparentBgToggle) {
            this.videoTransparentBgToggle.addEventListener('change', () => {
                if (this.videoTransparentBgToggle.checked) {
                    this.startVideoTransparency();
                } else {
                    this.stopVideoTransparency();
                }
            });
        }


        if (this.transparentBgToggle) {
            this.transparentBgToggle.addEventListener('change', () => {
                if (this.spritesheet) {
                    this.applyTransparencyToSpritesheet(this.transparentBgToggle.checked);
                }
            });
        }


    }

    loadDefaultSettings() {
        if (this.fpsSlider) {
            this.fpsSlider.value = 30;
        }
        if (this.fpsInput) {
            this.fpsInput.value = 30;
        }
        if (this.fpsValue) {
            this.fpsValue.textContent = '30';
        }
        if (this.resolutionSelect) {
            this.resolutionSelect.value = 'same';
        }
        if (this.gridModeRadios) {
            this.gridModeRadios.forEach(r => r.checked = r.value === 'columns');
        }
        if (this.filenameInput) {
            this.filenameInput.value = 'spritesheet';
        }
        this.updateResolutionUI();
        this.updateGridModeUI();
    }

    updateCompressionInfo() {
    if (!this.compressionInfo || !this.compressionSlider || !this.formatSelect) return;

    const quality = parseInt(this.compressionSlider.value);
    const format = this.formatSelect.value;
    
    let infoText = '';
    let isWarning = false;

    if (format === 'jpeg') {
        if (quality < 80) {
            infoText = 'Warning: JPEG below 80% may blur sprite edges';
            isWarning = true;
        } else {
            infoText = 'JPEG format - smallest files, may slightly blur sharp edges';
        }
    } else if (format === 'webp') {
        infoText = 'WebP format - excellent compression with minimal quality loss';
    } else { // PNG
        if (quality < 70) {
            infoText = 'Warning: Low PNG quality may reduce color accuracy';
            isWarning = true;
        } else {
            infoText = 'PNG format - best for pixel-perfect sprites';
        }
    }

    this.compressionInfo.textContent = infoText;
    this.compressionInfo.classList.toggle('compression-warning', isWarning);
}

    updateResolutionUI() {
    if (!this.resolutionSelect) return;
    const value = this.resolutionSelect.value;
    if (this.resolutionPills) {
        this.resolutionPills.forEach(p => p.classList.toggle('active', p.dataset.value === value));
    }
    if (this.customResolutionGroup) {
        if (value === 'custom') {
            this.customResolutionGroup.classList.remove('hidden');
            this.updateCustomResolutionInfo();
        } else {
            this.customResolutionGroup.classList.add('hidden');
        }
    }
    }

    getGridModeValue() {
    const selected = document.querySelector('input[name="gridMode"]:checked');
    return selected ? selected.value : 'auto';
    }

    updateGridModeUI() {
    const mode = this.getGridModeValue();
    if (this.customColumnsGroup) {
        if (mode === 'custom') {
            this.customColumnsGroup.classList.remove('hidden');
        } else {
            this.customColumnsGroup.classList.add('hidden');
        }
    }
    }

    updateTimeRangeInfo() {
    if (!this.videoPlayer || !this.videoPlayer.duration || !this.timeRangeInfo) return;

    const videoDuration = this.videoPlayer.duration;
    const startTime = parseFloat(this.startTime.value) || 0;
    const endTime = parseFloat(this.endTime.value) || videoDuration;
    
    let infoText = '';
    let isWarning = false;

    // Validation
    if (startTime >= endTime) {
        infoText = 'Warning: Start time must be less than end time';
        isWarning = true;
    } else if (endTime > videoDuration) {
        infoText = `Warning: End time exceeds video duration (${this.formatTime(videoDuration)})`;
        isWarning = true;
    } else if (startTime < 0) {
        infoText = 'Warning: Start time cannot be negative';
        isWarning = true;
    } else {
        const duration = endTime - startTime;
        const fps = parseInt(this.fpsSlider ? this.fpsSlider.value : 30);
        const estimatedFrames = Math.floor(duration * fps);
        infoText = `Duration: ${this.formatTime(duration)} (≈${estimatedFrames} frames at ${fps} FPS)`;
    }

    this.timeRangeInfo.textContent = infoText;
    this.timeRangeInfo.classList.toggle('time-range-warning', isWarning);
    }


    updateUIState() {
        const hasVideo = this.currentFile && this.videoPlayer && this.videoPlayer.readyState >= 1;
        
        // Enable/disable generation controls based on video availability
        if (this.generateBtn) {
            this.generateBtn.disabled = !hasVideo;
        }
        
        if (hasVideo) {
            if (this.settingsHelp) {
                this.settingsHelp.textContent = 'Adjust settings and click Generate to create spritesheet';
            }
            if (this.settingsGrid) {
                this.settingsGrid.style.opacity = '1';
            }
            if (this.generationControls) {
                this.generationControls.style.opacity = '1';
            }
        } else {
            if (this.settingsHelp) {
                this.settingsHelp.textContent = 'Upload a video first to enable generation settings';
            }
            if (this.settingsGrid) {
                this.settingsGrid.style.opacity = '0.6';
            }
            if (this.generationControls) {
                this.generationControls.style.opacity = '0.6';
            }
        }
    }

    updateCustomResolutionInfo() {
        if (!this.videoPlayer || !this.videoPlayer.videoWidth || !this.aspectRatioInfo) return;

        const width = parseInt(this.customWidth.value) || null;
        const height = parseInt(this.customHeight.value) || null;
        const aspectRatio = this.videoAspectRatio;

        let infoText = '';
        let isWarning = false;

        if (width && height) {
            const inputAspectRatio = width / height;
            const difference = Math.abs(inputAspectRatio - aspectRatio) / aspectRatio;
            
            if (difference > 0.05) { // More than 5% difference
                infoText = `Warning: This will distort the video (${width}×${height})`;
                isWarning = true;
            } else {
                infoText = `Custom resolution: ${width}×${height}`;
            }
        } else if (width) {
            const calculatedHeight = Math.round(width / aspectRatio);
            infoText = `Width: ${width}, Height: ${calculatedHeight} (auto-calculated)`;
            if (this.customHeight) {
                this.customHeight.placeholder = calculatedHeight.toString();
            }
        } else if (height) {
            const calculatedWidth = Math.round(height * aspectRatio);
            infoText = `Width: ${calculatedWidth} (auto-calculated), Height: ${height}`;
            if (this.customWidth) {
                this.customWidth.placeholder = calculatedWidth.toString();
            }
        } else {
            infoText = 'Enter width or height to auto-calculate the other dimension';
        }

        this.aspectRatioInfo.textContent = infoText;
        this.aspectRatioInfo.classList.toggle('aspect-ratio-warning', isWarning);
    }

    handleFileSelect(file) {
        if (!file) {
            console.log('No file provided');
            return;
        }

        console.log('Handling file:', file.name, file.type);

        // Reset preview layout when selecting a new file
        if (this.previewColumn) {
            this.previewColumn.classList.add('hidden');
        }
        if (this.mainColumn) {
            this.mainColumn.classList.remove('col-lg-6');
        }
        if (this.previewSection) {
            this.previewSection.classList.add('hidden');
        }

        if (!file.type.startsWith('video/')) {
            this.showError('Please select a valid video file');
            return;
        }

        this.currentFile = file;
        this.displayFileInfo(file);
        this.loadVideo(file);
    }

    displayFileInfo(file) {
        if (this.fileName) {
            this.fileName.textContent = file.name;
        }
        if (this.fileSize) {
            this.fileSize.textContent = this.formatFileSize(file.size);
        }
        if (this.fileInfo) {
            this.fileInfo.classList.remove('hidden');
        }
    }

    loadVideo(file) {
        if (!this.videoPlayer) return;
        
        try {
            const url = URL.createObjectURL(file);
            this.videoPlayer.src = url;
            this.videoPlayer.load();
            console.log('Video loading started');
        } catch (error) {
            console.error('Error loading video:', error);
            this.showError('Failed to load video file');
        }
    }

    handleVideoLoaded() {
        if (!this.videoPlayer) return;
        
        const video = this.videoPlayer;
        this.videoAspectRatio = video.videoWidth / video.videoHeight;
        
        console.log('Video loaded:', video.videoWidth, 'x', video.videoHeight, 'aspect ratio:', this.videoAspectRatio);
        
        // Display video metadata
        if (this.videoDuration) {
            this.videoDuration.textContent = `Duration: ${this.formatTime(video.duration)}`;
        }
        if (this.videoResolution) {
            this.videoResolution.textContent = `Resolution: ${video.videoWidth}×${video.videoHeight}`;
        }
        if (this.videoAspectRatioEl) {
            this.videoAspectRatioEl.textContent = `Aspect Ratio: ${this.videoAspectRatio.toFixed(3)}`;
        }

        // Show video section
        if (this.videoSection) {
            this.videoSection.classList.remove('hidden');
        }

        // Update filename based on original video name
        if (this.currentFile && this.filenameInput) {
            const baseName = this.currentFile.name.replace(/\.[^/.]+$/, "");
            this.filenameInput.value = `${baseName}_spritesheet`;
        }

        // Reset custom resolution fields
        if (this.customWidth) {
            this.customWidth.value = '';
            this.customWidth.placeholder = 'Auto';
        }
        if (this.customHeight) {
            this.customHeight.value = '';
            this.customHeight.placeholder = 'Auto';
        }

        this.updateResolutionUI();

        // Initialize time range inputs
        if (this.startTime) {
            this.startTime.value = '0';
            this.startTime.max = video.duration.toFixed(1);
        }
        if (this.endTime) {
            this.endTime.value = '';
            this.endTime.placeholder = video.duration.toFixed(1);
            this.endTime.max = video.duration.toFixed(1);
        }
        if (this.startRange) {
            this.startRange.value = '0';
            this.startRange.max = video.duration.toFixed(1);
        }
        if (this.endRange) {
            this.endRange.value = video.duration.toFixed(1);
            this.endRange.max = video.duration.toFixed(1);
        }

        // Update time range info
        this.updateTimeRangeInfo();


        // Update UI state
        this.updateUIState();
        this.updateCustomResolutionInfo();

        if (this.videoTransparentBgToggle && this.videoTransparentBgToggle.checked) {
            this.startVideoTransparency();
        }

        this.showSuccess('Video loaded successfully! Configure settings and generate spritesheet.');
    }

    async generateSpritesheet() {
        if (this.isGenerating || !this.currentFile) return;

        this.isGenerating = true;
        this.cancelGeneration = false;
        this.extractedFrames = [];

        if (this.animationPreview) {
            this.animationPreview.classList.add('hidden');
        }
        if (this.animationFrameRequest) {
            cancelAnimationFrame(this.animationFrameRequest);
            this.animationFrameRequest = null;
        }

        try {
            this.showGenerationProgress();
            
            const settings = this.getCurrentSettings();
            const frames = await this.extractFrames(settings);
            
            if (this.cancelGeneration) {
                this.hideGenerationProgress();
                return;
            }

            this.extractedFrames = frames;
            this.originalFrames = frames.slice();
            const spritesheets = await this.createSpritesheets(frames, settings);
            
            if (this.cancelGeneration) {
                this.hideGenerationProgress();
                return;
            }

            this.spritesheet = spritesheets;
            this.applyTransparencyToSpritesheet(settings.transparentBackground);
            this.displaySpritesheet(this.spritesheet, settings);
            this.hideGenerationProgress();
            this.showSuccess('Spritesheet generated successfully!');

        } catch (error) {
            console.error('Generation error:', error);
            this.showError('Failed to generate spritesheet: ' + error.message);
            this.hideGenerationProgress();
        }

        this.isGenerating = false;
    }

    getCurrentSettings() {
        if (!this.videoPlayer) return {};
        
        const video = this.videoPlayer;
        let spriteWidth = video.videoWidth;
        let spriteHeight = video.videoHeight;
        
        // Get time range
        const startTime = Math.max(0, parseFloat(this.startTime ? this.startTime.value : 0) || 0);
        const endTime = Math.min(video.duration, parseFloat(this.endTime ? this.endTime.value : video.duration) || video.duration);
        const duration = Math.max(0.1, endTime - startTime);
        
        const resolution = this.resolutionSelect ? this.resolutionSelect.value : 'same';
        if (resolution === 'custom') {
            const customW = parseInt(this.customWidth.value);
            const customH = parseInt(this.customHeight.value);
            
            if (customW && customH) {
                spriteWidth = customW;
                spriteHeight = customH;
            } else if (customW) {
                spriteWidth = customW;
                spriteHeight = Math.round(customW / this.videoAspectRatio);
            } else if (customH) {
                spriteHeight = customH;
                spriteWidth = Math.round(customH * this.videoAspectRatio);
            }
        } else if (resolution !== 'same') {
            const size = parseInt(resolution);
            spriteWidth = size;
            spriteHeight = size;
        }

        return {
            fps: parseInt(this.fpsSlider ? this.fpsSlider.value : 30),
            spriteWidth,
            spriteHeight,
            originalWidth: video.videoWidth,
            originalHeight: video.videoHeight,
            duration: duration,
            totalDuration: video.duration,
            startTime: startTime,
            endTime: endTime,
            gridMode: this.getGridModeValue(),
            customColumns: parseInt(this.customColumns ? this.customColumns.value : 4),
            filename: (this.filenameInput ? this.filenameInput.value : 'spritesheet') || 'spritesheet',
            // Add compression settings
            compressionQuality: parseInt(this.compressionSlider ? this.compressionSlider.value : 95),
            exportFormat: this.formatSelect ? this.formatSelect.value : 'png',
            transparentBackground: this.transparentBgToggle ? this.transparentBgToggle.checked : false
        };
    }



    async extractFrames(settings) {
    if (!this.videoPlayer) throw new Error('No video available');
    
    const video = this.videoPlayer;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = settings.spriteWidth;
    canvas.height = settings.spriteHeight;

    const frameInterval = 1 / settings.fps;
    const totalFrames = Math.floor(settings.duration * settings.fps);
    const frames = [];

    this.updateProgress(0, `Preparing to extract ${totalFrames} frames from ${this.formatTime(settings.startTime)} to ${this.formatTime(settings.endTime)}`);

    for (let i = 0; i < totalFrames; i++) {
        if (this.cancelGeneration) break;

        // Calculate the actual time in the video using start time offset
        const relativeTime = i * frameInterval;
        const absoluteTime = settings.startTime + relativeTime;
        
        // Ensure we don't exceed the end time
        if (absoluteTime > settings.endTime) break;
        
        await this.seekToTime(video, absoluteTime);

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw frame maintaining aspect ratio
        if (settings.spriteWidth === settings.originalWidth && settings.spriteHeight === settings.originalHeight) {
            // Same resolution - direct copy
            ctx.drawImage(video, 0, 0);
        } else {
            // Different resolution - scale maintaining aspect ratio
            const scale = Math.min(
                settings.spriteWidth / settings.originalWidth,
                settings.spriteHeight / settings.originalHeight
            );
            
            const scaledWidth = settings.originalWidth * scale;
            const scaledHeight = settings.originalHeight * scale;
            const x = (settings.spriteWidth - scaledWidth) / 2;
            const y = (settings.spriteHeight - scaledHeight) / 2;
            
            ctx.drawImage(video, x, y, scaledWidth, scaledHeight);
        }

        // Convert to image data
        const imageData = canvas.toDataURL('image/png', 1.0);
        frames.push(imageData);

        // Update progress
        const progress = ((i + 1) / totalFrames) * 50; // 50% for extraction
        this.updateProgress(progress, `Extracting frame ${i + 1}/${totalFrames} at ${this.formatTime(absoluteTime)}`);

        // Allow other processes to run
        if (i % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 1));
        }
    }

    return frames;
    }


    async createSpritesheets(frames, settings) {
        const frameCount = frames.length;
        let columns, rows;

        if (settings.gridMode === 'custom') {
            columns = settings.customColumns;
            rows = Math.ceil(frameCount / columns);
        } else {
            // Auto-calculate optimal grid
            const aspectRatio = settings.spriteWidth / settings.spriteHeight;
            columns = Math.ceil(Math.sqrt(frameCount * aspectRatio));
            rows = Math.ceil(frameCount / columns);
        }

        const sheetWidth = columns * settings.spriteWidth;
        const sheetHeight = rows * settings.spriteHeight;

        // Create full-size canvas for export
        const fullCanvas = document.createElement('canvas');
        const fullCtx = fullCanvas.getContext('2d');
        fullCanvas.width = sheetWidth;
        fullCanvas.height = sheetHeight;

        // Create preview canvas with optimized size
        const previewScale = Math.min(1, this.maxPreviewWidth / sheetWidth);
        const previewWidth = Math.round(sheetWidth * previewScale);
        const previewHeight = Math.round(sheetHeight * previewScale);
        
        const previewCanvas = document.createElement('canvas');
        const previewCtx = previewCanvas.getContext('2d');
        previewCanvas.width = previewWidth;
        previewCanvas.height = previewHeight;

        // Clear both canvases
        fullCtx.clearRect(0, 0, sheetWidth, sheetHeight);
        previewCtx.clearRect(0, 0, previewWidth, previewHeight);

        this.updateProgress(50, 'Compositing spritesheet...');

        // Draw each frame to both canvases
        for (let i = 0; i < frames.length; i++) {
            if (this.cancelGeneration) break;

            const img = new Image();
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = frames[i];
            });

            const col = i % columns;
            const row = Math.floor(i / columns);
            
            // Full-size canvas
            const fullX = col * settings.spriteWidth;
            const fullY = row * settings.spriteHeight;
            fullCtx.drawImage(img, fullX, fullY, settings.spriteWidth, settings.spriteHeight);
            
            // Preview canvas
            const previewX = col * settings.spriteWidth * previewScale;
            const previewY = row * settings.spriteHeight * previewScale;
            const previewSpriteWidth = settings.spriteWidth * previewScale;
            const previewSpriteHeight = settings.spriteHeight * previewScale;
            previewCtx.drawImage(img, previewX, previewY, previewSpriteWidth, previewSpriteHeight);

            const progress = 50 + ((i + 1) / frames.length) * 50; // 50-100%
            this.updateProgress(progress, `Compositing frame ${i + 1}/${frames.length}`);

            // Allow other processes to run
            if (i % 5 === 0) {
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }

        // Clone original canvases for background processing
        const originalFullCanvas = document.createElement('canvas');
        originalFullCanvas.width = sheetWidth;
        originalFullCanvas.height = sheetHeight;
        originalFullCanvas.getContext('2d').drawImage(fullCanvas, 0, 0);

        const originalPreviewCanvas = document.createElement('canvas');
        originalPreviewCanvas.width = previewWidth;
        originalPreviewCanvas.height = previewHeight;
        originalPreviewCanvas.getContext('2d').drawImage(previewCanvas, 0, 0);

        return {
            fullCanvas,
            previewCanvas,
            originalFullCanvas,
            originalPreviewCanvas,
            columns,
            rows,
            frameCount,
            spriteWidth: settings.spriteWidth,
            spriteHeight: settings.spriteHeight,
            sheetWidth,
            sheetHeight,
            previewWidth,
            previewHeight,
            previewScale
        };
    }

    displaySpritesheet(spritesheets, settings) {
        // Update info
        if (this.frameCount) {
            this.frameCount.textContent = spritesheets.frameCount;
        }
        if (this.gridSize) {
            this.gridSize.textContent = `${spritesheets.columns}×${spritesheets.rows}`;
        }
        if (this.sheetSize) {
            this.sheetSize.textContent = `${spritesheets.sheetWidth}×${spritesheets.sheetHeight}`;
        }
        if (this.previewSize) {
            this.previewSize.textContent = `${spritesheets.previewWidth}×${spritesheets.previewHeight}`;
        }

        // Display preview canvas
        if (this.previewCanvasEl) {
            const ctx = this.previewCanvasEl.getContext('2d');
            this.previewCanvasEl.width = spritesheets.previewWidth;
            this.previewCanvasEl.height = spritesheets.previewHeight;
            ctx.drawImage(spritesheets.previewCanvas, 0, 0);
        }

        // Show preview section and layout
        if (this.previewSection) {
            this.previewSection.classList.remove('hidden');
        }
        if (this.previewColumn) {
            this.previewColumn.classList.remove('hidden');
        }
        if (this.mainColumn) {
            this.mainColumn.classList.add('col-lg-6');
        }

        if (this.cropBtn) {
            this.cropBtn.disabled = false;
        }

        this.resetZoom();

        // Scroll to preview
        if (this.previewSection) {
            this.previewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        this.createAnimationPreview(this.extractedFrames, settings.fps);
    }

    createAnimationPreview(frames, fps) {
        if (!this.animationPreview || !frames.length) return;

        const canvas = this.animationPreview;
        const ctx = canvas.getContext('2d');

        // Preload images
        const images = frames.map(src => {
            const img = new Image();
            img.src = src;
            return img;
        });

        // Wait for first image to load to set canvas size
        images[0].onload = () => {
            canvas.width = images[0].width;
            canvas.height = images[0].height;
            canvas.style.width = images[0].width + 'px';
            canvas.style.height = images[0].height + 'px';
            canvas.classList.remove('hidden');

            let frameIndex = 0;
            let lastTime = 0;
            const frameDuration = 1000 / fps;

            const animate = (timestamp) => {
                if (timestamp - lastTime >= frameDuration) {
                    const image = images[frameIndex];
                    if (image.complete) {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                    }
                    frameIndex = (frameIndex + 1) % images.length;
                    lastTime = timestamp;
                }
                this.animationFrameRequest = requestAnimationFrame(animate);
            };

            this.animationFrameRequest = requestAnimationFrame(animate);
        };
    }


    enableCropMode() {

        if (!this.extractedFrames.length) return;
        if (this.cropBtn) {
            this.cropBtn.disabled = true;
        }
        const img = new Image();
        img.onload = () => {
            if (this.cropCanvas) {
                this.cropCanvas.width = img.width;
                this.cropCanvas.height = img.height;
                const ctx = this.cropCanvas.getContext('2d');
                this.cropCanvas.style.maxWidth = 'none';
                this.cropCanvas.style.maxHeight = 'none';
                ctx.drawImage(img, 0, 0);
            }

            if (this.gridCanvas) {
                this.gridCanvas.width = img.width;
                this.gridCanvas.height = img.height;
                this.gridCanvas.style.maxWidth = 'none';
                this.gridCanvas.style.maxHeight = 'none';
                this.drawGrid();
            }

            this.cropBoxData = null;
            this.currentAspect = null;
            this.aspectLocked = false;
            this.cropTransform = { rotation: 0, flipH: false, flipV: false };
            if (this.cropRatioSelect) {
                this.cropRatioSelect.value = 'free';
            }
            if (this.lockAspect) {
                this.lockAspect.checked = false;
            }

            if (this.cropOverlay && this.cropBox) {
                this.cropOverlay.classList.remove('hidden');
                this.cropBox.classList.add('hidden');
            }
            const container = this.cropCanvas ? this.cropCanvas.parentElement : null;
            this.cropZoom = 1;
            if (container) {
                const fitScale = Math.min(container.clientWidth / img.width, 1);
                this.cropZoom = fitScale;
            }
            this.adjustCropZoom(0);
            this.isCropping = true;
            this.showWarning('Click on image to place crop area');

        };
        img.src = this.extractedFrames[0];
    }

    placeCropBox(e) {
        if (!this.isCropping || !this.cropCanvas) return;
        if (e.target !== this.cropCanvas) return;

        const rect = this.cropCanvas.getBoundingClientRect();
        const baseSize = Math.min(rect.width, rect.height) * 0.25;
        let width = baseSize;
        let height = this.currentAspect ? baseSize / this.currentAspect : baseSize;

        if (height > rect.height) {
            height = rect.height;
            width = this.currentAspect ? height * this.currentAspect : height;
        }

        let x = e.clientX - rect.left - width / 2;
        let y = e.clientY - rect.top - height / 2;
        x = Math.max(0, Math.min(x, rect.width - width));
        y = Math.max(0, Math.min(y, rect.height - height));

        this.cropBoxData = { x, y, width, height };
        if (this.cropBox) {
            this.cropBox.classList.remove('hidden');
        }
        this.updateCropBoxUI();
    }

    startCropInteraction(e) {
        if (!this.isCropping || !this.cropBox) return;
        e.preventDefault();
        const handle = e.target.classList.contains('handle') ? e.target.classList[1].replace('handle-', '') : null;
        if (handle) {
            this.isResizingCrop = true;
            this.activeHandle = handle;
        } else {
            this.isDraggingCrop = true;
        }
        this.dragStart = { x: e.clientX, y: e.clientY };
        this.startBox = { ...this.cropBoxData };
    }

    handleCropInteraction(e) {
        if (!this.isCropping || (!this.isDraggingCrop && !this.isResizingCrop)) return;
        const dx = e.clientX - this.dragStart.x;
        const dy = e.clientY - this.dragStart.y;
        let { x, y, width, height } = this.startBox;
        const canvasRect = this.cropCanvas.getBoundingClientRect();
        const maxWidth = canvasRect.width;
        const maxHeight = canvasRect.height;
        const aspect = this.currentAspect;

        if (this.isDraggingCrop) {
            x = Math.min(Math.max(0, this.startBox.x + dx), maxWidth - width);
            y = Math.min(Math.max(0, this.startBox.y + dy), maxHeight - height);
        } else if (this.isResizingCrop) {
            if (this.activeHandle.includes('e')) {
                width = Math.min(Math.max(20, this.startBox.width + dx), maxWidth - x);
            }
            if (this.activeHandle.includes('s')) {
                height = Math.min(Math.max(20, this.startBox.height + dy), maxHeight - y);
            }
            if (this.activeHandle.includes('w')) {
                x = Math.min(Math.max(0, this.startBox.x + dx), this.startBox.x + this.startBox.width - 20);
                width = this.startBox.width - (x - this.startBox.x);
            }
            if (this.activeHandle.includes('n')) {
                y = Math.min(Math.max(0, this.startBox.y + dy), this.startBox.y + this.startBox.height - 20);
                height = this.startBox.height - (y - this.startBox.y);
            }
            if (aspect) {
                if (this.activeHandle.includes('e') || this.activeHandle.includes('w')) {
                    height = width / aspect;
                    if (this.activeHandle.includes('n')) {
                        y = this.startBox.y + this.startBox.height - height;
                    }
                } else if (this.activeHandle.includes('n') || this.activeHandle.includes('s')) {
                    width = height * aspect;
                    if (this.activeHandle.includes('w')) {
                        x = this.startBox.x + this.startBox.width - width;
                    }
                }
                if (x + width > maxWidth) {
                    width = maxWidth - x;
                    height = width / aspect;
                }
                if (y + height > maxHeight) {
                    height = maxHeight - y;
                    width = height * aspect;
                }
            }
        }
        this.cropBoxData = { x, y, width, height };
        this.updateCropBoxUI();
    }

    endCropInteraction() {
        this.isDraggingCrop = false;
        this.isResizingCrop = false;
        this.activeHandle = null;
    }

    updateCropAspect() {
        if (!this.cropRatioSelect || !this.cropBoxData) return;
        const value = this.cropRatioSelect.value;
        if (value === 'free') {
            this.currentAspect = null;
            return;
        }
        const [w, h] = value.split(':').map(Number);
        this.currentAspect = w / h;
        this.cropBoxData.height = this.cropBoxData.width / this.currentAspect;
        this.updateCropBoxUI();
    }

    updateCropBoxUI() {
        if (!this.cropBox) return;

        const { x, y, width, height } = this.cropBoxData;
        this.cropBox.style.left = `${x}px`;
        this.cropBox.style.top = `${y}px`;
        this.cropBox.style.width = `${width}px`;
        this.cropBox.style.height = `${height}px`;
        if (this.cropLabel) {
            this.cropLabel.textContent = `${Math.round(width)}×${Math.round(height)}`;
        }
        if (this.cropXInput) this.cropXInput.value = Math.round(x);
        if (this.cropYInput) this.cropYInput.value = Math.round(y);
        if (this.cropWidthInput) this.cropWidthInput.value = Math.round(width);
        if (this.cropHeightInput) this.cropHeightInput.value = Math.round(height);
    }

    updateCropFromInputs() {
        if (!this.cropBoxData || !this.cropCanvas) return;
        const canvasRect = this.cropCanvas.getBoundingClientRect();
        const maxWidth = canvasRect.width;
        const maxHeight = canvasRect.height;
        let x = parseFloat(this.cropXInput.value) || 0;
        let y = parseFloat(this.cropYInput.value) || 0;
        let width = parseFloat(this.cropWidthInput.value) || this.cropBoxData.width;
        let height = parseFloat(this.cropHeightInput.value) || this.cropBoxData.height;
        if (this.aspectLocked) {
            if (width !== this.cropBoxData.width) {
                height = width / this.currentAspect;
            } else if (height !== this.cropBoxData.height) {
                width = height * this.currentAspect;
            }
        }
        width = Math.min(Math.max(20, width), maxWidth - x);
        height = Math.min(Math.max(20, height), maxHeight - y);
        x = Math.min(Math.max(0, x), maxWidth - width);
        y = Math.min(Math.max(0, y), maxHeight - height);
        this.cropBoxData = { x, y, width, height };
        this.updateCropBoxUI();
    }

    toggleGrid() {
        if (!this.gridCanvas || !this.gridToggle) return;
        this.gridCanvas.classList.toggle('hidden', !this.gridToggle.checked);
        if (this.gridToggle.checked) {
            this.drawGrid();
        }
    }

    drawGrid() {
        if (!this.gridCanvas || !this.gridToggle || !this.gridToggle.checked || !this.cropCanvas) return;
        const ctx = this.gridCanvas.getContext('2d');
        this.gridCanvas.width = this.cropCanvas.width;
        this.gridCanvas.height = this.cropCanvas.height;
        ctx.clearRect(0, 0, this.gridCanvas.width, this.gridCanvas.height);
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 1;
        const w = this.gridCanvas.width;
        const h = this.gridCanvas.height;
        ctx.beginPath();
        if (this.gridType && this.gridType.value === 'golden') {
            const phi = 0.618;
            ctx.moveTo(w * phi, 0); ctx.lineTo(w * phi, h);
            ctx.moveTo(w * (1 - phi), 0); ctx.lineTo(w * (1 - phi), h);
            ctx.moveTo(0, h * phi); ctx.lineTo(w, h * phi);
            ctx.moveTo(0, h * (1 - phi)); ctx.lineTo(w, h * (1 - phi));
        } else {
            ctx.moveTo(w / 3, 0); ctx.lineTo(w / 3, h);
            ctx.moveTo((2 * w) / 3, 0); ctx.lineTo((2 * w) / 3, h);
            ctx.moveTo(0, h / 3); ctx.lineTo(w, h / 3);
            ctx.moveTo(0, (2 * h) / 3); ctx.lineTo(w, (2 * h) / 3);
        }
        ctx.stroke();
    }

    adjustCropZoom(delta) {
        if (!this.cropCanvas) return;
        const prevZoom = this.cropZoom;
        this.cropZoom = Math.min(Math.max(this.cropZoom + delta, 0.1), 5);
        const width = this.cropCanvas.width * this.cropZoom;
        const height = this.cropCanvas.height * this.cropZoom;
        this.cropCanvas.style.maxWidth = 'none';
        this.cropCanvas.style.maxHeight = 'none';
        this.cropCanvas.style.width = `${width}px`;
        this.cropCanvas.style.height = `${height}px`;
        if (this.gridCanvas) {
            this.gridCanvas.style.maxWidth = 'none';
            this.gridCanvas.style.maxHeight = 'none';
            this.gridCanvas.style.width = `${width}px`;
            this.gridCanvas.style.height = `${height}px`;
        }
        if (this.cropBoxData) {
            const scale = this.cropZoom / prevZoom;
            this.cropBoxData = {
                x: this.cropBoxData.x * scale,
                y: this.cropBoxData.y * scale,
                width: this.cropBoxData.width * scale,
                height: this.cropBoxData.height * scale
            };
            this.updateCropBoxUI();
        }
        this.drawGrid();
    }

    rotateSelection(angle) {
        this.cropTransform.rotation = (this.cropTransform.rotation + angle) % 360;
    }

    flipSelection(dir) {
        if (dir === 'h') {
            this.cropTransform.flipH = !this.cropTransform.flipH;
        } else if (dir === 'v') {
            this.cropTransform.flipV = !this.cropTransform.flipV;
        }

    }

    confirmCropSelection() {
        if (!this.cropBoxData) {
            this.showError('Please select a crop region');
            return;
        }
        const canvasRect = this.cropCanvas.getBoundingClientRect();
        const scaleX = this.cropCanvas.width / canvasRect.width;
        const scaleY = this.cropCanvas.height / canvasRect.height;
        const region = {
            x: Math.round(this.cropBoxData.x * scaleX),
            y: Math.round(this.cropBoxData.y * scaleY),
            width: Math.round(this.cropBoxData.width * scaleX),
            height: Math.round(this.cropBoxData.height * scaleY)

        };
        const transform = { ...this.cropTransform };
        this.hideCropOverlay();
        this.cropSpritesheet(region, transform);

    }

    cancelCropSelection() {
        this.hideCropOverlay();
        if (this.cropBtn) {
            this.cropBtn.disabled = false;
        }
    }

    hideCropOverlay() {

        if (this.cropOverlay) {
            this.cropOverlay.classList.add('hidden');
        }
        if (this.cropBox) {
            this.cropBox.classList.add('hidden');
        }

        if (this.gridCanvas) {
            this.gridCanvas.classList.add('hidden');
        }

        if (this.cropCanvas) {
            this.cropCanvas.style.width = '';
            this.cropCanvas.style.height = '';
            this.cropCanvas.style.maxWidth = '';
            this.cropCanvas.style.maxHeight = '';
        }
        if (this.gridCanvas) {
            this.gridCanvas.style.width = '';
            this.gridCanvas.style.height = '';
            this.gridCanvas.style.maxWidth = '';
            this.gridCanvas.style.maxHeight = '';
        }
        this.cropZoom = 1;
        this.isCropping = false;
        this.cropBoxData = null;
        this.isDraggingCrop = false;
        this.isResizingCrop = false;
        this.activeHandle = null;
        this.dragStart = null;
        this.startBox = null;
    }

    async cropSpritesheet(region, transform) {
        const sourceFrames = this.originalFrames.length ? this.originalFrames : this.extractedFrames;
        if (!sourceFrames.length) {

            this.showError('No frames available to crop');
            return;
        }

        const { x, y, width, height } = region;
        if (width <= 0 || height <= 0) {
            this.showError('Invalid crop region');
            return;
        }

        if (this.cropBtn) {
            this.cropBtn.disabled = true;
        }


        const angle = ((transform.rotation % 360) + 360) % 360;
        let outWidth = width;
        let outHeight = height;
        if (angle % 180 !== 0) {
            outWidth = height;
            outHeight = width;
        }

        const croppedFrames = [];
        for (const frameData of sourceFrames) {

            const img = new Image();
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = frameData;
            });
            const canvas = document.createElement('canvas');

            canvas.width = outWidth;
            canvas.height = outHeight;
            const ctx = canvas.getContext('2d');
            ctx.save();
            ctx.translate(outWidth / 2, outHeight / 2);
            ctx.scale(transform.flipH ? -1 : 1, transform.flipV ? -1 : 1);
            ctx.rotate((angle * Math.PI) / 180);
            ctx.drawImage(img, x, y, width, height, -width / 2, -height / 2, width, height);
            ctx.restore();

            croppedFrames.push(canvas.toDataURL('image/png', 1.0));
        }

        const settings = this.getCurrentSettings();

        settings.spriteWidth = outWidth;
        settings.spriteHeight = outHeight;

        const spritesheets = await this.createSpritesheets(croppedFrames, settings);
        this.extractedFrames = croppedFrames;
        this.spritesheet = spritesheets;
        this.applyTransparencyToSpritesheet(settings.transparentBackground);
        this.displaySpritesheet(this.spritesheet, settings);
        this.showSuccess('Spritesheet cropped successfully!');

        if (this.cropBtn) {
            this.cropBtn.disabled = false;
        }
    }


    startVideoTransparency() {
        if (!this.videoPlayer || !this.videoCanvas || !this.videoCtx) return;
        this.videoCanvas.width = this.videoPlayer.videoWidth;
        this.videoCanvas.height = this.videoPlayer.videoHeight;
        this.videoCanvas.classList.remove('hidden');
        this.videoPlayer.classList.add('hidden');

        const render = () => {
            if (!this.videoTransparentBgToggle || !this.videoTransparentBgToggle.checked) return;
            this.videoCtx.drawImage(this.videoPlayer, 0, 0, this.videoCanvas.width, this.videoCanvas.height);
            this.makeBackgroundTransparent(this.videoCtx, this.videoCanvas.width, this.videoCanvas.height);
            this.videoTransparencyFrame = requestAnimationFrame(render);
        };
        render();
    }

    stopVideoTransparency() {
        if (this.videoTransparencyFrame) {
            cancelAnimationFrame(this.videoTransparencyFrame);
            this.videoTransparencyFrame = null;
        }
        if (this.videoCanvas) {
            this.videoCanvas.classList.add('hidden');
        }
        if (this.videoPlayer) {
            this.videoPlayer.classList.remove('hidden');
        }
    }

    applyTransparencyToSpritesheet(enabled) {
        if (!this.spritesheet) return;

        const { originalFullCanvas, originalPreviewCanvas, fullCanvas, previewCanvas } = this.spritesheet;
        const fullCtx = fullCanvas.getContext('2d');
        const previewCtx = previewCanvas.getContext('2d');

        // Reset from originals
        fullCtx.clearRect(0, 0, fullCanvas.width, fullCanvas.height);
        fullCtx.drawImage(originalFullCanvas, 0, 0);
        previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        previewCtx.drawImage(originalPreviewCanvas, 0, 0);

        if (enabled) {
            this.makeBackgroundTransparent(fullCtx, fullCanvas.width, fullCanvas.height);
            this.makeBackgroundTransparent(previewCtx, previewCanvas.width, previewCanvas.height);
        }

        if (this.previewCanvasEl) {
            const ctx = this.previewCanvasEl.getContext('2d');
            this.previewCanvasEl.width = previewCanvas.width;
            this.previewCanvasEl.height = previewCanvas.height;
            ctx.drawImage(previewCanvas, 0, 0);
        }
    }

    makeBackgroundTransparent(ctx, width, height) {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const threshold = 10; // pure black cutoff
        const softness = 40; // range for smooth edge fade

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const max = Math.max(r, g, b);

            if (max <= threshold) {
                data[i + 3] = 0;
            } else if (max < threshold + softness) {
                const alphaFactor = (max - threshold) / softness;
                const newAlpha = alphaFactor * 255;
                const scale = newAlpha > 0 ? 255 / newAlpha : 0;
                data[i] = Math.min(255, r * scale);
                data[i + 1] = Math.min(255, g * scale);
                data[i + 2] = Math.min(255, b * scale);
                data[i + 3] = newAlpha;
            }
        }
        ctx.putImageData(imageData, 0, 0);
        this.addSmoothBorder(ctx, width, height);
    }

    addSmoothBorder(ctx, width, height) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(ctx.canvas, 0, 0);

        ctx.save();
        ctx.globalCompositeOperation = 'destination-over';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 2;
        ctx.drawImage(tempCanvas, 0, 0);
        ctx.restore();
    }

    async seekToTime(video, time) {
        return new Promise((resolve) => {
            const onSeeked = () => {
                video.removeEventListener('seeked', onSeeked);
                resolve();
            };
            
            const onCanPlay = () => {
                video.removeEventListener('canplay', onCanPlay);
                resolve();
            };
            
            video.addEventListener('seeked', onSeeked);
            video.addEventListener('canplay', onCanPlay);
            video.currentTime = Math.min(time, video.duration);
        });
    }

    adjustZoom(direction) {
        this.zoomLevel = Math.max(1, Math.min(5, this.zoomLevel + direction));
        if (this.canvasWrapper) {
            this.canvasWrapper.className = 'canvas-wrapper zoom-' + this.zoomLevel;
        }
    }

    resetZoom() {
        this.zoomLevel = 1;
        if (this.canvasWrapper) {
            this.canvasWrapper.className = 'canvas-wrapper zoom-1';
        }
    }

    optimizePngCanvas(sourceCanvas, quality) {
    // Create a new canvas for optimization
    const optimizedCanvas = document.createElement('canvas');
    const ctx = optimizedCanvas.getContext('2d');
    
    optimizedCanvas.width = sourceCanvas.width;
    optimizedCanvas.height = sourceCanvas.height;
    
    // Apply slight smoothing for PNG compression while maintaining sharpness
    ctx.imageSmoothingEnabled = false;
    
    // Draw the source canvas
    ctx.drawImage(sourceCanvas, 0, 0);
    
    // For PNG, we can reduce the color palette slightly for better compression
    if (quality < 0.9) {
        const imageData = ctx.getImageData(0, 0, optimizedCanvas.width, optimizedCanvas.height);
        const data = imageData.data;
        
        // Slight color quantization to improve compression
        const quantizationLevel = Math.floor((1 - quality) * 8) + 1;
        
        for (let i = 0; i < data.length; i += 4) {
            // Quantize RGB values slightly
            data[i] = Math.round(data[i] / quantizationLevel) * quantizationLevel;     // Red
            data[i + 1] = Math.round(data[i + 1] / quantizationLevel) * quantizationLevel; // Green  
            data[i + 2] = Math.round(data[i + 2] / quantizationLevel) * quantizationLevel; // Blue
            // Keep alpha channel intact for transparency
        }
        
        ctx.putImageData(imageData, 0, 0);
    }
    
    return optimizedCanvas;
}


  async exportSpritesheet() {
    if (!this.spritesheet || !this.spritesheet.fullCanvas) {
        this.showError('No spritesheet available for export');
        return;
    }

    try {
        if (this.exportBtn) {
            this.exportBtn.disabled = true;
            this.exportBtn.textContent = 'Preparing Export...';
        }
        
        if (this.exportStatus) {
            this.exportStatus.classList.remove('hidden', 'success', 'error');
            const statusText = this.exportStatus.querySelector('.status-text');
            if (statusText) {
                statusText.textContent = 'Optimizing and compressing...';
            }
        }

        const canvas = this.spritesheet.fullCanvas;
        const settings = this.getCurrentSettings();
        const quality = settings.compressionQuality / 100; // Convert to 0-1 range
        const format = settings.exportFormat;
        
        // Determine MIME type and file extension
        let mimeType, fileExtension;
        switch (format) {
            case 'webp':
                mimeType = 'image/webp';
                fileExtension = 'webp';
                break;
            case 'jpeg':
                mimeType = 'image/jpeg';
                fileExtension = 'jpg';
                break;
            default:
                mimeType = 'image/png';
                fileExtension = 'png';
                break;
        }

        const filename = `${settings.filename}.${fileExtension}`;

        // For better PNG compression, we can create an optimized canvas
        let exportCanvas = canvas;
        if (format === 'png' && quality < 0.95) {
            exportCanvas = this.optimizePngCanvas(canvas, quality);
        }

        // Use canvas.toBlob with quality parameter for compression
        exportCanvas.toBlob((blob) => {
            if (!blob) {
                this.showExportError(`Failed to generate ${format.toUpperCase()} file`);
                return;
            }

            try {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Clean up
                setTimeout(() => URL.revokeObjectURL(url), 1000);
                
                // Show file size info
                const fileSizeMB = (blob.size / (1024 * 1024)).toFixed(2);
                const compressionRatio = Math.round((1 - blob.size / (canvas.width * canvas.height * 4)) * 100);
                
                this.showExportSuccess(`Successfully exported ${filename} (${fileSizeMB}MB, ${compressionRatio}% smaller)`);
                this.showSuccess(`Spritesheet exported as ${filename}!`);
            } catch (error) {
                console.error('Export error:', error);
                this.showExportError('Failed to download file');
            }
        }, mimeType, quality);

    } catch (error) {
        console.error('Export preparation error:', error);
        this.showExportError('Failed to prepare export');
    }
}


    showExportSuccess(message) {
        if (this.exportBtn) {
            this.exportBtn.disabled = false;
            this.exportBtn.textContent = 'Export PNG (Full Resolution)';
        }
        
        if (this.exportStatus) {
            this.exportStatus.classList.add('success');
            const statusText = this.exportStatus.querySelector('.status-text');
            if (statusText) {
                statusText.textContent = message;
            }
        }
        
        setTimeout(() => {
            if (this.exportStatus) {
                this.exportStatus.classList.add('hidden');
            }
        }, 3000);
    }

    showExportError(message) {
        if (this.exportBtn) {
            this.exportBtn.disabled = false;
            this.exportBtn.textContent = 'Export PNG (Full Resolution)';
        }
        
        if (this.exportStatus) {
            this.exportStatus.classList.add('error');
            const statusText = this.exportStatus.querySelector('.status-text');
            if (statusText) {
                statusText.textContent = message;
            }
        }
        
        setTimeout(() => {
            if (this.exportStatus) {
                this.exportStatus.classList.add('hidden');
            }
        }, 5000);
    }

    showGenerationProgress() {
        if (this.generateBtn) {
            this.generateBtn.classList.add('hidden');
        }
        if (this.cancelBtn) {
            this.cancelBtn.classList.remove('hidden');
        }
        if (this.progressContainer) {
            this.progressContainer.classList.remove('hidden');
        }
        this.updateProgress(0, 'Starting generation...');
    }

    hideGenerationProgress() {
        if (this.generateBtn) {
            this.generateBtn.classList.remove('hidden');
        }
        if (this.cancelBtn) {
            this.cancelBtn.classList.add('hidden');
        }
        if (this.progressContainer) {
            this.progressContainer.classList.add('hidden');
        }
    }

    updateProgress(percent, text) {
        const clampedPercent = Math.max(0, Math.min(100, percent));
        
        if (this.progressFill) {
            this.progressFill.style.width = `${clampedPercent}%`;
        }
        
        if (this.progressText) {
            this.progressText.textContent = `${Math.round(clampedPercent)}%`;
        }
        
        if (text && this.progressContainer) {
            const progressInfo = this.progressContainer.querySelector('.progress-info span:first-child');
            if (progressInfo) {
                progressInfo.textContent = text;
            }
        }
    }

    cancelOperation() {
        this.cancelGeneration = true;
        this.hideGenerationProgress();
        this.isGenerating = false;
        this.showWarning('Generation cancelled');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showWarning(message) {
        this.showMessage(message, 'warning');
    }

    showMessage(message, type) {
        // Remove existing messages
        const existing = document.querySelectorAll('.status-message');
        existing.forEach(msg => msg.remove());

        const messageEl = document.createElement('div');
        messageEl.className = `status-message status-message--${type}`;
        messageEl.textContent = message;

        // Insert after the header
        const header = document.querySelector('.header');
        if (header) {
            header.insertAdjacentElement('afterend', messageEl);
        }

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.remove();
            }
        }, 5000);
    }
}

window.SpritesheetGenerator = SpritesheetGenerator;
