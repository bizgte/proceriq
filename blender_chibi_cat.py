"""
Proceriq Chibi Cat — Blender Python Script
Run inside Blender: Scripting tab → Open → Run Script
Exports chibi_cat.glb to your Desktop (or change OUTPUT_PATH below)
Tested on Blender 3.6+ / 4.x
"""

import bpy
import bmesh
import math
import os

OUTPUT_PATH = os.path.expanduser("~/Desktop/chibi_cat.glb")

# ── Helpers ──────────────────────────────────────────────────────────────────

def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()
    for c in bpy.data.collections:
        bpy.data.collections.remove(c)

def new_mat(name, color, roughness=0.8, metallic=0.0, alpha=1.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value  = (*color, 1.0)
    bsdf.inputs["Roughness"].default_value   = roughness
    bsdf.inputs["Metallic"].default_value    = metallic
    if alpha < 1.0:
        mat.blend_method = 'BLEND'
        bsdf.inputs["Alpha"].default_value   = alpha
    return mat

def add_sphere(name, loc, scale, mat):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1, location=loc, segments=32, ring_count=24)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = scale
    # Smooth shading
    bpy.ops.object.shade_smooth()
    # Subdivision surface for extra roundness
    mod = obj.modifiers.new("Subsurf", 'SUBSURF')
    mod.levels = 2
    mod.render_levels = 3
    if mat:
        obj.data.materials.append(mat)
    return obj

def add_cone(name, loc, scale, rot, mat):
    bpy.ops.mesh.primitive_cone_add(radius1=1, radius2=0, depth=1.5,
                                     location=loc, rotation=rot, vertices=16)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.shade_smooth()
    if mat:
        obj.data.materials.append(mat)
    return obj

def add_cylinder(name, loc, scale, rot, mat):
    bpy.ops.mesh.primitive_cylinder_add(radius=1, depth=1, location=loc,
                                         rotation=rot, vertices=16)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.shade_smooth()
    if mat:
        obj.data.materials.append(mat)
    return obj

def add_flat_disc(name, loc, scale, rot, mat):
    bpy.ops.mesh.primitive_circle_add(radius=1, fill_type='NGON',
                                       location=loc, rotation=rot, vertices=32)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = scale
    if mat:
        obj.data.materials.append(mat)
    return obj

def set_parent(child, parent):
    child.parent = parent
    child.matrix_parent_inverse = parent.matrix_world.inverted()

# ── Materials ────────────────────────────────────────────────────────────────

clear_scene()

m_body      = new_mat("body",       (0.97, 0.93, 0.88), roughness=0.9)   # cream white
m_inner_ear = new_mat("inner_ear",  (0.95, 0.72, 0.78), roughness=0.95)  # soft pink
m_eye       = new_mat("eye",        (0.12, 0.08, 0.08), roughness=0.3, metallic=0.1)   # dark brown
m_eye_shine = new_mat("eye_shine",  (1.0,  1.0,  1.0),  roughness=0.0, metallic=0.0)  # white shine
m_nose      = new_mat("nose",       (0.80, 0.50, 0.58), roughness=0.85)  # dusty pink
m_cheek     = new_mat("cheek",      (0.98, 0.65, 0.72), roughness=0.95, alpha=0.7)     # blush
m_mouth     = new_mat("mouth",      (0.75, 0.42, 0.50), roughness=0.9)   # mouth line

# ── Body ─────────────────────────────────────────────────────────────────────
body = add_sphere("body", (0, 0, 0), (1.0, 0.85, 0.92), m_body)

# ── Head ─────────────────────────────────────────────────────────────────────
head = add_sphere("head", (0, 0, 1.52), (1.25, 1.1, 1.2), m_body)
set_parent(head, body)

# ── Ears ─────────────────────────────────────────────────────────────────────
ear_l = add_cone("ear_L", (-0.7, 0, 2.55), (0.28, 0.22, 0.42),
                 (0.0, math.radians(-12), math.radians(-8)), m_body)
ear_r = add_cone("ear_R", ( 0.7, 0, 2.55), (0.28, 0.22, 0.42),
                 (0.0, math.radians( 12), math.radians( 8)), m_body)
inner_l = add_cone("inner_ear_L", (-0.68, -0.05, 2.52), (0.16, 0.12, 0.32),
                   (0.0, math.radians(-12), math.radians(-8)), m_inner_ear)
inner_r = add_cone("inner_ear_R", ( 0.68, -0.05, 2.52), (0.16, 0.12, 0.32),
                   (0.0, math.radians( 12), math.radians( 8)), m_inner_ear)
for e in [ear_l, ear_r, inner_l, inner_r]:
    set_parent(e, head)

# ── Eyes ─────────────────────────────────────────────────────────────────────
eye_l = add_sphere("eye_L", (-0.42, -1.08, 1.6), (0.18, 0.08, 0.22), m_eye)
eye_r = add_sphere("eye_R", ( 0.42, -1.08, 1.6), (0.18, 0.08, 0.22), m_eye)
shine_l = add_sphere("shine_L", (-0.34, -1.16, 1.70), (0.06, 0.04, 0.06), m_eye_shine)
shine_r = add_sphere("shine_R", ( 0.50, -1.16, 1.70), (0.06, 0.04, 0.06), m_eye_shine)
for e in [eye_l, eye_r, shine_l, shine_r]:
    set_parent(e, head)

# ── Nose ─────────────────────────────────────────────────────────────────────
nose = add_sphere("nose", (0, -1.2, 1.38), (0.1, 0.06, 0.08), m_nose)
set_parent(nose, head)

# ── Cheeks ───────────────────────────────────────────────────────────────────
cheek_l = add_sphere("cheek_L", (-0.62, -1.1, 1.42), (0.28, 0.06, 0.20), m_cheek)
cheek_r = add_sphere("cheek_R", ( 0.62, -1.1, 1.42), (0.28, 0.06, 0.20), m_cheek)
for c in [cheek_l, cheek_r]:
    set_parent(c, head)

# ── Mouth (small torus arc) ──────────────────────────────────────────────────
bpy.ops.mesh.primitive_torus_add(
    align='WORLD', location=(0, -1.2, 1.24),
    major_radius=0.18, minor_radius=0.025,
    major_segments=24, minor_segments=8)
mouth = bpy.context.active_object
mouth.name = "mouth"
# Keep only bottom half
bpy.ops.object.mode_set(mode='EDIT')
bm = bmesh.from_edit_mesh(mouth.data)
verts_to_del = [v for v in bm.verts if v.co.x > 0.04]
bmesh.ops.delete(bm, geom=verts_to_del, context='VERTS')
bmesh.update_edit_mesh(mouth.data)
bpy.ops.object.mode_set(mode='OBJECT')
mouth.rotation_euler = (math.radians(90), 0, 0)
mouth.data.materials.append(m_mouth)
set_parent(mouth, head)

# ── Arms ─────────────────────────────────────────────────────────────────────
arm_l = add_sphere("arm_L", (-1.1, -0.1, 0.1), (0.32, 0.28, 0.42), m_body)
arm_r = add_sphere("arm_R", ( 1.1, -0.1, 0.1), (0.32, 0.28, 0.42), m_body)

# Paw beans on left arm
for ox, oz in [(-0.12, -0.22), (0, -0.25), (0.12, -0.22)]:
    p = add_sphere(f"paw_L_{ox}", (-1.1+ox, -0.35, 0.1+oz), (0.07, 0.05, 0.07), m_inner_ear)
    set_parent(p, arm_l)

for ox, oz in [(-0.12, -0.22), (0, -0.25), (0.12, -0.22)]:
    p = add_sphere(f"paw_R_{ox}", (1.1+ox, -0.35, 0.1+oz), (0.07, 0.05, 0.07), m_inner_ear)
    set_parent(p, arm_r)

set_parent(arm_l, body)
set_parent(arm_r, body)

# ── Legs / feet ──────────────────────────────────────────────────────────────
leg_l = add_sphere("leg_L", (-0.55, 0, -0.82), (0.42, 0.38, 0.32), m_body)
leg_r = add_sphere("leg_R", ( 0.55, 0, -0.82), (0.42, 0.38, 0.32), m_body)

for ox, oy in [(-0.1, -0.12), (0.05, -0.15), (0.18, -0.10)]:
    p = add_sphere(f"toe_L_{ox}", (-0.55+ox, -0.45+oy, -1.02), (0.08, 0.06, 0.07), m_inner_ear)
    set_parent(p, leg_l)

for ox, oy in [(-0.18, -0.10), (-0.05, -0.15), (0.10, -0.12)]:
    p = add_sphere(f"toe_R_{ox}", (0.55+ox, -0.45+oy, -1.02), (0.08, 0.06, 0.07), m_inner_ear)
    set_parent(p, leg_r)

set_parent(leg_l, body)
set_parent(leg_r, body)

# ── Tail (bezier curve) ───────────────────────────────────────────────────────
curve_data = bpy.data.curves.new('tail_curve', type='CURVE')
curve_data.dimensions = '3D'
curve_data.bevel_depth = 0.07
curve_data.bevel_resolution = 6
curve_data.use_fill_caps = True

spline = curve_data.splines.new('BEZIER')
spline.bezier_points.add(3)
pts = [
    ((0.7, 0.1, -0.5),  (0.4, 0.0, -0.3),  (1.0, 0.2, -0.7)),
    ((1.3, 0.0, -0.2),  (1.0,-0.1, -0.4),  (1.6, 0.1,  0.0)),
    ((1.1,-0.1,  0.5),  (1.4, 0.0,  0.2),  (0.8,-0.2,  0.8)),
    ((0.5, 0.0,  0.9),  (0.7,-0.1,  0.7),  (0.3, 0.1,  1.1)),
]
for i, (co, hl, hr) in enumerate(pts):
    bp = spline.bezier_points[i]
    bp.co = co
    bp.handle_left  = hl
    bp.handle_right = hr
    bp.handle_left_type  = 'FREE'
    bp.handle_right_type = 'FREE'

tail_obj = bpy.data.objects.new('tail', curve_data)
bpy.context.collection.objects.link(tail_obj)
tail_obj.data.materials.append(m_body)
set_parent(tail_obj, body)

# ── Belly patch ───────────────────────────────────────────────────────────────
belly = add_sphere("belly", (0, -0.88, -0.05), (0.60, 0.10, 0.55), m_inner_ear)
belly.data.materials[0] = new_mat("belly_patch", (1.0, 0.96, 0.92), roughness=0.95, alpha=0.85)
set_parent(belly, body)

# ── Armature for wave/tickle animations ──────────────────────────────────────
bpy.ops.object.armature_add(enter_editmode=True, location=(0, 0, 0))
armature = bpy.context.active_object
armature.name = "chibi_rig"
arm = armature.data
arm.name = "chibi_rig_data"

eb = arm.edit_bones
# Root
root = eb[0]
root.name = "root"
root.head = (0, 0, -1.2)
root.tail = (0, 0,  0.0)

# Spine
spine = eb.new("spine")
spine.head = (0, 0, 0)
spine.tail = (0, 0, 1.5)
spine.parent = root

# Head bone
head_b = eb.new("head")
head_b.head = (0, 0, 1.5)
head_b.tail = (0, 0, 2.8)
head_b.parent = spine

# Left arm bone
arm_l_b = eb.new("arm_L")
arm_l_b.head = (-0.8, 0, 0.2)
arm_l_b.tail = (-1.4, 0, -0.1)
arm_l_b.parent = spine

# Right arm bone
arm_r_b = eb.new("arm_R")
arm_r_b.head = ( 0.8, 0, 0.2)
arm_r_b.tail = ( 1.4, 0, -0.1)
arm_r_b.parent = spine

# Tail bone
tail_b = eb.new("tail")
tail_b.head = (0.7, 0, -0.5)
tail_b.tail = (1.3, 0, -0.0)
tail_b.parent = root

bpy.ops.object.mode_set(mode='OBJECT')

# ── Select all mesh objects and export ───────────────────────────────────────
bpy.ops.object.select_all(action='SELECT')

print(f"\n✅ Chibi cat built! Exporting to {OUTPUT_PATH} ...\n")

bpy.ops.export_scene.gltf(
    filepath=OUTPUT_PATH,
    export_format='GLB',
    export_apply=True,
    export_animations=False,
    export_materials='EXPORT',
    export_colors=True,
    export_skins=False,
    export_morph=False,
    use_selection=False,
)

print(f"✅ Exported: {OUTPUT_PATH}")
