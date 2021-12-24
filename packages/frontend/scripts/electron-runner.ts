import { app, BrowserWindow } from 'electron'
import { createServer } from 'vite'
import * as path from 'path'

async function createWindow() {
  const viteServer = await createServer({
    configFile: path.join(__dirname, '../vite.config.ts')
  })
  const mainWindow = new BrowserWindow({
    icon: path.join(__dirname, '../../../public/favicon.ico'),
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600
  })
  await viteServer.listen()
  await mainWindow.loadURL(`http://localhost:${
    viteServer.config.server.port
  }`)
  mainWindow.webContents.openDevTools({
    mode: 'detach'
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
