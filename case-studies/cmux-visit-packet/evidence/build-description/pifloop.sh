#!/bin/zsh
# usage: pifloop.sh <worktree> <ddpath> <nloads> <label>
WT=$1; DD=$2; N=$3; LABEL=$4
PIF="$DD/Build/Intermediates.noindex/XCBuildData/PIFCache/project"
rm -rf "$DD"
echo "### $LABEL  wt=$WT"
echo "pbxproj mtime/size: $(stat -f '%m %z' $WT/cmux.xcodeproj/project.pbxproj)"
for i in $(seq 1 $N); do
  t0=$(python3 -c 'import time;print(time.time())')
  ( cd "$WT" && xcodebuild -showBuildSettings -project cmux.xcodeproj -scheme cmux \
      -configuration Debug -destination 'platform=macOS' -derivedDataPath "$DD" >/dev/null 2>&1 )
  rc=$?
  t1=$(python3 -c 'import time;print(time.time())')
  el=$(python3 -c "print(f'{$t1-$t0:.1f}')")
  n=$(ls "$PIF" 2>/dev/null | grep -c '^PROJECT@')
  echo "load $i: rc=$rc ${el}s  distinct PROJECT@ pifs now: $n"
  ls "$PIF" 2>/dev/null | grep '^PROJECT@' | sed 's/^/    /'
done
echo "pbxproj mtime/size after: $(stat -f '%m %z' $WT/cmux.xcodeproj/project.pbxproj)"
