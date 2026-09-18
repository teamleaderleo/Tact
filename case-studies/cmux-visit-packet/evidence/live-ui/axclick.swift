import CoreGraphics
import Foundation

// axclick <windowId> <xInWindowPoints> <yInWindowPoints> — clicks, then restores the cursor.
guard CommandLine.arguments.count > 3, let wid = UInt32(CommandLine.arguments[1]),
      let dx = Double(CommandLine.arguments[2]), let dy = Double(CommandLine.arguments[3]) else { exit(2) }
guard let list = CGWindowListCopyWindowInfo([.optionIncludingWindow], wid) as? [[String: Any]],
      let b = list.first?["kCGWindowBounds"] as? [String: Any],
      let x = b["X"] as? Double, let y = b["Y"] as? Double else { exit(1) }
let origin = CGEvent(source: nil)?.location ?? .zero
let point = CGPoint(x: x + dx, y: y + dy)
for (type, button) in [(CGEventType.mouseMoved, CGMouseButton.left),
                       (.leftMouseDown, .left), (.leftMouseUp, .left)] {
    CGEvent(mouseEventSource: nil, mouseType: type, mouseCursorPosition: point, mouseButton: button)?
        .post(tap: .cghidEventTap)
    usleep(60_000)
}
CGEvent(mouseEventSource: nil, mouseType: .mouseMoved, mouseCursorPosition: origin, mouseButton: .left)?
    .post(tap: .cghidEventTap)
print("clicked \(Int(point.x)),\(Int(point.y)); cursor restored")
