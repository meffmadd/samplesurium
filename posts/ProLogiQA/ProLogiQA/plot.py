import os
import seaborn as sns
import matplotlib.pyplot as plt
from typing import Literal, Tuple
from ProLogiQA.data import load
from collections import Counter

# Set style
sns.set_style("whitegrid")
plt.rcParams["font.size"] = 12

# Type alias
from matplotlib.figure import Figure
from matplotlib.axes import Axes


def plot_error_rates_grid(
    split: Literal["train", "dev", "test"] = "test",
    dir: str = "./oneshot",
) -> Tuple["Figure", Axes]:
    """Plot error rates grid showing categories vs combined categories.

    Rows show reasoning types, columns show error rates for problems that have
    both the row type and each column type (self-reference = that type only).

    Args:
        split: Data split to use ('train', 'dev', or 'test')
        dir: Directory containing oneshot results

    Returns:
        Tuple of (fig, ax) from matplotlib
    """
    import json
    import numpy as np

    df = load(split=split)
    dir = os.path.join(os.path.dirname(__file__), dir)
    oneshot_file = os.path.join(dir, f"{split}.jsonl")

    if not os.path.exists(oneshot_file):
        raise FileNotFoundError(f"Oneshot results not found: {oneshot_file}")

    results = {}
    with open(oneshot_file, "r") as f:
        for line in f:
            data = json.loads(line.strip())
            results[data["id"]] = data["result"]

    reasoning_types = [
        "Categorical Reasoning",
        "Conjunctive Reasoning",
        "Disjunctive Reasoning",
        "Necessry Condtional Reasoning",
        "Sufficient Conditional Reasoning",
    ]

    short_labels = [
        "Categorical",
        "Conjunctive",
        "Disjunctive",
        "Necessary Conditional",
        "Sufficient Conditional",
    ]

    error_grid = {}

    for row_type in reasoning_types:
        for col_type in reasoning_types:
            total = 0
            error = 0
            for _, row in df.iterrows():
                if row["id"] not in results:
                    continue
                if row[row_type] and row[col_type]:
                    total += 1
                    if results[row["id"]] != row["answer"]:
                        error += 1
            if total > 0:
                error_grid[(row_type, col_type)] = (error / total) * 100
            else:
                error_grid[(row_type, col_type)] = 0

    grid_array = np.zeros((len(reasoning_types), len(reasoning_types)))
    for i, row_type in enumerate(reasoning_types):
        for j, col_type in enumerate(reasoning_types):
            grid_array[i, j] = error_grid[(row_type, col_type)]

    fig, ax = plt.subplots(figsize=(10, 8))

    mask = np.triu(np.ones_like(grid_array, dtype=bool), k=1)

    sns.heatmap(
        grid_array,
        mask=mask,
        xticklabels=short_labels,
        yticklabels=short_labels,
        annot=True,
        fmt=".1f",
        cmap="Reds",
        cbar_kws={"label": "Error Rate (%)"},
        ax=ax,
    )

    ax.set_xlabel("Combined With", fontsize=14, fontweight="bold")
    ax.set_ylabel("Reasoning Type", fontsize=14, fontweight="bold")
    ax.set_title(
        f"Oneshot Error Rates by Category Combinations ({split} split)",
        fontsize=16,
        pad=20,
    )

    plt.tight_layout()
    return fig, ax


def plot_error_rates(
    split: Literal["train", "dev", "test"] = "test",
    dir: str = "./oneshot",
) -> Tuple["Figure", Axes]:
    """Plot error rates of oneshot output by reasoning type.

    Args:
        split: Data split to use ('train', 'dev', or 'test')
        dir: Directory containing oneshot results

    Returns:
        Tuple of (fig, ax) from matplotlib
    """
    import json

    df = load(split=split)
    dir = os.path.join(os.path.dirname(__file__), dir)
    oneshot_file = os.path.join(dir, f"{split}.jsonl")

    if not os.path.exists(oneshot_file):
        raise FileNotFoundError(f"Oneshot results not found: {oneshot_file}")

    results = {}
    with open(oneshot_file, "r") as f:
        for line in f:
            data = json.loads(line.strip())
            results[data["id"]] = data["result"]

    reasoning_types = [
        "Categorical Reasoning",
        "Conjunctive Reasoning",
        "Disjunctive Reasoning",
        "Necessry Condtional Reasoning",
        "Sufficient Conditional Reasoning",
    ]

    error_counts = {rt: {"total": 0, "error": 0} for rt in reasoning_types}

    for _, row in df.iterrows():
        if row["id"] not in results:
            continue

        predicted = results[row["id"]]
        correct = row["answer"]

        for rt in reasoning_types:
            if row[rt]:
                error_counts[rt]["total"] += 1
                if predicted != correct:
                    error_counts[rt]["error"] += 1

    error_rates = {
        rt: error_counts[rt]["error"] / error_counts[rt]["total"] * 100
        for rt in reasoning_types
        if error_counts[rt]["total"] > 0
    }

    sorted_types = sorted(
        error_rates.keys(), key=lambda x: error_rates[x], reverse=True
    )

    fig, ax = plt.subplots(figsize=(10, 6))

    colors = sns.color_palette("Reds_r", len(sorted_types))
    bars = ax.barh(
        range(len(sorted_types)), [error_rates[t] for t in sorted_types], color=colors
    )

    ax.set_yticks(range(len(sorted_types)))
    ax.set_yticklabels(
        [t.replace("Reasoning", "").strip() for t in sorted_types], fontsize=11
    )
    ax.set_xlabel("Error Rate (%)", fontsize=14)
    ax.set_title(
        f"Oneshot Error Rates by Reasoning Type ({split} split)",
        fontsize=16,
        fontweight="bold",
    )

    ax.invert_yaxis()
    ax.set_xlim(0, max(error_rates.values()) * 1.1)

    for i, (bar, rate) in enumerate(zip(bars, [error_rates[t] for t in sorted_types])):
        ax.text(
            rate + 0.5,
            i,
            f"{rate:.1f}%",
            va="center",
            fontsize=11,
            fontweight="bold",
        )

    sns.despine(left=False, bottom=True)
    plt.tight_layout()
    return fig, ax


def plot_type_distribution(
    split: Literal["train", "dev", "test"] = "train",
) -> Tuple["Figure", "Axes"]:
    """Create a beautiful seaborn plot of the 'type' column distribution.

    Args:
        split: Data split to use ('train', 'dev', or 'test')

    Returns:
        Tuple of (fig, ax) from matplotlib
    """
    df = load(split=split)

    reasoning_types = [
        "Categorical Reasoning",
        "Conjunctive Reasoning",
        "Disjunctive Reasoning",
        "Necessry Condtional Reasoning",
        "Sufficient Conditional Reasoning",
    ]

    type_counts = Counter()
    _, row = next(df.iterrows())
    for rt in reasoning_types:
        type_counts[rt] = df[rt].sum()

    sorted_types = [
        item[0]
        for item in sorted(type_counts.items(), key=lambda x: x[1], reverse=True)
    ]

    fig, ax = plt.subplots(figsize=(8, 6))

    sns.barplot(
        x=[type_counts[t] for t in sorted_types],
        y=[t.replace("Reasoning", "").strip() for t in sorted_types],
        hue=[t.replace("Reasoning", "").strip() for t in sorted_types],
        palette="viridis",
        legend=False,
        ax=ax,
    )

    ax.set_xlabel("Count", fontsize=14)
    ax.set_ylabel("Reasoning Type", fontsize=14)

    for i, count in enumerate([type_counts[t] for t in sorted_types]):
        ax.text(count + 1, i, str(count), va="center", fontsize=11, fontweight="bold")

    sns.despine(left=True, bottom=True)

    plt.tight_layout()
    return fig, ax


if __name__ == "__main__":
    fig, ax = plot_error_rates("test")
    plt.savefig("error_rates.png", dpi=300, bbox_inches="tight")
    print("Plot saved as error_rates.png")
    plt.show()
