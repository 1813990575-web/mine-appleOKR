import AppKit
import Foundation

struct SymbolItem {
    let section: String
    let name: String
    let title: String
    let note: String
}

let outputRoot = URL(fileURLWithPath: "/Users/aha/mine-apps/12.OKR/icon-assets", isDirectory: true)
try? FileManager.default.createDirectory(at: outputRoot, withIntermediateDirectories: true)

let palette = NSColor(red: 17 / 255, green: 18 / 255, blue: 20 / 255, alpha: 1)
let background = NSColor(red: 247 / 255, green: 248 / 255, blue: 250 / 255, alpha: 1)
let border = NSColor(calibratedWhite: 0.82, alpha: 1)

let config = NSImage.SymbolConfiguration(pointSize: 54, weight: .regular)

let symbols: [SymbolItem] = [
    .init(section: "navigation", name: "sidebar.left", title: "Sidebar", note: "侧边栏与布局"),
    .init(section: "navigation", name: "magnifyingglass", title: "Search", note: "搜索"),
    .init(section: "navigation", name: "slider.horizontal.3", title: "Filter", note: "筛选与调节"),
    .init(section: "navigation", name: "square.grid.2x2", title: "Grid", note: "网格视图"),
    .init(section: "navigation", name: "list.bullet", title: "List", note: "列表视图"),
    .init(section: "navigation", name: "ellipsis.circle", title: "More", note: "更多操作"),

    .init(section: "actions", name: "plus", title: "Add", note: "新建"),
    .init(section: "actions", name: "plus.circle.fill", title: "Add Circle", note: "强调新建"),
    .init(section: "actions", name: "pencil", title: "Edit", note: "编辑"),
    .init(section: "actions", name: "trash", title: "Delete", note: "删除"),
    .init(section: "actions", name: "square.and.arrow.up", title: "Share", note: "分享"),
    .init(section: "actions", name: "checkmark.circle", title: "Confirm", note: "确认与完成"),

    .init(section: "status", name: "circle", title: "Empty", note: "未完成"),
    .init(section: "status", name: "checkmark.circle.fill", title: "Done", note: "已完成"),
    .init(section: "status", name: "exclamationmark.circle", title: "Warning", note: "提醒与异常"),
    .init(section: "status", name: "clock.badge.exclamationmark", title: "Deadline", note: "截止与超时"),
    .init(section: "status", name: "flag", title: "Flag", note: "优先级"),
    .init(section: "status", name: "tag", title: "Tag", note: "标签"),

    .init(section: "calendar", name: "calendar", title: "Calendar", note: "日历"),
    .init(section: "calendar", name: "calendar.badge.clock", title: "Schedule", note: "安排与计划"),
    .init(section: "calendar", name: "clock", title: "Clock", note: "时间"),
    .init(section: "calendar", name: "alarm", title: "Alarm", note: "提醒"),
    .init(section: "calendar", name: "bell", title: "Bell", note: "通知"),
    .init(section: "calendar", name: "bell.badge", title: "Reminder", note: "提醒事项"),

    .init(section: "communication", name: "text.bubble", title: "Comment", note: "消息与备注"),
    .init(section: "communication", name: "text.bubble.fill", title: "Comment Fill", note: "强调消息"),
    .init(section: "communication", name: "quote.bubble", title: "Quote", note: "引用"),
    .init(section: "communication", name: "paperclip", title: "Attachment", note: "附件"),
    .init(section: "communication", name: "link", title: "Link", note: "链接"),
    .init(section: "communication", name: "person.crop.circle", title: "Profile", note: "用户与身份"),

    .init(section: "media", name: "play.circle", title: "Play", note: "播放"),
    .init(section: "media", name: "pause.circle", title: "Pause", note: "暂停"),
    .init(section: "media", name: "stop.circle", title: "Stop", note: "停止"),
    .init(section: "media", name: "timer", title: "Timer", note: "计时器"),
    .init(section: "media", name: "timer.circle", title: "Timer Circle", note: "专注计时"),
    .init(section: "media", name: "waveform", title: "Waveform", note: "音频与动态"),
]

func render(symbol: SymbolItem) {
    let sectionDir = outputRoot.appendingPathComponent(symbol.section, isDirectory: true)
    try? FileManager.default.createDirectory(at: sectionDir, withIntermediateDirectories: true)

    let canvas = NSSize(width: 96, height: 96)
    let image = NSImage(size: canvas)
    image.lockFocus()

    let bgRect = NSRect(origin: .zero, size: canvas)
    let path = NSBezierPath(roundedRect: bgRect.insetBy(dx: 4, dy: 4), xRadius: 22, yRadius: 22)
    background.setFill()
    path.fill()
    border.setStroke()
    path.lineWidth = 1
    path.stroke()

    if let base = NSImage(systemSymbolName: symbol.name, accessibilityDescription: symbol.title),
       let configured = base.withSymbolConfiguration(config) {
        let drawSize = configured.size
        let x = (canvas.width - drawSize.width) / 2
        let y = (canvas.height - drawSize.height) / 2
        palette.set()
        configured.draw(in: NSRect(x: x, y: y, width: drawSize.width, height: drawSize.height))
    }

    image.unlockFocus()

    guard let data = image.tiffRepresentation,
          let rep = NSBitmapImageRep(data: data),
          let png = rep.representation(using: .png, properties: [:]) else {
        return
    }

    let fileURL = sectionDir.appendingPathComponent(symbol.name.replacingOccurrences(of: ".", with: "_") + ".png")
    try? png.write(to: fileURL)
}

symbols.forEach(render)
print("Rendered \(symbols.count) symbols to \(outputRoot.path)")
