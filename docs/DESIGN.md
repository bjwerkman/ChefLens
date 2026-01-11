# ChefLens Design System

> [!NOTE]
> ChefLens utilizes the **Material Design 3** system, natively supported by the Flet framework. All custom designs should adhere to these principles.

---

## 1. Design Principles

1.  **Platform Native Feel:** The app should feel responsive and native, favoring standard Material controls (`ListTile`, `AppBar`, `Card`) over custom HTML-like constructions.
2.  **Clear Feedback:** Every async action (Parsing, Saving, Uploading) MUST provide immediate visual feedback (Progress Ring, Snackbar, or Status Text).
3.  **Safe & Defensive:** UI components should handle missing data gracefully (e.g., `SafeIcon` wrapper) without crashing the render tree.

---

## 2. Color Palette

We use semantic color naming where possible, falling back to Flet presets.

| Usage | Color Name | Hex / Flet Constant | Description |
| :--- | :--- | :--- | :--- |
| **Primary Action** | `blue` | `ft.colors.BLUE` | Main buttons, active tabs. |
| **Success** | `green` | `ft.colors.GREEN` | Success messages, "Speed" badge. |
| **Warning/Temp** | `amber` | `ft.colors.AMBER` | "Temperature" badge. |
| **Error** | `red` | `ft.colors.RED` | Error text, validation failures. |
| **Special/Mode** | `purple` | `ft.colors.PURPLE` | "Mode" badge (Knead, Sauté). |
| **Surface** | `surfaceVariant` | `"surfaceVariant"` | App Bars, Card backgrounds. |
| **Inactive** | `grey` | `ft.colors.GREY` | Disabled buttons, inactive tabs. |

---

## 3. Typography

*   **Headings:** `size=24`, `weight=ft.FontWeight.BOLD`. Used for page titles and section headers.
*   **Subheadings:** `size=18`, `weight=ft.FontWeight.BOLD`. Used for list groups (e.g., "Ingredients").
*   **Body:** Default size. Used for standard text.
*   **Captions/Hints:** `size=12`, `color="grey"`. Used for helper text (e.g., "Leave empty to Create New").

---

## 4. Component Library

### `SafeIcon`
*   **Location:** `app/frontend/components.py`
*   **Purpose:** Wraps `ft.Icon` to safely handle the breaking change between Flet versions where `name` became the positional argument.
*   **Usage:** `SafeIcon("add", size=20)` instead of `ft.Icon(name="add")`.

### `MainLayout`
*   **Location:** `app/frontend/components.py`
*   **Purpose:** Provides a consistent "Shell" for views, handling safe area padding and standard alignment. (Currently integrated into individual views but targeted for abstraction).

### `Wizard Badges`
Custom micro-components used in the **Thermomix Tab** to visualize settings:
*   **Time:** Blue Pill (`bgcolor="blue"`, text white)
*   **Temp:** Amber Pill (`bgcolor="amber"`, text black)
*   **Speed:** Green Pill (`bgcolor="green"`, text white)

---

## 5. Interaction Patterns

### Snackbars
*   **Usage:** Global notifications for transient events.
*   **Pattern:**
    ```python
    page.snack_bar = ft.SnackBar(ft.Text("Message"))
    page.snack_bar.open = True
    page.update()
    ```

### Progress Rings
*   **Usage:** Indeterminate loading for Async tasks.
*   **Rule:** Always pair with a text label explaining *what* is happening (e.g., "Analyzing recipe...", "Uploading...").

### Tab Navigation (Wizard)
*   **Desktop/Tablet:** `ft.Row` of `ft.ElevatedButton`s.
*   **State:** Buttons change `bgcolor` based on the active index (`blue` for active, `grey` for inactive).
