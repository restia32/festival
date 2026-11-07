import { copyFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { defineConfig } from 'vite'

const brochurePath = 'assets/picture/cultural dance/Batirangal Trifold Brochure FINAL.pdf'
let outputDirectory

export default defineConfig({
  plugins: [
    {
      name: 'copy-batirangal-brochure',
      apply: 'build',
      configResolved(config) {
        outputDirectory = config.build.outDir
      },
      async closeBundle() {
        const destination = resolve(outputDirectory, brochurePath)
        await mkdir(dirname(destination), { recursive: true })
        await copyFile(resolve(brochurePath), destination)
      },
    },
  ],
})
