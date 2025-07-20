# Microphone Troubleshooting Guide

If your microphone is not picking up audio, follow these steps to diagnose and fix the issue:

## 🔍 Quick Diagnostic Steps

### 1. Check Browser Console
1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Look for any error messages or debug logs
4. The application now includes detailed console logging

### 2. Test Microphone Permissions
1. Click the "Test Microphone" button
2. Check if you see a success or error message
3. Look at the console for detailed information

### 3. Check Device Selection
1. Make sure you've selected an input device from the dropdown
2. If no devices appear, click "Refresh Devices"
3. Try selecting different devices

## 🛠️ Common Solutions

### Browser Issues
- **Chrome/Edge**: Make sure you're using HTTPS or localhost
- **Firefox**: Check if microphone permissions are granted
- **Safari**: May require explicit user interaction

### Permission Issues
1. **Check site permissions**:
   - Chrome: Click the lock icon in the address bar
   - Firefox: Click the shield icon
   - Safari: Safari > Preferences > Websites > Microphone

2. **Reset permissions**:
   - Clear browser data for the site
   - Reload the page
   - Allow microphone access when prompted

### Device Issues
1. **Check system microphone**:
   - Test microphone in system settings
   - Make sure it's not muted
   - Check if other apps can use the microphone

2. **Bluetooth devices**:
   - Ensure device is connected and paired
   - Check if device appears in system audio settings
   - Try disconnecting and reconnecting

### Audio Settings
1. **System volume**: Make sure system volume is not muted
2. **Application volume**: Check if the app is muted
3. **Input volume**: Adjust the input volume slider in the app

## 🔧 Advanced Debugging

### Console Commands
Open the browser console and run these commands:

```javascript
// Test basic microphone access
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => console.log('Microphone works:', stream))
  .catch(err => console.error('Microphone error:', err));

// List all audio devices
navigator.mediaDevices.enumerateDevices()
  .then(devices => {
    const audioInputs = devices.filter(d => d.kind === 'audioinput');
    console.log('Available microphones:', audioInputs);
  });

// Check if Web Audio API is supported
console.log('AudioContext supported:', !!window.AudioContext);
```

### Browser-Specific Issues

#### Chrome/Edge
- **Autoplay policy**: Click the "Start Loopback" button to begin
- **HTTPS requirement**: Use localhost or HTTPS
- **Permission blocking**: Check chrome://settings/content/microphone

#### Firefox
- **Permission prompt**: May need to manually allow microphone
- **Security settings**: Check about:config for media permissions

#### Safari
- **User interaction**: Requires clicking a button to start audio
- **Permission settings**: Safari > Preferences > Websites > Microphone

#### Mobile Browsers
- **iOS Safari**: Limited Web Audio API support
- **Android Chrome**: Usually works well with proper permissions

## 📱 Mobile-Specific Issues

### iOS
- **Safari limitations**: Web Audio API has restrictions
- **Permission prompts**: May need to tap multiple times
- **Background audio**: May stop when app is backgrounded

### Android
- **Chrome mobile**: Generally works well
- **Permission handling**: May need to grant permissions in settings
- **Bluetooth devices**: Check device compatibility

## 🚨 Error Messages and Solutions

### "Permission denied"
- Grant microphone permissions in browser
- Check system microphone settings
- Try refreshing the page

### "No devices found"
- Connect a microphone or headset
- Check if device is recognized by system
- Try refreshing the device list

### "Audio not working"
- Check if microphone is being used by other apps
- Ensure browser supports Web Audio API
- Try a different browser

### "Visualization not showing"
- Make sure audio is actually playing
- Check if microphone is muted
- Verify input volume is not zero

## 🔄 Reset and Retry

1. **Clear browser data** for the site
2. **Restart the browser**
3. **Check system audio settings**
4. **Try a different browser**
5. **Test with a different microphone**

## 📞 Still Having Issues?

If the problem persists:

1. **Check the console logs** for specific error messages
2. **Try the test microphone button** and note the results
3. **Test with a different device** (phone, tablet, different computer)
4. **Verify browser compatibility** (Chrome 66+, Firefox 60+, Safari 11+)

## 🎯 Quick Fix Checklist

- [ ] Browser supports Web Audio API
- [ ] Microphone permissions granted
- [ ] Device selected in dropdown
- [ ] Volume sliders not at zero
- [ ] Microphone not muted in system
- [ ] No other apps using microphone
- [ ] Using HTTPS or localhost
- [ ] Clicked "Start Loopback" button
- [ ] Checked console for errors
- [ ] Tested with "Test Microphone" button 