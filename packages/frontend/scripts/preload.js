const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('desktop', {
  min: () => ipcRenderer.send('window', 'min'),
  max: () => ipcRenderer.send('window', 'max')
})
