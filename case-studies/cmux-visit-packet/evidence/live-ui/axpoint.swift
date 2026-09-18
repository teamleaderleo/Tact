import ApplicationServices
import CoreGraphics
import Foundation

// axpoint <windowId> <xInWindowPoints> <yInWindowPoints> [--press]
guard CommandLine.arguments.count > 3,
      let wid = UInt32(CommandLine.arguments[1]),
      let dx = Double(CommandLine.arguments[2]),
      let dy = Double(CommandLine.arguments[3]) else { exit(2) }
let press = CommandLine.arguments.contains("--press")

guard let list = CGWindowListCopyWindowInfo([.optionIncludingWindow], wid) as? [[String: Any]],
      let info = list.first,
      let bounds = info["kCGWindowBounds"] as? [String: Any],
      let x = bounds["X"] as? Double, let y = bounds["Y"] as? Double else {
    FileHandle.standardError.write("window \(wid) not found\n".data(using: .utf8)!); exit(1)
}
let point = CGPoint(x: x + dx, y: y + dy)
var element: AXUIElement?
let system = AXUIElementCreateSystemWide()
guard AXUIElementCopyElementAtPosition(system, Float(point.x), Float(point.y), &element) == .success,
      let target = element else {
    FileHandle.standardError.write("no element at \(point)\n".data(using: .utf8)!); exit(1)
}
func attr(_ e: AXUIElement, _ a: String) -> Any? {
    var v: CFTypeRef?
    return AXUIElementCopyAttributeValue(e, a as CFString, &v) == .success ? v : nil
}
let role = attr(target, kAXRoleAttribute as String) as? String ?? "?"
let desc = attr(target, kAXDescriptionAttribute as String) as? String ?? "-"
let title = attr(target, kAXTitleAttribute as String) as? String ?? "-"
print("at \(Int(point.x)),\(Int(point.y)): role=\(role) title=\(title) desc=\(desc)")
if press {
    let r = AXUIElementPerformAction(target, kAXPressAction as CFString)
    print("press -> \(r == .success ? "ok" : "err \(r.rawValue)")")
}
