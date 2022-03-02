import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import fs from 'fs'
import externalGlobals from "rollup-plugin-external-globals"
// https://vitejs.dev/config/

const FILE_NAME = "main.user.js";
const headerText = fs.readFileSync("./src/header.js").toString()
export default ({mode}) => {
  return defineConfig({
    plugins: [
      vue(),
      externalGlobals({
        vue: "Vue",
      }),
      header(headerText, mode==="dev")
    ],
    build: {
      cssCodeSplit: true,
      minify: false,
      rollupOptions: {
        input: "src/main.js",
        output: {
          format: 'iife',
          file: `dist/${FILE_NAME}`,
          dir: null,
         },
      },
      watch: mode === "dev"
    }
  })
}

function header(text, dev=true) {
  return {
    name: "vite-plugin-header",
    generateBundle(OutputOptions, ChunkInfo) {
      let filename =  String(OutputOptions.file).replace("dist/", "");
      let newCode = text + "\n" + ChunkInfo[filename].code;
      ChunkInfo[filename].code = newCode;
      if (dev) {
        let index = String(text).lastIndexOf("\n");
        let newText = text.slice(0, index) + `// @require file:///${path.join(__dirname, "/dist/" + FILE_NAME)}` + text.slice(index);
        if (!fs.existsSync("dist")) {
          fs.mkdirSync("dist");
        }
        fs.writeFileSync(path.join(__dirname, "/dist/" + FILE_NAME.replace(".js", ".dev.js")), newText);
      }
    }
  }
}