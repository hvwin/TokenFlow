/**
 * Bridge Runtime 简单验证脚本（纯 JS 版本）
 * 
 * 运行方式：node scripts/verify-bridge-simple.js
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

console.log('=== Bridge Runtime 基础验证 ===\n');

// 验证文件存在性
console.log('1. 验证 Bridge 文件');
const filesToCheck = [
  'adapters/generic-ide/bridge.ts',
  'adapters/generic-ide/contracts.ts',
  'adapters/generic-ide/bridge.manifest.json',
  'adapters/generic-ide/README.md',
  'adapters/codex-teams/bridge.ts',
  'adapters/codex-teams/contracts.ts',
  'adapters/codex-teams/bridge.manifest.json',
  'adapters/codex-teams/README.md',
];

let allFilesExist = true;
for (const file of filesToCheck) {
  const fullPath = path.join(projectRoot, file);
  const exists = fs.existsSync(fullPath);
  console.log(`   ${exists ? '✓' : '✗'} ${file}`);
  if (!exists) allFilesExist = false;
}

if (allFilesExist) {
  console.log('\n   ✓ 所有必要文件已创建');
} else {
  console.log('\n   ✗ 部分文件缺失');
}

console.log();

// 验证 Truth Refs
console.log('2. 验证 Truth Refs');
const truthRefs = [
  'core/capability-graph.json',
  'manifests/tooling-manifest.json',
  'manifests/adapter-matrix.json',
  'manifests/rendering-conventions.json',
];

let allTruthExists = true;
for (const ref of truthRefs) {
  const fullPath = path.join(projectRoot, ref);
  const exists = fs.existsSync(fullPath);
  console.log(`   ${exists ? '✓' : '✗'} ${ref}`);
  if (!exists) allTruthExists = false;
}

if (allTruthExists) {
  console.log('\n   ✓ 所有 Truth Refs 可用');
} else {
  console.log('\n   ⚠ 部分 Truth Refs 缺失（可能影响运行时）');
}

console.log();

// 验证 Bridge Manifest 结构
console.log('3. 验证 Bridge Manifest 结构');
try {
  const genericManifest = JSON.parse(
    fs.readFileSync(path.join(projectRoot, 'adapters/generic-ide/bridge.manifest.json'), 'utf-8')
  );
  console.log('   ✓ generic-ide manifest 解析成功');
  console.log(`     - Bridge ID: ${genericManifest.bridgeId}`);
  console.log(`     - Exports: ${genericManifest.exports.join(', ')}`);

  const codexManifest = JSON.parse(
    fs.readFileSync(path.join(projectRoot, 'adapters/codex-teams/bridge.manifest.json'), 'utf-8')
  );
  console.log('   ✓ codex-teams manifest 解析成功');
  console.log(`     - Bridge ID: ${codexManifest.bridgeId}`);
  console.log(`     - Exports: ${codexManifest.exports.join(', ')}`);
} catch (error) {
  console.error('   ✗ Manifest 解析失败:', error.message);
}

console.log();

// 验证 Adapter Matrix
console.log('4. 验证 Adapter Matrix');
try {
  const adapterMatrix = JSON.parse(
    fs.readFileSync(path.join(projectRoot, 'manifests/adapter-matrix.json'), 'utf-8')
  );
  console.log('   ✓ adapter-matrix.json 解析成功');
  console.log(`     - Host Matrix 条目: ${adapterMatrix.hostMatrix.length}`);
  console.log(`     - Family Defaults: ${adapterMatrix.familyDefaults.length}`);
  
  // 显示推荐的 adapter 映射
  console.log('   ✓ Host Capability 映射:');
  for (const entry of adapterMatrix.hostMatrix) {
    console.log(`     - ${entry.hostCapability}: [${entry.recommendedAdapters.join(', ')}]`);
  }
} catch (error) {
  console.error('   ✗ Adapter Matrix 解析失败:', error.message);
}

console.log();

// 检查 Bridge 实现的关键特性
console.log('5. 检查 Bridge 实现特性');
try {
  const genericBridgeContent = fs.readFileSync(
    path.join(projectRoot, 'adapters/generic-ide/bridge.ts'),
    'utf-8'
  );
  
  const features = [
    { name: 'resolveGenericIdeBridge', pattern: /resolveGenericIdeBridge/ },
    { name: 'renderGenericIdePayloads', pattern: /renderGenericIdePayloads/ },
    { name: 'verifyGenericIdeTruth', pattern: /verifyGenericIdeTruth/ },
    { name: 'loadAdapterMatrix', pattern: /loadAdapterMatrix/ },
    { name: 'selectAdapters', pattern: /selectAdapters/ },
    { name: 'determineExecutionSurface', pattern: /determineExecutionSurface/ },
    { name: 'determineFallbackSurface', pattern: /determineFallbackSurface/ },
  ];

  console.log('   generic-ide bridge:');
  for (const feature of features) {
    const exists = feature.pattern.test(genericBridgeContent);
    console.log(`     ${exists ? '✓' : '✗'} ${feature.name}`);
  }

  const codexBridgeContent = fs.readFileSync(
    path.join(projectRoot, 'adapters/codex-teams/bridge.ts'),
    'utf-8'
  );

  const codexFeatures = [
    { name: 'resolveCodexTeamsBridge', pattern: /resolveCodexTeamsBridge/ },
    { name: 'buildCodexTeamsDispatch', pattern: /buildCodexTeamsDispatch/ },
    { name: 'verifyCodexTeamsBridgeInputs', pattern: /verifyCodexTeamsBridgeInputs/ },
    { name: 'readFeatureState', pattern: /readFeatureState/ },
    { name: 'extractFeatureSlugFromContextRefs', pattern: /extractFeatureSlugFromContextRefs/ },
  ];

  console.log('   codex-teams bridge:');
  for (const feature of codexFeatures) {
    const exists = feature.pattern.test(codexBridgeContent);
    console.log(`     ${exists ? '✓' : '✗'} ${feature.name}`);
  }
} catch (error) {
  console.error('   ✗ Bridge 实现检查失败:', error.message);
}

console.log();
console.log('=== 验证完成 ===');
console.log('\n提示：要运行完整的 TypeScript 测试，请先安装依赖并编译项目。');
