#!/usr/bin/env python3
"""Apply the project.pbxproj build-description-cache fix in the given repo root.

Fixes the structural anomalies that make Xcode synthesize nondeterministic guids
into the project PIF at load, which changes the workspace digest and defeats the
build-description cache.
"""
import os, subprocess, sys

root = sys.argv[1]
os.chdir(root)

p = 'cmux.xcodeproj/project.pbxproj'
s = open(p, encoding='utf-8').read()

# Anomaly 3: the variant group's `en` child read from the unlocalized resource
# root, so Xcode saw a localization whose file does not live in `en.lproj/`.
old3 = 'C11609000000000000000009 /* en */ = {isa = PBXFileReference; lastKnownFileType = net.daringfireball.markdown; name = en; path = "cloud-agent-skill.md"; sourceTree = "<group>"; };'
new3 = 'C11609000000000000000009 /* en */ = {isa = PBXFileReference; lastKnownFileType = net.daringfireball.markdown; name = en; path = "en.lproj/cloud-agent-skill.md"; sourceTree = "<group>"; };'
assert s.count(old3) == 1, 'anomaly 3 site not found'
s = s.replace(old3, new3)

# Anomaly 1: the Resources/bin/open file reference belonged to no group, so
# Xcode invented a "Recovered References" group (with a fresh guid) at load.
old1 = '\t\t\t\t\tD96971000000000000000002 /* cmux-sudo */,\n\t\t\t\t\tD96971000000000000000003 /* setup-pam-tid.sh */,\n'
new1 = '\t\t\t\t\tD96971000000000000000002 /* cmux-sudo */,\n\t\t\t\t\tD1BEF00001A1B2C3D4E5F719 /* open */,\n\t\t\t\t\tD96971000000000000000003 /* setup-pam-tid.sh */,\n'
assert s.count(old1) == 1, 'anomaly 1 site not found'
s = s.replace(old1, new1)

open(p, 'w', encoding='utf-8').write(s)

# Move the English copy under en.lproj/ to match the reference.
if os.path.exists('Resources/cloud-agent-skill.md'):
    os.makedirs('Resources/en.lproj', exist_ok=True)
    subprocess.check_call(['git', 'mv', 'Resources/cloud-agent-skill.md',
                           'Resources/en.lproj/cloud-agent-skill.md'])

# The resource now ships in en.lproj/, so the unlocalized-root fallback is dead.
p2 = 'Sources/Cloud/CloudAgentSkillLauncher.swift'
t = open(p2, encoding='utf-8').read()
oldsw = '''    /// The bundled skill markdown (`Resources/cloud-agent-skill.md`).
    static func skillMarkdown(bundle: Bundle = .main) -> String? {
        let url = bundle.url(forResource: "cloud-agent-skill", withExtension: "md")
            ?? bundle.resourceURL?.appendingPathComponent("cloud-agent-skill.md")
'''
newsw = '''    /// The bundled skill markdown (`Resources/en.lproj/cloud-agent-skill.md`,
    /// localized alongside `Resources/ja.lproj/cloud-agent-skill.md`). It ships
    /// inside `<region>.lproj/`, so the fallbacks below name the English
    /// localization explicitly rather than the unlocalized resource root.
    static func skillMarkdown(bundle: Bundle = .main) -> String? {
        let url = bundle.url(forResource: "cloud-agent-skill", withExtension: "md")
            ?? bundle.url(
                forResource: "cloud-agent-skill",
                withExtension: "md",
                subdirectory: nil,
                localization: "en"
            )
            ?? bundle.resourceURL?.appendingPathComponent("en.lproj/cloud-agent-skill.md")
'''
assert t.count(oldsw) == 1, 'launcher site not found'
open(p2, 'w', encoding='utf-8').write(t.replace(oldsw, newsw))

p3 = 'cmuxTests/CloudAgentSkillLauncherTests.swift'
u = open(p3, encoding='utf-8').read()
oldt = '"Resources/cloud-agent-skill.md must ship in the app bundle"'
newt = '"Resources/en.lproj/cloud-agent-skill.md must ship in the app bundle"'
assert u.count(oldt) == 1, 'test site not found'
open(p3, 'w', encoding='utf-8').write(u.replace(oldt, newt))

print('applied: anomaly 1 (orphan adopted), anomaly 3 (en.lproj), launcher + test updated')
