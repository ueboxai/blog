# Before You Import a Source Asset into Unreal Engine

_An evidence-based preflight checklist · Unreal Box Team · July 15, 2026_

Importing is easy. Recovering the reason behind an import six months later is not.

A source mesh can be technically valid and still create expensive ambiguity: the wrong scale, an unexplained destination, duplicate materials, missing collision, a broken reimport path, or a name that no longer tells the team what the asset is.

This checklist is deliberately small. Use it before importing a source asset into a shared Unreal Engine project, then keep the completed record beside the asset or in your team's issue system.

## 1. Record the source before touching the file

Capture:

- source path or download URL;
- creator or vendor;
- license and proof of purchase where applicable;
- person responsible for the import;
- target project and engine version;
- whether the source is authoritative, temporary, or a backup.

Do not use a renamed file in a download folder as the only record of provenance. If the asset is client-owned or proprietary, keep its details inside the approved project system rather than a public tracker.

## 2. Confirm export assumptions

For a static mesh, verify scale, orientation, pivot, normals, UVs, material slots, and the exact objects being exported.

Epic's current static-mesh documentation notes that one Unreal Unit represents one centimeter and recommends checking supported formats before import. Its FBX pipeline documentation also identifies FBX 2020.2 as the pipeline version; exporting with a different version can introduce incompatibilities.

- [Importing Static Meshes](https://dev.epicgames.com/documentation/unreal-engine/importing-static-meshes-in-unreal-engine?lang=en-US)
- [FBX Static Mesh Pipeline](https://dev.epicgames.com/documentation/en-us/unreal-engine/fbx-static-mesh-pipeline-in-unreal-engine)

Write the export preset or DCC settings into the record. “Default export” is not a reproducible instruction.

## 3. Choose the destination and Unreal name first

The current Content Browser location determines where an imported FBX asset is created. Decide the destination before opening the importer.

Epic recommends establishing an asset naming convention early and documents this general shape:

```text
[AssetTypePrefix]_[AssetName]_[Descriptor]_[OptionalVariantLetterOrNumber]
```

Examples include `SM_` for Static Mesh, `SK_` for Skeletal Mesh, `M_` for Material, `MI_` for Material Instance, `T_` for Texture, and `BP_` for Blueprint. Treat those prefixes as a starting point: your project's documented convention remains authoritative.

- [Recommended Asset Naming Conventions](https://dev.epicgames.com/documentation/en-us/unreal-engine/recommended-asset-naming-conventions-in-unreal-engine-projects)

Preflight fields:

```text
Destination: /Game/...
Proposed name: ...
Existing asset with same name: yes / no
Project naming rule checked: yes / no
```

## 4. Decide what should happen to collision

Do not leave collision as an accidental importer default.

Choose one:

- no collision is required;
- Unreal should generate simple collision;
- custom collision is supplied with the source;
- collision will be authored and reviewed in the Static Mesh Editor;
- the asset needs a project-specific collision preset after import.

Epic's FBX import reference exposes `Auto Generate Collision`, while its collision guide shows how collision affects blocking, overlaps, physics, and per-asset presets.

- [FBX Import Options Reference](https://dev.epicgames.com/documentation/en-us/unreal-engine/fbx-import-options-reference-in-unreal-engine)
- [Setting Up Collisions With Static Meshes](https://dev.epicgames.com/documentation/en-us/unreal-engine/setting-up-collisions-with-static-meshes-in-unreal-engine)

The preflight does not decide the right collision for every asset. It makes the decision visible before the asset spreads through a level.

## 5. Write down material and texture expectations

Before import, answer:

- Should materials be created automatically?
- Are material slots already named and ordered?
- Which textures are authoritative source files?
- Which color-space and compression decisions require review?
- Are generated materials temporary, or intended to remain?

If the team expects a hand-authored master material, automatic material creation may only add cleanup. If a source file is intended for repeated reimport, changing slot names without recording the decision can break later assumptions.

## 6. Save the import options as a decision record

The FBX importer contains options for mesh type, combining meshes, collision, normals, materials, LODs, and other behaviors. Capture the options that materially change the result.

A compact record is enough:

```text
Mesh type: Static / Skeletal
Combine meshes: yes / no
Collision: generated / custom / none
Normals and tangents: ...
Materials and textures: ...
LOD or Nanite intent: ...
Other non-default options: ...
```

Do not rely on a screenshot with no project, source file, or date attached to it.

## 7. Make reimport behavior explicit

Unreal Engine can monitor configured source directories and reimport dependent assets when source files change. Epic's Auto Reimport documentation also warns that detecting changes on restart may be undesirable when source control updates the same files, because it can trigger redundant reimports.

- [Reimporting Assets Automatically](https://dev.epicgames.com/documentation/en-us/unreal-engine/reimporting-assets-automatically-in-unreal-engine)

Record:

- the authoritative reimport source;
- whether the directory is monitored;
- who may change the source;
- whether automatic reimport is allowed in this project;
- how a changed import will be reviewed.

If the source is temporary, create an approved managed copy before the temporary path disappears.

## 8. Verify the imported asset, not just the success toast

Epic's static-mesh import guide finishes by opening the result in the Static Mesh Editor and verifying that it imported properly. Extend that check to the decisions your project actually cares about:

- dimensions and pivot;
- orientation and shading;
- UV channels and material slots;
- collision visualization;
- LOD or Nanite state;
- destination and asset name;
- source-file path and reimport behavior.

- [Importing Static Meshes Using FBX](https://dev.epicgames.com/documentation/unreal-engine/importing-static-meshes-using-fbx-in-unreal-engine)

Test the asset in a disposable level before approving a large batch.

## 9. Manage Unreal assets through Unreal Editor

Do not “clean up” `.uasset` files by moving or deleting them directly in Explorer. Epic's asset documentation warns that direct disk operations can break project functionality or cause data loss; manage assets through Unreal Editor and use the supported migration workflow when moving content between projects.

- [Working With Assets](https://dev.epicgames.com/documentation/en-us/unreal-engine/working-with-assets-in-unreal-engine)

Large renames or moves should have source-control history, a bounded changelist, redirector cleanup where applicable, and a tested rollback plan.

## A reusable 20-minute preflight

1. Identify source, owner, license, project, and engine version.
2. Verify export scale, axis, pivot, normals, UVs, and material slots.
3. Reserve the Unreal destination and name.
4. Choose collision and material behavior.
5. Record the non-default import options.
6. Decide how reimport is allowed to happen.
7. Import one asset.
8. Inspect it in the appropriate Unreal asset editor and a disposable level.
9. Attach the result and known issues to the source record.
10. Only then expand the process to a batch.

## Where Unreal Box fits

Unreal Box is a Windows desktop workspace for Unreal Engine creators. The current beta explores project and engine discovery, reference and backup source libraries, previews, metadata, technical context, and inspectable visual workflows.

You do not need Unreal Box to use this checklist. If you test the beta, start with a disposable project and one small source folder. A useful first automation is a read-only report of missing source paths, incomplete metadata, or invalid proposed names—not a batch rename.

- [Download Windows beta v0.1.19](https://ue5box.com/updates/personal/unreal-box-0.1.19-setup.exe?utm_source=github&utm_medium=organic-content&utm_campaign=beta-week1-202607&utm_content=import-preflight)
- [Share an Unreal import workflow breakdown](https://github.com/ueboxai/blog/issues/new?template=beta-feedback.yml)
- Email [admin@uebox.ai](mailto:admin@uebox.ai)

Unreal Box is an independent product and is not affiliated with or endorsed by Epic Games, Inc. Unreal Engine is a trademark or registered trademark of Epic Games, Inc. in the United States and elsewhere.
