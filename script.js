class AudioLoopbackController {
    constructor() {
        this.audioContext = null;
        this.mediaStream = null;
        this.audioSource = null;
        this.audioDestination = null;
        this.gainNode = null;
        this.analyser = null;
        this.isRunning = false;
        this.isMuted = false;
        this.selectedInputDevice = null;
        this.selectedOutputDevice = null;
        this.visualizationData = null;
        
        this.initializeElements();
        this.bindEvents();
        this.initializeAudioContext();
        this.loadDevices();
    }

    initializeElements() {
        // Device selection elements
        this.inputDeviceSelect = document.getElementById('inputDevice');
        this.outputDeviceSelect = document.getElementById('outputDevice');
        this.refreshDevicesBtn = document.getElementById('refreshDevices');
        
        // Control elements
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.muteBtn = document.getElementById('muteBtn');
        this.inputVolumeSlider = document.getElementById('inputVolume');
        this.outputVolumeSlider = document.getElementById('outputVolume');
        this.inputVolumeValue = document.getElementById('inputVolumeValue');
        this.outputVolumeValue = document.getElementById('outputVolumeValue');
        
        // Status elements
        this.connectionStatus = document.getElementById('connectionStatus');
        this.audioStatus = document.getElementById('audioStatus');
        this.muteStatus = document.getElementById('muteStatus');
        this.connectionText = document.getElementById('connectionText');
        this.audioText = document.getElementById('audioText');
        this.muteText = document.getElementById('muteText');
        
        // Device info elements
        this.inputDeviceInfo = document.getElementById('inputDeviceInfo');
        this.outputDeviceInfo = document.getElementById('outputDeviceInfo');
        
        // Visualization
        this.visualizerCanvas = document.getElementById('audioVisualizer');
        this.visualizerCtx = this.visualizerCanvas.getContext('2d');
    }

    bindEvents() {
        // Device selection events
        this.inputDeviceSelect.addEventListener('change', (e) => this.onInputDeviceChange(e));
        this.outputDeviceSelect.addEventListener('change', (e) => this.onOutputDeviceChange(e));
        this.refreshDevicesBtn.addEventListener('click', () => this.loadDevices());
        
        // Test microphone button
        const testMicrophoneBtn = document.getElementById('testMicrophone');
        if (testMicrophoneBtn) {
            testMicrophoneBtn.addEventListener('click', () => this.testMicrophone());
        }
        
        // Diagnose devices button
        const diagnoseDevicesBtn = document.getElementById('diagnoseDevices');
        if (diagnoseDevicesBtn) {
            diagnoseDevicesBtn.addEventListener('click', () => this.diagnoseDevices());
        }
        
        // Control events
        this.startBtn.addEventListener('click', () => this.startAudio());
        this.stopBtn.addEventListener('click', () => this.stopAudio());
        this.muteBtn.addEventListener('click', () => this.toggleMute());
        this.inputVolumeSlider.addEventListener('input', (e) => this.onInputVolumeChange(e));
        this.outputVolumeSlider.addEventListener('input', (e) => this.onOutputVolumeChange(e));
        
        // Handle device changes
        navigator.mediaDevices.addEventListener('devicechange', () => {
            this.showNotification('Device list updated', 'info');
            this.loadDevices();
        });
    }

    async initializeAudioContext() {
        try {
            // Request microphone permission first
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop()); // Stop the test stream
            
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.showNotification('Audio system initialized', 'success');
            this.updateConnectionStatus(true);
        } catch (error) {
            this.showNotification('Failed to initialize audio: ' + error.message, 'error');
            this.updateConnectionStatus(false);
        }
    }

    async loadDevices() {
        try {
            console.log('Loading devices...');
            
            // First, try to get microphone permission
            console.log('Requesting microphone permission...');
            try {
                const testStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                console.log('✅ Microphone permission granted');
                testStream.getTracks().forEach(track => track.stop());
            } catch (permError) {
                console.error('❌ Microphone permission denied:', permError);
                this.showNotification('Microphone permission denied. Please allow microphone access.', 'error');
            }
            
            const devices = await navigator.mediaDevices.enumerateDevices();
            console.log('All devices:', devices);
            
            // Filter devices by type
            const audioInputs = devices.filter(device => device.kind === 'audioinput');
            const audioOutputs = devices.filter(device => device.kind === 'audiooutput');
            
            console.log('Audio inputs:', audioInputs);
            console.log('Audio outputs:', audioOutputs);
            
            // Check if devices have labels (indicates permission)
            const devicesWithLabels = audioInputs.filter(device => device.label);
            const devicesWithoutLabels = audioInputs.filter(device => !device.label);
            
            console.log('Devices with labels (permission granted):', devicesWithLabels.length);
            console.log('Devices without labels (no permission):', devicesWithoutLabels.length);
            
            if (devicesWithoutLabels.length > 0) {
                console.log('⚠️ Some devices found but no permission to access them');
                this.showNotification('Microphone permission needed. Please allow access when prompted.', 'warning');
            }
            
            this.populateDeviceSelect(this.inputDeviceSelect, audioInputs, 'input');
            this.populateDeviceSelect(this.outputDeviceSelect, audioOutputs, 'output');
            
            this.showNotification(`Found ${audioInputs.length} input and ${audioOutputs.length} output devices`, 'success');
        } catch (error) {
            console.error('Error loading devices:', error);
            this.showNotification('Failed to load devices: ' + error.message, 'error');
        }
    }

    populateDeviceSelect(selectElement, devices, type) {
        // Clear existing options except the first one
        while (selectElement.children.length > 1) {
            selectElement.removeChild(selectElement.lastChild);
        }
        
        if (type === 'output') {
            // For output devices, just show a note about browser limitations
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'System Default (Browser Limited)';
            selectElement.appendChild(option);
            selectElement.disabled = true;
        } else {
            // For input devices, populate normally
            devices.forEach(device => {
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.textContent = device.label || `${type} device ${device.deviceId.slice(0, 8)}`;
                selectElement.appendChild(option);
            });
        }
        
        // Update device info
        this.updateDeviceInfo(type);
    }

    updateDeviceInfo(type) {
        const selectElement = type === 'input' ? this.inputDeviceSelect : this.outputDeviceSelect;
        const infoElement = type === 'input' ? this.inputDeviceInfo : this.outputDeviceInfo;
        
        if (type === 'output') {
            infoElement.textContent = 'Audio plays through system default output';
        } else if (selectElement.value) {
            const selectedOption = selectElement.options[selectElement.selectedIndex];
            infoElement.textContent = selectedOption.textContent;
        } else {
            infoElement.textContent = 'No device selected';
        }
    }

    onInputDeviceChange(event) {
        this.selectedInputDevice = event.target.value;
        this.updateDeviceInfo('input');
        
        // Debug logging
        console.log('Input device changed to:', this.selectedInputDevice);
        
        if (this.isRunning) {
            this.stopAudio();
            this.startAudio();
        }
    }

    onOutputDeviceChange(event) {
        this.selectedOutputDevice = event.target.value;
        this.updateDeviceInfo('output');
        
        if (this.isRunning) {
            this.stopAudio();
            this.startAudio();
        }
    }

    onInputVolumeChange(event) {
        const volume = event.target.value;
        this.inputVolumeValue.textContent = volume + '%';
        
        if (this.gainNode) {
            this.gainNode.gain.value = volume / 100;
        }
    }

    onOutputVolumeChange(event) {
        const volume = event.target.value;
        this.outputVolumeValue.textContent = volume + '%';
        
        // Note: Output volume control is limited by browser security
        // This is more of a UI demonstration
    }



    async startAudio() {
        console.log('Starting audio with device:', this.selectedInputDevice);
        
        try {
            // Stop any existing audio
            this.stopAudio();
            
            // Get media stream with selected device or default
            let constraints;
            if (this.selectedInputDevice) {
                constraints = {
                    audio: {
                        deviceId: { exact: this.selectedInputDevice },
                        echoCancellation: false,
                        noiseSuppression: false,
                        autoGainControl: false
                    }
                };
            } else {
                // Use default device if none selected
                constraints = {
                    audio: {
                        echoCancellation: false,
                        noiseSuppression: false,
                        autoGainControl: false
                    }
                };
                this.showNotification('Using default microphone', 'info');
            }
            
            console.log('Requesting media stream with constraints:', constraints);
            this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log('Media stream obtained:', this.mediaStream);
            
            // Create audio nodes
            this.audioSource = this.audioContext.createMediaStreamSource(this.mediaStream);
            this.gainNode = this.audioContext.createGain();
            this.analyser = this.audioContext.createAnalyser();
            
            // Set up audio processing chain
            this.audioSource.connect(this.gainNode);
            this.gainNode.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
            
            // Set initial volume
            this.gainNode.gain.value = this.inputVolumeSlider.value / 100;
            
            // Configure analyser for visualization
            this.analyser.fftSize = 256;
            this.analyser.smoothingTimeConstant = 0.8;
            
            this.isRunning = true;
            this.updateAudioStatus(true);
            this.startVisualization();
            
            this.startBtn.disabled = true;
            this.stopBtn.disabled = false;
            this.muteBtn.disabled = false;
            
            this.showNotification('Audio loopback started', 'success');
        } catch (error) {
            this.showNotification('Failed to start audio: ' + error.message, 'error');
        }
    }

    stopAudio() {
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }
        
        if (this.audioSource) {
            this.audioSource.disconnect();
            this.audioSource = null;
        }
        
        if (this.gainNode) {
            this.gainNode.disconnect();
            this.gainNode = null;
        }
        
        if (this.analyser) {
            this.analyser.disconnect();
            this.analyser = null;
        }
        
        this.isRunning = false;
        this.updateAudioStatus(false);
        this.stopVisualization();
        
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        this.muteBtn.disabled = true;
        
        this.showNotification('Audio loopback stopped', 'info');
    }

    toggleMute() {
        if (!this.isRunning) return;
        
        this.isMuted = !this.isMuted;
        
        if (this.gainNode) {
            this.gainNode.gain.value = this.isMuted ? 0 : (this.inputVolumeSlider.value / 100);
        }
        
        this.updateMuteStatus(this.isMuted);
        
        if (this.isMuted) {
            this.muteBtn.innerHTML = '<i class="fas fa-microphone"></i> Unmute';
            this.showNotification('Microphone muted', 'warning');
        } else {
            this.muteBtn.innerHTML = '<i class="fas fa-microphone-slash"></i> Mute';
            this.showNotification('Microphone unmuted', 'success');
        }
    }

    startVisualization() {
        if (!this.analyser) return;
        
        const bufferLength = this.analyser.frequencyBinCount;
        this.visualizationData = new Uint8Array(bufferLength);
        
        const draw = () => {
            if (!this.isRunning) return;
            
            requestAnimationFrame(draw);
            this.analyser.getByteFrequencyData(this.visualizationData);
            this.drawVisualization();
        };
        
        draw();
    }

    stopVisualization() {
        this.visualizationData = null;
        this.clearVisualization();
    }

    drawVisualization() {
        if (!this.visualizationData) return;
        
        const canvas = this.visualizerCanvas;
        const ctx = this.visualizerCtx;
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        const barWidth = (width / this.visualizationData.length) * 2.5;
        let barHeight;
        let x = 0;
        
        for (let i = 0; i < this.visualizationData.length; i++) {
            barHeight = (this.visualizationData[i] / 255) * height;
            
            // Create gradient
            const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
            gradient.addColorStop(0, '#667eea');
            gradient.addColorStop(1, '#764ba2');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x, height - barHeight, barWidth, barHeight);
            
            x += barWidth + 1;
        }
    }

    clearVisualization() {
        const canvas = this.visualizerCanvas;
        const ctx = this.visualizerCtx;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    updateConnectionStatus(connected) {
        this.connectionStatus.className = 'status-indicator' + (connected ? ' connected' : '');
        this.connectionText.textContent = connected ? 'Connected' : 'Disconnected';
    }

    updateAudioStatus(active) {
        this.audioStatus.className = 'status-indicator' + (active ? ' active' : '');
        this.audioText.textContent = active ? 'Running' : 'Stopped';
    }

    updateMuteStatus(muted) {
        this.muteStatus.className = 'status-indicator' + (muted ? ' muted' : '');
        this.muteText.textContent = muted ? 'Muted' : 'Unmuted';
    }

    showNotification(message, type = 'info') {
        const notifications = document.getElementById('notifications');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        notifications.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    // Debug function to test microphone
    async testMicrophone() {
        try {
            console.log('Testing microphone...');
            
            // Check if getUserMedia is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('getUserMedia not supported in this browser');
            }
            
            // Check if we're on HTTPS or localhost
            const isSecure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
            console.log('Secure context:', isSecure);
            
            if (!isSecure) {
                console.warn('⚠️ Not on HTTPS or localhost - microphone access may be blocked');
            }
            
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('Microphone test successful:', stream);
            
            // Check if there are audio tracks
            const audioTracks = stream.getAudioTracks();
            console.log('Audio tracks:', audioTracks);
            
            if (audioTracks.length > 0) {
                const track = audioTracks[0];
                console.log('Track settings:', track.getSettings());
                console.log('Track constraints:', track.getConstraints());
                console.log('Track enabled:', track.enabled);
                console.log('Track muted:', track.muted);
                
                // Check if the track is actually receiving audio
                const audioContext = new AudioContext();
                const source = audioContext.createMediaStreamSource(stream);
                const analyser = audioContext.createAnalyser();
                source.connect(analyser);
                
                const dataArray = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(dataArray);
                
                const hasAudio = dataArray.some(value => value > 0);
                console.log('Audio detected:', hasAudio);
                
                audioContext.close();
            }
            
            // Stop the test stream
            stream.getTracks().forEach(track => track.stop());
            
            this.showNotification('Microphone test successful', 'success');
        } catch (error) {
            console.error('Microphone test failed:', error);
            
            let errorMessage = 'Microphone test failed: ' + error.message;
            
            if (error.name === 'NotAllowedError') {
                errorMessage = 'Microphone permission denied. Please allow microphone access.';
            } else if (error.name === 'NotFoundError') {
                errorMessage = 'No microphone found. Please connect a microphone.';
            } else if (error.name === 'NotSupportedError') {
                errorMessage = 'Microphone not supported in this browser.';
            }
            
            this.showNotification(errorMessage, 'error');
        }
    }

    // Comprehensive device diagnostic
    async diagnoseDevices() {
        console.log('🔍 Starting comprehensive device diagnosis...');
        
        // Check browser support
        console.log('Browser support:');
        console.log('- getUserMedia:', !!navigator.mediaDevices?.getUserMedia);
        console.log('- enumerateDevices:', !!navigator.mediaDevices?.enumerateDevices);
        console.log('- AudioContext:', !!window.AudioContext);
        
        // Check security context
        const isSecure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
        console.log('Secure context:', isSecure);
        
        // List all devices
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            console.log('All devices found:', devices.length);
            
            const audioInputs = devices.filter(d => d.kind === 'audioinput');
            const audioOutputs = devices.filter(d => d.kind === 'audiooutput');
            const videoInputs = devices.filter(d => d.kind === 'videoinput');
            
            console.log('Audio inputs:', audioInputs.length);
            console.log('Audio outputs:', audioOutputs.length);
            console.log('Video inputs:', videoInputs.length);
            
            if (audioInputs.length === 0) {
                console.log('❌ NO MICROPHONES DETECTED');
                console.log('This means your system has no microphone connected or enabled.');
                this.showNotification('No microphones detected. Please connect a microphone or enable built-in microphone.', 'error');
            } else {
                console.log('✅ Microphones found:');
                audioInputs.forEach((device, index) => {
                    console.log(`  ${index + 1}. ${device.label || 'Unknown device'} (${device.deviceId.slice(0, 8)}...)`);
                });
            }
            
            if (audioOutputs.length === 0) {
                console.log('⚠️ No audio outputs detected');
            } else {
                console.log('✅ Audio outputs found:', audioOutputs.length);
            }
            
        } catch (error) {
            console.error('Error enumerating devices:', error);
        }
        
        // Try to get microphone access
        try {
            console.log('Testing microphone access...');
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('✅ Microphone access successful!');
            stream.getTracks().forEach(track => track.stop());
        } catch (error) {
            console.error('❌ Microphone access failed:', error.name, error.message);
            
            if (error.name === 'NotFoundError') {
                console.log('💡 SOLUTION: Connect a microphone to your device');
                this.showNotification('No microphone found. Please connect a microphone or headset.', 'error');
            } else if (error.name === 'NotAllowedError') {
                console.log('💡 SOLUTION: Allow microphone permissions in browser');
                this.showNotification('Microphone permission denied. Please allow access.', 'error');
            }
        }
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Check for Web Audio API support
    if (!window.AudioContext && !window.webkitAudioContext) {
        alert('Your browser does not support the Web Audio API. Please use a modern browser.');
        return;
    }
    
    // Check for getUserMedia support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Your browser does not support audio input. Please use a modern browser.');
        return;
    }
    
    // Initialize the audio controller
    window.audioController = new AudioLoopbackController();
});

// Handle page visibility changes to pause/resume audio
document.addEventListener('visibilitychange', () => {
    if (window.audioController && window.audioController.isRunning) {
        if (document.hidden) {
            // Page is hidden, could pause audio here if needed
        } else {
            // Page is visible again
        }
    }
});

// Handle beforeunload to clean up audio
window.addEventListener('beforeunload', () => {
    if (window.audioController) {
        window.audioController.stopAudio();
    }
}); 