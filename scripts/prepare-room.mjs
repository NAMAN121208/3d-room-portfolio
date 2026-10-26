import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune } from '@gltf-transform/functions';
import fs from 'fs';
import path from 'path';

/**
 * scripts/prepare-room.mjs
 *
 * Phase 8 Part A: Room Model Preparation
 * - Reads original uncompressed room model from assets/source/room-original.glb
 * - Deletes unwanted decorative clutter, bottles, drinking glasses, wall pictures, and slippers
 * - Creates empty identity group nodes named 'Monitor', 'Laptop', and 'Bookshelf' under GLTF_SceneRootNode
 * - Moves target interactive meshes into their designated groups
 * - Runs prune() to drop orphaned meshes, materials, and textures
 * - Writes clean output to public/models/room.glb
 */

async function prepareRoom() {
  const inputPath = path.resolve('assets/source/room-original.glb');
  const outputPath = path.resolve('public/models/room.glb');

  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file not found at: ${inputPath}`);
  }

  const statBefore = fs.statSync(inputPath);
  console.log(`[Phase 8A] Reading ${inputPath} (${(statBefore.size / 1024 / 1024).toFixed(2)} MB)...`);

  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  const doc = await io.read(inputPath);
  const root = doc.getRoot();

  const statsBefore = {
    nodes: root.listNodes().length,
    meshes: root.listMeshes().length,
    materials: root.listMaterials().length,
    textures: root.listTextures().length,
    fileSize: statBefore.size
  };

  const sceneRoot = root.listNodes().find(n => n.getName() === 'GLTF_SceneRootNode');
  if (!sceneRoot) {
    throw new Error('GLTF_SceneRootNode not found in glTF document');
  }

  // 1. DELETE LIST
  const nodesToDelete = [
    // Wall pictures
    'Plane.010_86', 'Plane.014_89', 'Plane.015_90', 'Plane.016_91',
    // Slippers
    'Plane.011_34',
    // Bottles
    'Cylinder.009_69', 'Cylinder.013_73', 'Cylinder.037_83', 'Cylinder.016_76', 'Cylinder.017_77', 'Cylinder.019_79', 'Cylinder.018_78',
    // Drinking glasses
    'Cylinder.011_71', 'Cylinder.014_74', 'Cylinder.015_75', 'Cylinder.020_80', 'Cylinder.034_81', 'Cylinder.035_82',
    // Small loose clutter
    'Cylinder.008_68', 'Cylinder.010_70', 'Cylinder.012_72', 'Cylinder.021_33', 'Cylinder.036_46'
  ];

  function disposeRecursive(node) {
    for (const child of node.listChildren()) {
      disposeRecursive(child);
    }
    node.dispose();
  }

  let deletedCount = 0;
  for (const name of nodesToDelete) {
    const node = sceneRoot.listChildren().find(n => n.getName() === name);
    if (node) {
      sceneRoot.removeChild(node);
      disposeRecursive(node);
      deletedCount++;
    } else {
      console.warn(`[Warning] Node marked for deletion not found: ${name}`);
    }
  }
  console.log(`Deleted ${deletedCount} clutter/bottle/picture nodes.`);

  // 2. NAME / GROUP MAPPING
  function createGroup(groupName, memberNames) {
    const group = doc.createNode(groupName);
    group.setTranslation([0, 0, 0]);
    group.setRotation([0, 0, 0, 1]);
    group.setScale([1, 1, 1]);
    sceneRoot.addChild(group);

    for (const memberName of memberNames) {
      const node = sceneRoot.listChildren().find(n => n.getName() === memberName);
      if (node) {
        sceneRoot.removeChild(node);
        group.addChild(node);
      } else {
        console.warn(`[Warning] Group member node not found: ${memberName} for ${groupName}`);
      }
    }
    return group;
  }

  createGroup('Monitor', ['Cube.005_5']);
  createGroup('Laptop', ['Cube.006_6']);
  createGroup('Bookshelf', ['Plane.002_106', 'Plane.003_107', 'Cube.038_52', 'Cube.022_54']);
  console.log(`Created named groups: Monitor, Laptop, Bookshelf.`);

  // 3. PRUNE orphaned assets
  console.log('Running prune transform...');
  await doc.transform(prune());

  // 4. WRITE output
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  await io.write(outputPath, doc);

  const statAfter = fs.statSync(outputPath);
  const statsAfter = {
    nodes: root.listNodes().length,
    meshes: root.listMeshes().length,
    materials: root.listMaterials().length,
    textures: root.listTextures().length,
    fileSize: statAfter.size
  };

  const topLevelNodeNames = sceneRoot.listChildren().map(c => c.getName());

  console.log('\n========================================');
  console.log('PHASE 8A MODEL PREPARATION REPORT');
  console.log('========================================');
  console.log(`Nodes:     ${statsBefore.nodes} -> ${statsAfter.nodes} (Δ ${statsAfter.nodes - statsBefore.nodes})`);
  console.log(`Meshes:    ${statsBefore.meshes} -> ${statsAfter.meshes} (Δ ${statsAfter.meshes - statsBefore.meshes})`);
  console.log(`Materials: ${statsBefore.materials} -> ${statsAfter.materials} (Δ ${statsAfter.materials - statsBefore.materials})`);
  console.log(`Textures:  ${statsBefore.textures} -> ${statsAfter.textures} (Δ ${statsAfter.textures - statsBefore.textures})`);
  console.log(`File Size: ${(statsBefore.fileSize / 1024 / 1024).toFixed(3)} MB (${statsBefore.fileSize} B) -> ${(statsAfter.fileSize / 1024 / 1024).toFixed(3)} MB (${statsAfter.fileSize} B) (Saved ${((1 - statsAfter.fileSize / statsBefore.fileSize) * 100).toFixed(1)}%)`);
  console.log(`\nTop-level nodes in GLTF_SceneRootNode (${topLevelNodeNames.length}):`);
  console.log(topLevelNodeNames.join(', '));
  console.log('========================================\n');

  return { statsBefore, statsAfter, topLevelNodeNames };
}

prepareRoom().catch((err) => {
  console.error('[Error] Model preparation failed:', err);
  process.exit(1);
});
