export function extractTitle(markdown) {
  const match = String(markdown || "").match(/^\s*#{1,6}\s+(.+)$/m)
  return match ? match[1].trim() : ""
}

export function slugifyTitle(title) {
  const cleaned = String(title || "")
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff\u00e0-\u00ff\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return cleaned || "recipe"
}

export function buildFileName(markdown, title) {
  return `${slugifyTitle(title || extractTitle(markdown))}.md`
}

export function downloadRecipe(markdown, title) {
  const fileName = buildFileName(markdown, title)
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

function canShareFiles(file) {
  return (
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [file] })
  )
}

function isWindows() {
  const platform = navigator.userAgentData?.platform || navigator.platform || ""
  return /win/i.test(platform)
}

function copyToClipboard(markdown) {
  if (!(navigator.clipboard && navigator.clipboard.writeText)) {
    return Promise.resolve(false)
  }
  return navigator.clipboard
    .writeText(markdown)
    .then(() => true)
    .catch(() => false)
}

function shareData(title, extra) {
  return { title: title || "", url: window.location.href, ...extra }
}

export async function shareRecipe(markdown, title) {
  if (navigator.share) {
    const file = new File([markdown], buildFileName(markdown, title), {
      type: "text/markdown",
    })
    const shareWithFile = canShareFiles(file) && !isWindows()
    try {
      if (shareWithFile) {
        await navigator.share(shareData(title, { files: [file] }))
      } else {
        await navigator.share(shareData(title, { text: markdown }))
      }
      return "shared"
    } catch (err) {
      if (err.name === "AbortError") return "canceled"
      console.error("[share] native share failed:", err.name, err.message)
    }
  }
  const copied = await copyToClipboard(markdown)
  return copied ? "copied" : ""
}