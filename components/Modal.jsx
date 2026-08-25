import { useEffect, useRef } from "react"

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

const modalStack = []

export default function Modal({ onClose, overlayClassName = "", modalClassName = "", ariaLabel, children }) {
  const panelRef = useRef(null)
  const closeRef = useRef(onClose)

  useEffect(() => {
    closeRef.current = onClose
  }, [onClose])

  useEffect(() => {
    const panel = panelRef.current
    const token = {}
    modalStack.push(token)
    const previousFocus = document.activeElement
    panel.focus()

    function getFocusableElements() {
      return Array.from(panel.querySelectorAll(FOCUSABLE_SELECTOR))
        .filter(el => el.getClientRects().length > 0)
    }

    function handleKeyDown(e) {
      if (e.defaultPrevented) return
      if (modalStack[modalStack.length - 1] !== token) return

      if (e.key === "Escape") {
        e.preventDefault()
        closeRef.current()
      } else if (e.key === "Tab") {
        const focusable = getFocusableElements()
        if (focusable.length === 0) {
          e.preventDefault()
          panel.focus()
          return
        }
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        let target = null
        if (!panel.contains(document.activeElement)) {
          target = e.shiftKey ? last : first
        } else if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
          target = last
        } else if (!e.shiftKey && document.activeElement === last) {
          target = first
        }
        if (target) {
          e.preventDefault()
          target.focus()
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      const index = modalStack.indexOf(token)
      if (index > -1) modalStack.splice(index, 1)
      if (previousFocus && typeof previousFocus.focus === "function") previousFocus.focus()
    }
  }, [])

  return (
    <div className={overlayClassName} onClick={onClose}>
      <div
        className={modalClassName}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        tabIndex={-1}
        ref={panelRef}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
