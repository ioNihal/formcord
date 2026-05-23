# Changelog

## 2.0.1
- **FIX**: Added runtime deprecation warning for `v1.x` syntax (`theme`, `content`) to help users smoothly migrate to the V2 `data` API without silent failures.

## 2.0.0
- **BREAKING CHANGE**: Standardized field naming across the board. `content` is now `text`, `theme` is now `embed`, and all arbitrary parameters like `subject`, `email`, and `message` must be placed inside the `data` object.
- **NEW**: Introduced a unified `formcord.send()` method for fully custom notifications.
- **NEW**: The `data` property automatically transforms arbitrary key-value pairs into beautifully formatted Discord embed fields (max 25).

## 1.0.0
- Initial release
- Universal Discord notifications with helpers
- Optional embed theming and content
