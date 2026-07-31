# Rage Animator

A lightweight 2.5D character, scene, and skeletal animation editor for the Astro Rooster story world. Runs entirely in the browser — no server, no build step, no internet connection required.

## Usage

Open `astro_rooster_rig_editor.html` in a modern browser. That's it.

## Features

- Skeletal (bone) rig editing with undo/redo, keyframes, and a 12 FPS timeline
- Built-in characters: MAL (astronaut-on-rooster), Astra, Ember, and Troller — plus fully editable custom copies
- Built-in scenes (MAL Village, Deep Space, Ashfall Outpost, Studio Grey, Plain White), solid-color scenes, and custom image backdrops
- A library of ready-made character-aware keyframe sets (Run Cycle, Jump, Walk, Wave, Troll Dance, and more)
- Portable JSON export/import for characters, clips, keyframe sets, and whole projects
- Autosave in the browser

See [RIG_EDITOR_GUIDE.md](RIG_EDITOR_GUIDE.md) for the full guide.

## Project structure

```
astro_rooster_rig_editor.html   Entry point
rig-editor/                     Editor JS, CSS, and assets
bone-rig/                       PNG body parts for the MAL rig
chickenrun-background-lite.webp Default village backdrop
```
