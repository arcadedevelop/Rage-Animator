# Astro Rooster 2.5D Rig Editor

Open `index.html` in a modern browser. The editor is local-only and does not need a server or an internet connection.

## Character & Scene library

The bar under the top toolbar holds two independent libraries so you can customize the stage without touching code.

**Character** — the rig you are animating.

- **MAL** — the original astronaut-on-rooster, built from PNG parts.
- **Astra** — a project-fit space runner rebuilt as exact vector shapes. Because every joint is defined numerically it has no fragile traced geometry, so its body structure stays precise and never depends on external art.
- **Ember** — a new fire-rescue space scout created for the burning-village escape story. Ember is a precise vector rig with independently editable limbs, helmet, rescue pack, heat cape, and wrist beacon. Its supplied Rescue Run has twenty exposed poses at exactly 12 FPS, with arm/leg counter-swing, foot-cycle depth, torso stabilization, cape follow-through, and beacon secondary motion.
- **Troller** — the classic large Trollface on a thin articulated stick body. Its Classic Troll Dance recreates the supplied ten-frame reference sequence—left knee lift, drop, wide squat, right kick, return, and loop—on the editor's exact 12 FPS grid. The face was redrawn with its flat skull, looped ears, squeezed left eye, dark right eye, hooked nose, cheek creases, oversized grin, and individual teeth. Every two-segment limb remains independently editable.
- **＋ Copy** saves a fully editable custom copy of the current character (its rig and all its clips). **Rename** and **Delete** apply to custom characters only; the built-ins are protected.
- **Export Character** downloads the active character — rig definition plus every clip — as one portable JSON. **Import Character** loads such a file (or an older rig/animation export) back into the library and switches to it.

**Scene** — the background behind the rig.

- **MAL Village**, **Deep Space** (starfield), **Ashfall Outpost**, **Studio Grey**, and **Plain White** ship built in. Ashfall Outpost is Ember's lightweight procedural story scene and uses no external image.
- Pick a color from the square swatch and press **Use Color** (or simply adjust the swatch) to switch to a clean **Solid Color** scene. The selected tone autosaves with the project.
- **＋ Image** turns any picture you pick into a new scene. **Delete** removes custom scenes.

Character and scene are chosen separately, so any runner can perform on any backdrop. Everything — the whole library, each character's clips, and your active selection — autosaves in the browser and travels inside the exported files.

## Ready-made keyframe set library

The third group in the library bar supplies eleven reusable 12 FPS actions: **Run Cycle**, **Jump**, **Idle Breathing**, **Walk Cycle**, **Wave**, **Crouch & Stand**, **Forward Kick**, **Celebrate**, **Look Around**, **Dance Groove**, and **Troll Dance**. The built-in sets generate tracks from the active character's own bone names and hierarchy, so MAL, Astra, Ember, Troller, and compatible custom rigs receive character-aware motion instead of copied screen coordinates.

**Troll Dance** recreates the classic Trollface dance loop: a side-to-side flailing groove that whips into one full 360° vertical-axis spin — every part foreshortens to a thin sliver at the mid-turn, exactly like the reference GIF — lifted by a hop and squash-and-stretch, then settles back so the two-second loop is perfectly seamless. Because it is character-aware, any rig can perform it, but it reads best on the Troller.

- Choose a set and press **＋ Apply** to add it as a new clip without replacing the current clip.
- Press **Save Clip** to store the active edited clip as a custom set in the library.
- **Export Set** downloads only the selected set as a portable JSON file; **Import Set** adds one such JSON file back to the library.
- **Delete Set** removes a custom set. The ten built-in sets are protected.

An imported custom set matches tracks by bone ID. The editor reports the matched-bone count when only part of a rig is compatible, and leaves unmatched parts in their rest pose.

## Fast on-canvas controls

Tap a body part once. A color-coded control pattern appears around its selected joint:

- **Cyan center ✥** — drag to move the joint.
- **Orange ring / ↻ point** — drag around the ring to rotate. The live angle is displayed beside it.
- **Purple 2.5D diamond** — drag left/right for Y Tilt and up/down for Scale.
- **Green vertical rail / diamond** — drag upward to move toward the front or downward to move toward the back. The current Z value appears beside it.
- **FRONT +** — tap once to move the selected part one layer forward.
- **BACK −** — tap once to move it one layer backward.

The handle automatically activates the correct tool, so you do not need to select Rotate or Depth in the lower toolbar first. Press **? Controls** at the top of the viewport whenever you want to reopen the Burmese control guide.

## PC and laptop camera navigation

- Select **Hand** (or press `H`), then left-drag to pan the stage.
- Hold and drag the **middle mouse button** to pan from any active rig tool.
- On a laptop touchpad, use **two-finger scrolling** to pan horizontally and vertically.
- Touchpad pinch or `Ctrl`/`Cmd` + wheel zooms toward the pointer position.
- Press `F` or tap **Fit** to restore the complete stage view.

Hand, middle-mouse, wheel, and touchpad navigation only change the editor camera. They never alter character transforms or animation keyframes.

## Editing a pose

1. Select a bone in **Hierarchy**, on the canvas joint, or in the **Dope Sheet**.
2. Move the timeline playhead to the pose time.
3. Choose a direct tool below the canvas, then drag with a mouse or finger:
   - **Move** moves the selected joint.
   - **Rotate** rotates around the selected joint.
   - **2.5D Tilt** uses horizontal drag for Y Tilt and vertical drag for Scale.
   - **Depth** drags upward toward the front and downward toward the back.
   - **Whole Rig** controls the root and all children together.
   - **Path** moves the root key while displaying its motion path.
4. You can also adjust X/Y, Z Rotation, Y Tilt, Z Depth, or Scale precisely in **Inspector**.
5. Press **Add / Update Key** (or `K`) to save the pose.

When **Auto Key** is enabled, slider changes and canvas joint dragging update the keyframe at the current snapped time automatically.

On a touchscreen, two fingers always control the **stage camera**: pinch to zoom and move both fingers together to pan. This does not change animation keyframes. Use one finger with **Whole Rig** to move the character root, then use the orange or purple on-canvas handles to rotate or tilt it.

The camera has **−**, **+**, and **Fit** buttons as tap alternatives. Its zoom and pan are saved as a device-local viewing preference, separately from animation keys.

On narrow screens, the fixed bottom navigation jumps directly to Stage, Bones, Inspector controls, or Timeline. The center **Key** button adds or updates the current key without scrolling to the inspector.

## Playback and timeline

- `Space`: play or pause
- `Left / Right`: step by one snapped frame
- `K`: add or update the selected bone key
- `Delete`: remove the selected bone key at the current time
- `Ctrl+Z`: undo
- `Ctrl+Shift+Z`: redo

MAL and Astra use eight main poses over a 1600 ms loop. Ember uses twenty editable poses over a 1666.667 ms loop. Troller translates its ten approximately 70 ms reference drawings to ten editable 12 FPS poses over an 833.333 ms loop. Timeline editing snaps to 12 FPS by default, while the canvas interpolates at the display refresh rate for smooth motion.

## 2.5D controls

- **Z Rotation** rotates a bone in the picture plane.
- **Y Tilt** adds horizontal foreshortening, giving the cutout a light 3D turn.
- **Z Depth** changes perspective scale and front/back layer order.
- **Scale** changes the selected bone and its children.

Use **Layer − Back** and **Layer + Front** for exact depth steps. In **Path** mode, enable **Auto rotate along motion path** or press **Orient current key to path**. The Offset slider corrects the character's facing direction without changing the path.

Parent/child links are fixed in the rig. The chicken and the astronaut are two separate bone groups joined at a single control bone:

- **Chicken:** rooster body → tail, and body → (far/near) thigh → shin.
- **Rider:** rooster body → **Rider Root** → astronaut core → legs and arms (thigh → shin, upper arm → forearm).

**Rider Root** is an art-less control bone. Move, rotate, or bob it to reposition the whole astronaut on the mount without touching the chicken, then use the astronaut core for torso lean. This keeps the character and the chicken independent while they still ride together.

The default Run Cycle animates them as a mount and rider: the chicken gallops (alternating legs, double body bob, tail counter-swing) while the astronaut stays seated — legs gripping the flanks, the springy Rider Root absorbing the bounce, one hand on the reins and the torch arm raised. The rider never runs; it rides. This prevents child parts from separating when a parent moves.

## Clips and actions

The **Clips** bar above the timeline holds multiple named actions (Run, Idle, Look Back, Jump…) in one project. Each clip keeps its own duration, frame snapping, and keyframes.

- **＋ New** adds an empty action starting from the rest pose.
- **Duplicate** copies the current action, keys and all.
- **Rename** (or double-click a clip tab) renames it.
- **Delete** removes the current action; at least one always remains.

Click a tab to switch. Undo/redo, autosave, and export all cover every clip, so you can build a full action set without leaving the editor. The keyframe-set library can turn any active clip into a reusable action or add a ready-made action as a new clip.

## Project files

**Export Character** downloads the active character as a portable JSON — its rig definition plus every clip. **Import Character** restores such a file (older single-rig and single-animation exports are migrated automatically) and adds it to the library. **Export Set / Import Set** transfer one reusable animation set at a time. The full character, scene, and keyframe-set libraries, every character's clips, the active selections, and the solid background color are also autosaved in the browser with `localStorage`.

The editor uses Canvas 2D, caps render pixel density at 1.25×, and only redraws continuously during playback. Onion skin is paused-only to keep rendering light.
