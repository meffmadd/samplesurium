# Samplesurium

My Quarto blog.

### Workspaces
This project uses [uv workspaces](https://docs.astral.sh/uv/concepts/workspaces/) to isolate dependencies:
- **Root**: Global dependencies for rendering.
- **`posts/`**: Independent environments for individual post data/analysis.

Run `uv sync` in the respective directory to set up the environment.

### Usage Notes
- **Working in a post**: `cd posts/<name>` then run `uv add` or `uv run`.
- **Venvs**: `uv` manages venvs automatically. If you activate a venv manually, use `uv --active` to silence path mismatch warnings.
