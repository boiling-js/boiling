import { spawn } from 'child_process'

export const doCommand = (cmd: string, args: readonly string[], options?: Parameters<typeof spawn>[2]) => new Promise<number | null>(resolve => {
  if (process.platform === 'win32') {
    cmd += '.cmd'
  }
  const execCmd = spawn(cmd, args, Object.assign({}, { encoding: 'utf-8' }, options))
  execCmd.stdout?.pipe(process.stdout)
  execCmd.stderr?.pipe(process.stderr)
  execCmd.on('exit', resolve)
})
