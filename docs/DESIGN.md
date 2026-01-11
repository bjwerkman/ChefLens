# ChefLens Design System

> [!NOTE]
> ChefLens utilizes a **Clean & Minimal** design system built with **Tailwind CSS**. All components should favor simplicity, whitespace, and readability.

---

## 1. Design Principles

1.  **Clean Aesthetics:** Use generous padding, rounded corners (`rounded-xl`), and subtle shadows (`shadow-lg`) to create depth without clutter.
2.  **Visual Hierarchy:** Use font weight and color to denote importance. Primary actions are Indigo; secondary are Gray.
3.  **Responsive Feedback:**
    *   **Loading:** Use animated spinners (`Loader2`) for all async actions.
    *   **Disabled States:** Buttons should visually dim (`opacity-50`) and become unclickable (`cursor-not-allowed`) during processing.

---

## 2. Color Palette

We use the standard Tailwind CSS palette, specifically the **Indigo** scale for primary branding.

| Usage | Tailwind Class | Hex (Approx) | Description |
| :--- | :--- | :--- | :--- |
| **Primary** | `indigo-600` | `#4f46e5` | Main buttons, active steps, brand text. |
| **Primary Hover** | `indigo-700` | `#4338ca` | Hover state for primary actions. |
| **Success** | `green-600` | `#16a34a` | Success messages, upload confirmation. |
| **Error** | `red-600` | `#dc2626` | Error text, validation failures. |
| **Background** | `gray-50` | `#f9fafb` | Main app background. |
| **Surface** | `white` | `#ffffff` | Cards, Sidebar, Modals. |
| **Text Main** | `gray-900` | `#111827` | Headings, primary content. |
| **Text Muted** | `gray-500` | `#6b7280` | Subtitles, hints, icons. |

---

## 3. Typography

*   **Font Family:** `Inter`, system-ui, sans-serif.
*   **Headings:** `text-2xl` or `text-3xl`, `font-bold`.
*   **Subheadings:** `text-xl`, `font-semibold`.
*   **Body:** `text-base`, `text-gray-700`.
*   **Buttons:** `font-medium`.

---

## 4. Icons

*   **Library:** [Lucide React](https://lucide.dev/)
*   **Style:** Clean, consistent stroke width (usually 2px).
*   **Common Icons:**
    *   `ChefHat`: Wizard Step 1.
    *   `FileText`: Wizard Step 2.
    *   `Settings`: Wizard Step 3.
    *   `CloudUpload`: Wizard Step 4.
    *   `Loader2`: Loading states (animate-spin).
    *   `Check`: Success states.

---

## 5. Component Patterns

### Buttons
*   **Primary:** `px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors`
*   **Secondary:** `px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50`

### Cards
*   Standard container for content: `bg-white rounded-xl shadow-lg p-6`

### Wizard Stepper
*   A visual indicator at the top of the main layout.
*   Uses a relative positioning hack (`absolute w-full h-1 bg-gray-200`) to draw the connecting line behind the step circles.
