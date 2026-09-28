// ui-lab harness: frames of the pane focus flash on a two-pane terminal split.
//
// Faithful mock, not the running app. Metrics and colors come from:
// - Flash patterns: Sources/Panels/Panel.swift `FocusFlashPattern`
//   (old: cmux main `values [0,1,0,1,0] keyTimes [0,.25,.5,.75,1] 0.9 s`;
//    new: PR #14894 `.pulse values [0,1,0] keyTimes [0,.3,1] 0.4 s`).
// - Timing curves: Sources/GhosttyTerminalView.swift `triggerFlash`
//   (CAKeyframeAnimation with CAMediaTimingFunction .easeOut / .easeIn).
// - Ring: PanelOverlayRingMetrics (inset 2, corner radius 6, line width 2),
//   WorkspaceAttentionCoordinator.flashRingStyle (glow opacity 0.6, radius 6),
//   color CmuxAccentColor .cmux (0,136,255 light / 0,145,255 dark).
// - Unfocused dim: GhosttyConfig.unfocusedSplitOpacity 0.7 -> overlay of the
//   background color at 0.3 over the terminal area.
// - Terminal colors: Resources/ghostty/themes/Apple System Colors (+ Light),
//   cmux's default managed palette.
// - Tab bar: vendor/bonsplit TabBarMetrics (bar 30, title 11 pt, active
//   indicator 1.5 pt at the top of the selected tab, accent when the pane is
//   focused, gray when not: TabBarView.tabBarSaturation).

import AppKit
import SwiftUI

struct FlashPattern {
    enum Curve { case easeIn, easeOut }
    let values: [Double]
    let keyTimes: [Double]
    let duration: Double
    let curves: [Curve]

    static let doubleBlink = FlashPattern(values: [0, 1, 0, 1, 0], keyTimes: [0, 0.25, 0.5, 0.75, 1], duration: 0.9, curves: [.easeOut, .easeIn, .easeOut, .easeIn])
    static let pulse = FlashPattern(values: [0, 1, 0], keyTimes: [0, 0.3, 1], duration: 0.4, curves: [.easeOut, .easeIn])
    static let slowPulse = FlashPattern(values: [0, 1, 0], keyTimes: [0, 0.3, 1], duration: 0.6, curves: [.easeOut, .easeIn])
    static let none = FlashPattern(values: [0, 0], keyTimes: [0, 1], duration: 0, curves: [.easeOut])

    func opacity(at t: Double) -> Double {
        guard duration > 0, t >= 0, t <= duration else { return 0 }
        for i in 0..<curves.count {
            let s = keyTimes[i] * duration, e = keyTimes[i + 1] * duration
            if t > e { continue }
            let p = max(0, min(1, (t - s) / max(e - s, 0.0001)))
            let c: Double
            switch curves[i] {
            case .easeIn: c = Self.bezier(p, 0.42, 0, 1, 1)
            case .easeOut: c = Self.bezier(p, 0, 0, 0.58, 1)
            }
            return values[i] + (values[i + 1] - values[i]) * c
        }
        return values.last ?? 0
    }

    /// CAMediaTimingFunction cubic bezier: solve x(u) = p, return y(u).
    static func bezier(_ p: Double, _ x1: Double, _ y1: Double, _ x2: Double, _ y2: Double) -> Double {
        func f(_ u: Double, _ a: Double, _ b: Double) -> Double {
            let v = 1 - u
            return 3 * v * v * u * a + 3 * v * u * u * b + u * u * u
        }
        var lo = 0.0, hi = 1.0
        for _ in 0..<40 {
            let mid = (lo + hi) / 2
            if f(mid, x1, x2) < p { lo = mid } else { hi = mid }
        }
        return f((lo + hi) / 2, y1, y2)
    }
}

struct Palette {
    let bg, fg, dim, green, blue, yellow, magenta, cursor, accent, tabText, tabTextSecondary, separator: NSColor
    static func hex(_ s: String) -> NSColor { let v = UInt32(s.dropFirst(), radix: 16)!; return NSColor(srgbRed: CGFloat((v >> 16) & 255) / 255, green: CGFloat((v >> 8) & 255) / 255, blue: CGFloat(v & 255) / 255, alpha: 1) }

    func with(accent: NSColor) -> Palette {
        Palette(bg: bg, fg: fg, dim: dim, green: green, blue: blue, yellow: yellow, magenta: magenta, cursor: cursor, accent: accent, tabText: tabText, tabTextSecondary: tabTextSecondary, separator: separator)
    }

    /// Catppuccin Mocha (dark) and Latte (light) terminal colors, for the color question.
    /// The accent is filled in per contender.
    static func catppuccin(dark: Bool) -> Palette {
        if dark {
            let fg = hex("#cdd6f4")
            return Palette(bg: hex("#1e1e2e"), fg: fg, dim: hex("#7f849c"), green: hex("#a6e3a1"), blue: hex("#89b4fa"), yellow: hex("#f9e2af"), magenta: hex("#f5c2e7"), cursor: hex("#f5e0dc"),
                           accent: .clear, tabText: fg.withAlphaComponent(0.85), tabTextSecondary: fg.withAlphaComponent(0.6), separator: fg.withAlphaComponent(0.14))
        }
        let fg = hex("#4c4f69")
        return Palette(bg: hex("#eff1f5"), fg: fg, dim: hex("#8c8fa1"), green: hex("#40a02b"), blue: hex("#1e66f5"), yellow: hex("#df8e1d"), magenta: hex("#ea76cb"), cursor: hex("#dc8a78"),
                       accent: .clear, tabText: fg.withAlphaComponent(0.9), tabTextSecondary: fg.withAlphaComponent(0.65), separator: fg.withAlphaComponent(0.14))
    }

    static func make(dark: Bool) -> Palette {
        if dark {
            return Palette(bg: hex("#1e1e1e"), fg: hex("#ffffff"), dim: hex("#98989d"), green: hex("#32d74b"), blue: hex("#0a84ff"), yellow: hex("#ffd60a"), magenta: hex("#bf5af2"), cursor: hex("#98989d"),
                           accent: NSColor(srgbRed: 0, green: 145 / 255, blue: 1, alpha: 1), tabText: NSColor.white.withAlphaComponent(0.82), tabTextSecondary: NSColor.white.withAlphaComponent(0.68), separator: NSColor.white.withAlphaComponent(0.14))
        }
        return Palette(bg: hex("#feffff"), fg: hex("#000000"), dim: hex("#6e6e73"), green: hex("#26a439"), blue: hex("#0869cb"), yellow: hex("#9a7f00"), magenta: hex("#9647bf"), cursor: hex("#98989d"),
                       accent: NSColor(srgbRed: 0, green: 136 / 255, blue: 1, alpha: 1), tabText: NSColor.black.withAlphaComponent(0.82), tabTextSecondary: NSColor.black.withAlphaComponent(0.62), separator: NSColor.black.withAlphaComponent(0.12))
    }
}

typealias Line = [(String, KeyPath<Palette, NSColor>)]

final class SplitMock: NSView {
    let palette: Palette
    let focusedRight: Bool
    let flashOpacity: Double
    init(frame: NSRect, palette: Palette, focusedRight: Bool, flashOpacity: Double) {
        self.palette = palette; self.focusedRight = focusedRight; self.flashOpacity = flashOpacity
        super.init(frame: frame)
    }
    required init?(coder: NSCoder) { fatalError() }
    override var isFlipped: Bool { true }

    static let tabBarHeight: CGFloat = 30
    static let dividerWidth: CGFloat = 1

    let leftTabs = ["zsh", "server"]
    let rightTabs = ["claude", "logs"]
    let leftLines: [Line] = [
        [("~/src/cmux ", \.blue), ("main ", \.magenta), ("$ ", \.fg), ("git status -sb", \.fg)],
        [("## main...origin/main", \.green)],
        [(" M Sources/Panels/Panel.swift", \.yellow)],
        [(" M Sources/GhosttyTerminalView.swift", \.yellow)],
        [("~/src/cmux ", \.blue), ("main ", \.magenta), ("$ ", \.fg), ("swift test --filter Flash", \.fg)],
        [("Building for debugging...", \.dim)],
        [("Test Suite 'FocusFlashPatternTests' passed", \.green)],
        [("  Executed 4 tests, with 0 failures", \.fg)],
        [("~/src/cmux ", \.blue), ("main ", \.magenta), ("$ ", \.fg)],
    ]
    let rightLines: [Line] = [
        [("> ", \.dim), ("fix the flaky split resize test", \.fg)],
        [("", \.fg)],
        [("* ", \.green), ("Read cmuxTests/SplitResizeTests.swift", \.fg)],
        [("* ", \.green), ("Edit waitForLayout(timeout:)", \.fg)],
        [("  +3 -1 lines", \.dim)],
        [("* ", \.green), ("Ran SplitResizeTests (12 passed)", \.fg)],
        [("", \.fg)],
        [("The test now waits for layout.", \.fg)],
        [("> ", \.dim)],
    ]

    override func draw(_ dirtyRect: NSRect) {
        palette.bg.setFill(); bounds.fill()
        let paneWidth = (bounds.width - Self.dividerWidth) / 2
        let left = NSRect(x: 0, y: 0, width: paneWidth, height: bounds.height)
        let right = NSRect(x: paneWidth + Self.dividerWidth, y: 0, width: paneWidth, height: bounds.height)
        drawPane(left, tabs: leftTabs, lines: leftLines, focused: !focusedRight)
        drawPane(right, tabs: rightTabs, lines: rightLines, focused: focusedRight)
        palette.separator.setFill()
        NSRect(x: paneWidth, y: 0, width: Self.dividerWidth, height: bounds.height).fill()
    }

    func drawPane(_ rect: NSRect, tabs: [String], lines: [Line], focused: Bool) {
        // Tab bar.
        let bar = NSRect(x: rect.minX, y: rect.minY, width: rect.width, height: Self.tabBarHeight)
        let font = NSFont.systemFont(ofSize: 11)
        var x = bar.minX
        let tabWidth: CGFloat = 96
        for (index, title) in tabs.enumerated() {
            let selected = index == 0
            let tab = NSRect(x: x, y: bar.minY, width: tabWidth, height: bar.height)
            let attrs: [NSAttributedString.Key: Any] = [.font: font, .foregroundColor: selected ? palette.tabText : palette.tabTextSecondary]
            let size = (title as NSString).size(withAttributes: attrs)
            (title as NSString).draw(at: NSPoint(x: tab.minX + 12, y: tab.midY - size.height / 2), withAttributes: attrs)
            if selected {
                (focused ? palette.accent : NSColor(white: 0.55, alpha: 1)).setFill()
                NSRect(x: tab.minX, y: tab.minY, width: tab.width - 1, height: 1.5).fill()
            } else {
                palette.separator.setFill()
                NSRect(x: tab.minX, y: tab.maxY - 1, width: tab.width, height: 1).fill()
            }
            palette.separator.setFill()
            NSRect(x: tab.maxX - 1, y: tab.minY + 7, width: 1, height: tab.height - 14).fill()
            x += tabWidth
        }
        palette.separator.setFill()
        NSRect(x: x, y: bar.maxY - 1, width: bar.maxX - x, height: 1).fill()

        // Terminal content.
        let term = NSRect(x: rect.minX, y: bar.maxY, width: rect.width, height: rect.height - bar.height)
        let mono = NSFont(name: "Menlo", size: 11) ?? .monospacedSystemFont(ofSize: 11, weight: .regular)
        let lineHeight: CGFloat = 15
        var y = term.minY + 8
        var lastX = term.minX
        for line in lines {
            var lx = term.minX + 10
            for (text, color) in line {
                let attrs: [NSAttributedString.Key: Any] = [.font: mono, .foregroundColor: palette[keyPath: color]]
                (text as NSString).draw(at: NSPoint(x: lx, y: y), withAttributes: attrs)
                lx += (text as NSString).size(withAttributes: attrs).width
            }
            lastX = lx
            y += lineHeight
        }
        // Cursor: block when focused, hollow when not (Ghostty unfocused cursor).
        let cellWidth = ("M" as NSString).size(withAttributes: [.font: mono]).width
        let cursor = NSRect(x: lastX, y: y - lineHeight + 1, width: cellWidth, height: lineHeight - 1)
        palette.cursor.set()
        if focused { cursor.fill() } else { let p = NSBezierPath(rect: cursor.insetBy(dx: 0.5, dy: 0.5)); p.lineWidth = 1; p.stroke() }

        if !focused {
            palette.bg.withAlphaComponent(0.3).setFill()
            term.fill(using: .sourceOver)
        }
        if focused, flashOpacity > 0 {
            drawFlash(in: term)
        }
    }

    func drawFlash(in term: NSRect) {
        guard let ctx = NSGraphicsContext.current?.cgContext else { return }
        ctx.saveGState()
        ctx.setAlpha(CGFloat(flashOpacity))
        ctx.beginTransparencyLayer(auxiliaryInfo: nil)
        let rect = term.insetBy(dx: 2, dy: 2)
        let path = NSBezierPath(roundedRect: rect, xRadius: 6, yRadius: 6)
        path.lineWidth = 2
        path.lineJoinStyle = .round
        let shadow = NSShadow()
        shadow.shadowColor = palette.accent.withAlphaComponent(0.6)
        shadow.shadowBlurRadius = 6
        shadow.shadowOffset = .zero
        shadow.set()
        palette.accent.setStroke()
        path.stroke()
        ctx.endTransparencyLayer()
        ctx.restoreGState()
    }
}

UILab.main {
    let env = ProcessInfo.processInfo.environment
    let fps = Double(env["FLASH_FPS"] ?? "60")!
    let only = env["FLASH_VARIANT"]
    let frameLimit = env["FLASH_FRAMES"].flatMap(Int.init)
    let bounds = NSRect(x: 0, y: 0, width: 600, height: 206)
    // FLASH_SET=color: the slow pulse on Catppuccin Mocha / Latte, ring (and focused
    // tab indicator) in each candidate color. Otherwise the timing set on cmux's default
    // palette.
    typealias Variant = (name: String, pattern: FlashPattern, palette: (Bool) -> Palette)
    let colorSet = env["FLASH_SET"] == "color"
    let rgb = { (r: CGFloat, g: CGFloat, b: CGFloat) in NSColor(srgbRed: r / 255, green: g / 255, blue: b / 255, alpha: 1) }
    let colors: [(String, (Bool) -> NSColor)] = [
        ("blue", { $0 ? rgb(0, 145, 255) : rgb(0, 136, 255) }),
        ("neutral", { $0 ? NSColor.white.withAlphaComponent(0.85) : NSColor.black.withAlphaComponent(0.8) }),
        ("peach", { Palette.hex($0 ? "#fab387" : "#fe640b") }),
        ("mauve", { Palette.hex($0 ? "#cba6f7" : "#8839ef") }),
        ("lavender", { Palette.hex($0 ? "#b4befe" : "#7287fd") }),
        ("green", { Palette.hex($0 ? "#a6e3a1" : "#40a02b") }),
        ("teal", { Palette.hex($0 ? "#94e2d5" : "#179299") }),
    ]
    let variants: [Variant] = colorSet
        ? colors.map { name, color in ("color-" + name, .slowPulse, { dark in Palette.catppuccin(dark: dark).with(accent: color(dark)) }) }
        : [("old-double-blink", .doubleBlink, Palette.make), ("new-pulse", .pulse, Palette.make), ("slow-pulse", .slowPulse, Palette.make), ("no-flash", .none, Palette.make)]
    // A 3 s loop: focus moves right at 0.5 s, back left at 2.0 s.
    let loop = 3.0, half = 1.5, lead = 0.5
    let frameCount = frameLimit ?? Int(loop * fps)
    for (name, pattern, palette) in variants where only == nil || only == name {
        for frame in 0..<frameCount {
            let clip = Double(frame) / fps
            let t = (clip - lead + loop).truncatingRemainder(dividingBy: loop)
            let focusedRight = t < half
            let elapsed = focusedRight ? t : t - half
            let opacity = pattern.opacity(at: elapsed)
            UILab.render(name: String(format: "%@-f%04d", name, frame)) { scheme in
                SplitMock(frame: bounds, palette: palette(scheme == .dark), focusedRight: focusedRight, flashOpacity: opacity)
            }
        }
    }
}
