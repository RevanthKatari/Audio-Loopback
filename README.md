# Audio Loopback Controller

A modern, responsive web application that allows users to connect audio devices, select input/output devices, and perform real-time audio loopback with full control over audio settings.

## Features

### 🎧 Device Management
- **Connect wireless earphones** and Bluetooth devices
- **Select any available microphone** (built-in or connected devices)
- **Choose output destination** (speakers, headphones, or other audio devices)
- **Real-time device detection** and switching

### 🎛️ Audio Controls
- **Start/Stop loopback** with one click
- **Mute/Unmute microphone** instantly
- **Volume control** for both input and output
- **Real-time audio visualization** with frequency spectrum display

### 📱 Responsive Design
- **Mobile-friendly** interface that works on all screen sizes
- **Touch-optimized** controls for mobile devices
- **Modern UI** with beautiful gradients and animations
- **Dark mode support** for better viewing experience

### 🔧 Advanced Features
- **Status indicators** showing connection, audio, and mute states
- **Device information** display for selected input/output
- **Notification system** for user feedback
- **Automatic device refresh** when new devices are connected

## How to Use

### 1. Getting Started
1. Open `index.html` in a modern web browser (Chrome, Firefox, Safari, Edge)
2. Allow microphone permissions when prompted
3. The application will automatically detect available audio devices

### 2. Device Selection
- **Input Device**: Choose your microphone (built-in or connected)
- **Output Device**: Select where audio should play back
- Click "Refresh Devices" to update the device list

### 3. Audio Controls
- **Start Loopback**: Begin real-time audio monitoring
- **Stop Loopback**: End audio processing
- **Mute/Unmute**: Toggle microphone input
- **Volume Sliders**: Adjust input and output levels

### 4. Status Monitoring
- **Connection Status**: Shows if audio system is ready
- **Audio Status**: Indicates if loopback is running
- **Microphone Status**: Shows mute/unmute state
- **Visualization**: Real-time audio level display

## Technical Details

### Browser Requirements
- **Web Audio API** support
- **getUserMedia** API support
- **HTTPS** required for device access (or localhost)

### Supported Devices
- **Input Devices**: Microphones, headsets, Bluetooth mics
- **Output Devices**: System default (use system settings to change)
- **Mobile Devices**: Works on iOS Safari and Android Chrome

### Browser Limitations
- **Input Device Selection**: ✅ Fully supported - can select any microphone
- **Output Device Selection**: ❌ Not supported - audio plays through system default
- **Volume Control**: ✅ Input volume control, system output volume control

### Audio Processing
- **Real-time loopback** with minimal latency
- **Volume control** with gain nodes
- **Frequency analysis** for visualization
- **Echo cancellation** disabled for clean audio

## File Structure

```
├── index.html          # Main HTML file
├── styles.css          # CSS styling and responsive design
├── script.js           # JavaScript audio processing logic
└── README.md          # This documentation
```

## Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 66+ | ✅ Full Support |
| Firefox | 60+ | ✅ Full Support |
| Safari | 11+ | ✅ Full Support |
| Edge | 79+ | ✅ Full Support |
| Mobile Safari | 11+ | ✅ Full Support |
| Chrome Mobile | 66+ | ✅ Full Support |

## Troubleshooting

### Common Issues

1. **"No devices found"**
   - Ensure microphone permissions are granted
   - Check if devices are properly connected
   - Try refreshing the device list

2. **"Audio not working"**
   - Verify browser supports Web Audio API
   - Check if microphone is not being used by other applications
   - Ensure HTTPS is enabled (required for device access)

3. **"Can't select output device"**
   - Browser limitations may prevent output device selection
   - Audio will play through default system output
   - Use system volume controls for output adjustment

4. **"Visualization not showing"**
   - Check if audio is actually playing
   - Ensure microphone is not muted
   - Try refreshing the page

### Mobile-Specific Notes

- **iOS Safari**: May require user interaction to start audio
- **Android Chrome**: Works well with most Bluetooth devices
- **Touch Controls**: All buttons are optimized for touch input
- **Responsive Layout**: Automatically adapts to screen size

## Development

### Local Development
1. Clone or download the files
2. Open `index.html` in a web browser
3. For HTTPS testing, use a local server:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js
   npx http-server
   ```

### Customization
- **Colors**: Modify CSS variables in `styles.css`
- **Audio Settings**: Adjust parameters in `script.js`
- **UI Layout**: Edit HTML structure in `index.html`

## Security Notes

- **HTTPS Required**: Device access requires secure context
- **Permissions**: Microphone access must be granted
- **Local Only**: No data is sent to external servers
- **Privacy**: Audio processing happens entirely in the browser

## License

This project is open source and available under the MIT License.

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve the application.

---

**Note**: This application requires user interaction to start audio processing due to browser autoplay policies. Click the "Start Loopback" button to begin audio monitoring. 