"""Export all compatible wolf actions in a single animated GLB.

Run with Blender 3.6+ (recommended 4.2+):
    blender -b wolf.blend --python export_wolf_animations.py
Or in Blender's Scripting tab, open this file and click Run Script.

The original .blend is never overwritten.
"""

import bpy
import json
import math
import os
import struct
import sys

EXPECTED = ("idle", "idle2", "running", "sniffing", "fallen")


def find_rig():
    rigs = [obj for obj in bpy.data.objects if obj.type == 'ARMATURE']
    if not rigs:
        raise RuntimeError("No armature found in the Blender file")
    return next((o for o in rigs if o.name.lower() == 'wolf_rig'),
                next((o for o in rigs if 'wolf' in o.name.lower()), rigs[0]))


def linked_to_rig(mesh, rig):
    if mesh.type != 'MESH':
        return False
    if any(mod.type == 'ARMATURE' and mod.object == rig for mod in mesh.modifiers):
        return True
    node = mesh.parent
    while node:
        if node == rig:
            return True
        node = node.parent
    return False


def is_pose_action(action):
    # Legacy Blender 2.79 actions store bone animation in F-curves.
    try:
        return any(fc.data_path.startswith('pose.bones[') for fc in action.fcurves)
    except (AttributeError, RuntimeError):
        # Newer Blender versions may store layered actions differently.
        return True


def parse_glb_animations(path):
    with open(path, 'rb') as f:
        head = f.read(12)
        if len(head) != 12:
            raise RuntimeError("Incomplete GLB header")
        magic, version, total = struct.unpack('<4sII', head)
        if magic != b'glTF' or version != 2:
            raise RuntimeError("Export output is not GLB version 2")
        length, ctype = struct.unpack('<I4s', f.read(8))
        if ctype != b'JSON':
            raise RuntimeError("GLB is missing its JSON chunk")
        data = json.loads(f.read(length).decode('utf-8'))
    return [entry.get('name', '(unnamed)') for entry in data.get('animations', [])], len(data.get('meshes', [])), len(data.get('skins', []))


def main():
    if not bpy.data.filepath:
        raise RuntimeError("Open wolf.blend before running this script")
    base_dir = os.path.dirname(bpy.data.filepath)
    output = os.path.join(base_dir, 'wolf_all_animations.glb')
    if '--' in sys.argv:
        extra = sys.argv[sys.argv.index('--')+1:]
        if len(extra) >= 2 and extra[0] == '--output':
            output = os.path.abspath(extra[1])

    rig = find_rig()
    print('Using rig:', rig.name, 'bone count:', len(rig.data.bones))
    actions = list(bpy.data.actions)
    print('Source actions:', [(a.name, tuple(round(v, 2) for v in a.frame_range)) for a in actions])

    # Prefer the five known wolf clips, avoiding unrelated scene actions.
    selected = []
    for name in EXPECTED:
        match = next((a for a in actions if a.name.lower() == name), None)
        if match is not None:
            selected.append(match)
    if not selected:
        selected = [a for a in actions if is_pose_action(a)]
    if not selected:
        raise RuntimeError("No compatible wolf actions found")

    if not rig.animation_data:
        rig.animation_data_create()
    ad = rig.animation_data
    ad.action = None

    # Rebuild the NLA tracks in memory, so GLB stores separate named clips.
    # We intentionally do not save the Blender file.
    for track in list(ad.nla_tracks):
        ad.nla_tracks.remove(track)
    for action in selected:
        try:
            track = ad.nla_tracks.new()
            track.name = action.name
            start = max(0, int(math.floor(action.frame_range[0])))
            strip = track.strips.new(action.name, start, action)
            strip.blend_type = 'REPLACE'
            strip.extrapolation = 'NOTHING'
            track.mute = False
            print('NLA clip:', action.name, 'frame range:', tuple(action.frame_range))
        except Exception as e:
            print('WARNING: could not attach action:', action.name, repr(e))
            raise

    # Export only the wolf rig and its skinned mesh(es).
    if bpy.context.object and bpy.context.object.mode != 'OBJECT':
        bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.select_all(action='DESELECT')
    meshes = [obj for obj in bpy.data.objects if linked_to_rig(obj, rig)]
    if not meshes:
        # Fallback for a mesh not parented to the armature.
        meshes = [obj for obj in bpy.data.objects if obj.type == 'MESH']
        print('WARNING: no skinned meshes detected; including all scene meshes')
    for obj in [rig] + meshes:
        try:
            obj.hide_set(False)
        except Exception:
            pass
        obj.hide_viewport = False
        obj.select_set(True)
    bpy.context.view_layer.objects.active = rig
    print('Export objects:', [o.name for o in [rig] + meshes])

    exporter = getattr(bpy.ops.export_scene, 'gltf', None)
    if exporter is None:
        raise RuntimeError("Blender glTF 2.0 exporter is unavailable. Enable the exporter add-on or use Blender 4.2+")
    prop_names = {prop.identifier for prop in exporter.get_rna_type().properties}
    options = {
        'filepath': output,
        'export_format': 'GLB',
        'use_selection': True,
        'export_animations': True,
    }
    if 'export_animation_mode' in prop_names:
        options['export_animation_mode'] = 'NLA_TRACKS'
    elif 'export_nla_strips' in prop_names:
        options['export_nla_strips'] = True
    if 'export_anim_single_armature' in prop_names:
        options['export_anim_single_armature'] = True
    if 'export_force_sampling' in prop_names:
        options['export_force_sampling'] = True
    if 'export_cameras' in prop_names:
        options['export_cameras'] = False
    if 'export_lights' in prop_names:
        options['export_lights'] = False
    if 'export_apply' in prop_names:
        options['export_apply'] = False
    if 'export_frame_range' in prop_names:
        options['export_frame_range'] = False
    os.makedirs(os.path.dirname(output), exist_ok=True)
    result = exporter(**options)
    if 'FINISHED' not in result or not os.path.exists(output):
        raise RuntimeError('glTF export did not finish')
    clip_names, num_meshes, num_skins = parse_glb_animations(output)
    print('EXPORT COMPLETE:', output)
    print('GLB animations:', clip_names)
    print('GLB meshes:', num_meshes, 'skins:', num_skins)
    if len(clip_names) < len(selected):
        print('WARNING: Not all source actions were emitted as clips. Review NLA tracks and exporter settings.')
    if num_skins < 1:
        print('WARNING: No skin was exported. Check armature modifiers / mesh binding.')
    report = {
        'source': os.path.basename(bpy.data.filepath),
        'output': os.path.basename(output),
        'source_actions': [{'name': a.name, 'frames': list(a.frame_range)} for a in actions],
        'requested_clips': [a.name for a in selected],
        'exported_clips': clip_names,
        'mesh_count': num_meshes,
        'skin_count': num_skins,
        'note': 'fallen is a static pose unless additional keyframes were authored in Blender.'
    }
    with open(os.path.splitext(output)[0] + '_report.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)


if __name__ == '__main__':
    main()
