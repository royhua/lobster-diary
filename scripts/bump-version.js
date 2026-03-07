#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

// 读取 package.json
const pkgPath = path.join(rootDir, 'package.json')
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))

// 解析版本号
const [major, minor, patch] = pkg.version.split('.').map(Number)

// 升级补丁版本
const newVersion = `${major}.${minor}.${patch + 1}`
pkg.version = newVersion

// 写回 package.json
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')

// 更新 VersionTag.vue
const versionTagPath = path.join(rootDir, 'src/components/VersionTag.vue')
if (fs.existsSync(versionTagPath)) {
  let versionTag = fs.readFileSync(versionTagPath, 'utf8')
  versionTag = versionTag.replace(
    /const version = '[\d.]+'/,
    `const version = '${newVersion}'`
  )
  fs.writeFileSync(versionTagPath, versionTag)
}

console.log(`✅ Version bumped: ${pkg.version} → ${newVersion}`)
console.log(`📦 Package: ${pkg.name}`)
console.log(`🔗 ${pkg.homepage}`)
