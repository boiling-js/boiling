import { app, ipcMain, BrowserWindow } from 'electron'
import * as path from 'path'

async function createWindow() {
  const mainWindow = new BrowserWindow({
    icon: path.join(__dirname, '../../../public/favicon.ico'),
    width: 1200,
    height: 800,
    minWidth: 940,
    minHeight: 500,
    transparent: true,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  if (!process.env.VITE_PORT) {
    throw new Error('Not configured VITE_PORT.')
  }
  await mainWindow.loadURL(`http://127.0.0.1:${process.env.VITE_PORT}`)
  mainWindow.webContents.openDevTools({
    mode: 'detach'
  })
  ipcMain.on('window', (e, ...args) => {
    const [ action ] = args
    switch (action) {
      case 'min':
        mainWindow.minimize()
        break
      case 'max':
        mainWindow.maximize()
        break
    }
  })
}
async function main() {
  await app.whenReady()
  await createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
      app.quit()
  })
}
main().catch(() => {
  console.error('Failed to start the application.')
  process.exit(1)
})
